import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';

// Axios instance configuration
const axiosInstance = axios.create({
  timeout: 30000, // 30 seconds
});

// Flag to prevent multiple simultaneous refresh attempts
let isRefreshing = false;
let failedQueue: Array<{ resolve: (v?: unknown) => void; reject: (e: any) => void }> = [];

const processQueue = (error: any, token: string | null = null) => {
  failedQueue.forEach(prom => {
    if (error) prom.reject(error);
    else prom.resolve(token as unknown);
  });
  failedQueue = [];
};

// ====== CONFIG ======
const AUTH_ENDPOINT = '/api/public/login'; // <— thay vì /Api/access_token
const REFRESH_ENDPOINT = '/api/public/refresh-token'; // <— thay vì /Api/refresh_token

// Add request interceptor
axiosInstance.interceptors.request.use(
  async (config) => {
    // dynamic baseURL
    const url = await AsyncStorage.getItem('url');
    if (url) {
      config.baseURL = url;
    }

    // đừng gắn Bearer cho chính endpoint auth
    const isAuthEndpoint = config.url?.includes(AUTH_ENDPOINT);
    const token = await AsyncStorage.getItem('token');
    if (!isAuthEndpoint && token) {
      if (config.headers) {
        config.headers['Authorization'] = `Bearer ${token}`;
      }
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Add response interceptor
axiosInstance.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;
    const isAuthEndpoint = originalRequest?.url?.includes(AUTH_ENDPOINT);

    // Handle timeout error
    if (error.code === 'ECONNABORTED' && error.message?.includes('timeout')) {
      return Promise.reject({
        message: 'error network',
        code: 'NETWORK_TIMEOUT',
        originalError: error,
      });
    }

    // Không retry cho chính endpoint auth
    if (isAuthEndpoint) {
      return Promise.reject(error);
    }

    // 401 -> refresh token flow qua /api/public/login
    if (error.response?.status === 401 && !originalRequest._retry) {
      if (isRefreshing) {
        // đã có refresh đang chạy -> đưa vào hàng đợi
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject });
        })
          .then(() => axiosInstance(originalRequest))
          .catch((err) => Promise.reject(err));
      }

      originalRequest._retry = true;
      isRefreshing = true;

      try {
        const refreshToken = await AsyncStorage.getItem('refreshToken');
        if (!refreshToken) {
          throw new Error('No refresh token available');
        }

        const base = await AsyncStorage.getItem('url');
        if (!base) {
          throw new Error('No base URL configured');
        }

        // 🔁 REFRESH TOKEN bằng /api/public/refresh-token
        // CHÚ Ý: body này phụ thuộc backend của bạn.
        // Nếu backend yêu cầu khác, hãy chỉnh lại payload cho đúng.
        const tokenResponse = await axios.post(`${base}${REFRESH_ENDPOINT}`, {
          grant_type: 'refresh_token',
          refresh_token: refreshToken,
        });

        const newAccessToken = tokenResponse?.data?.access_token;
        const newRefreshToken = tokenResponse?.data?.refresh_token;

        if (!newAccessToken) {
          throw new Error('No access token received');
        }

        // Lưu token mới
        await AsyncStorage.setItem('token', newAccessToken);
        if (newRefreshToken) {
          await AsyncStorage.setItem('refreshToken', newRefreshToken);
        }

        // giải phóng hàng đợi
        processQueue(null, newAccessToken);

        // gắn token mới vào request cũ
        originalRequest.headers = {
          ...(originalRequest.headers || {}),
          Authorization: `Bearer ${newAccessToken}`,
        };

        // retry request cũ
        return axiosInstance(originalRequest);
      } catch (refreshError) {
        console.warn('Refresh token failed:', refreshError);

        // xoá token lỗi
        await AsyncStorage.removeItem('token');
        await AsyncStorage.removeItem('refreshToken');

        // thông báo thất bại tới hàng đợi
        processQueue(refreshError, null);

        // trả về lỗi gốc 401
        return Promise.reject(error);
      } finally {
        isRefreshing = false;
      }
    }

    return Promise.reject(error);
  }
);

export default axiosInstance;
