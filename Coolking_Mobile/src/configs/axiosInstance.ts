import AsyncStorage from '@react-native-async-storage/async-storage';
import axios, { AxiosError, AxiosRequestConfig } from 'axios';
import {deleteRefreshToken, getRefreshToken,saveRefreshToken} from "@/src/utils/TokenManager";
//import NavigationService from '../services/NavigationService';

// Axios instance config
const axiosInstance = axios.create({
  timeout: 30000, // 30s
});

// ====== CONFIG ======
const AUTH_ENDPOINT = '/api/public/login';
const REFRESH_ENDPOINT = '/api/public/refresh-token';
const LOGOUT_ENDPOINT = '/api/public/logout';

// ====== Refresh Queue ======
let isRefreshing = false;
let failedQueue: Array<{ resolve: (v?: unknown) => void; reject: (e: any) => void }> = [];

const processQueue = (error: any, token: string | null = null) => {
  failedQueue.forEach(prom => {
    if (error) prom.reject(error);
    else prom.resolve(token as unknown);
  });
  failedQueue = [];
};

// ====== Helpers ======
const isAbsoluteUrl = (url?: string) => !!url && (/^https?:\/\//i.test(url) || url.startsWith('//'));

const shouldSkipAuthHeader = (url?: string) => {
  if (!url) return false;
  // chỉ cần "includes" vì axios có thể set đường dẫn tương đối
  return url.includes(AUTH_ENDPOINT) || url.includes(REFRESH_ENDPOINT);
};

const setAuthHeader = (config: AxiosRequestConfig, token: string) => {
  config.headers = {
    ...(config.headers || {}),
    Authorization: `Bearer ${token}`,
  };
};

// ====== Request Interceptor ======
axiosInstance.interceptors.request.use(
  async (config) => {
    // baseURL động (nếu url chưa phải absolute)
    const base = await AsyncStorage.getItem('url');
    if (base && !isAbsoluteUrl(config.url)) {
      config.baseURL = base;
    }

    // đừng gắn Bearer cho endpoint login & refresh
    if (!shouldSkipAuthHeader(config.url)) {
      const token = await AsyncStorage.getItem('token');
      if (token) setAuthHeader(config, token);
    }

    return config;
  },
  (error) => Promise.reject(error)
);

// ====== Response Interceptor ======
axiosInstance.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    const originalRequest: any = error.config || {}; // any để chứa _retry

    // Timeout
    if ((error as any).code === 'ECONNABORTED' && (error.message || '').includes('timeout')) {
      return Promise.reject({
        message: 'error network',
        code: 'NETWORK_TIMEOUT',
        originalError: error,
      });
    }

    // Không retry login/refresh (tránh vòng lặp)
    const isAuthReq = originalRequest?.url?.includes(AUTH_ENDPOINT);
    const isRefreshReq = originalRequest?.url?.includes(REFRESH_ENDPOINT);
    const isLogoutReq = originalRequest?.url?.includes(LOGOUT_ENDPOINT);

    if (isAuthReq || isRefreshReq || isLogoutReq) {
      return Promise.reject(error);
    }

    // 401: tiến hành refresh-token (nếu chưa retry)
    if (error.response?.status === 401 && !originalRequest._retry) {
      // Nếu đã có refresh đang chạy -> xếp hàng đợi
      if (isRefreshing) {
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject });
        })
          .then(() => axiosInstance(originalRequest))
          .catch((err) => Promise.reject(err));
      }

      originalRequest._retry = true;
      isRefreshing = true;

      try {
        const refreshToken = await getRefreshToken();
        const base = await AsyncStorage.getItem('url');

        if (!refreshToken) throw new Error('No refresh token available');
        if (!base) throw new Error('No base URL configured');

        // GỌI REFRESH (không dùng axiosInstance để tránh interceptor auth)
        const tokenResponse = await axios.post(`${base}${REFRESH_ENDPOINT}`, {
          refresh_token: refreshToken,
        });

        const newAccessToken = (tokenResponse as any)?.data?.access_token;
        const newRefreshToken = (tokenResponse as any)?.data?.refresh_token;

        if (!newAccessToken) throw new Error('No access token received');

        // Lưu token mới
        await AsyncStorage.setItem('token', newAccessToken);
        if (newRefreshToken) await saveRefreshToken(newRefreshToken);

        // Thông báo queue
        processQueue(null, newAccessToken);

        // Gắn token mới cho request cũ rồi retry
        setAuthHeader(originalRequest, newAccessToken);
        return axiosInstance(originalRequest);
      } catch (refreshError) {
        console.warn('Refresh token failed:', refreshError);

        // Xoá token, thông báo queue lỗi
        await AsyncStorage.removeItem('token');
        await deleteRefreshToken();
        processQueue(refreshError, null);

        // Tuỳ bạn: có thể điều hướng về màn Login ở đây
        //NavigationService.navigate('LoginScreen');

        return Promise.reject(error);
      } finally {
        isRefreshing = false;
      }
    }

    return Promise.reject(error);
  }
);

export default axiosInstance;
