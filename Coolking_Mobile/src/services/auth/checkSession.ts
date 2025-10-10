import AsyncStorage from "@react-native-async-storage/async-storage";
import axios from "axios";

const REFRESH_ENDPOINT = "/api/public/refresh-token";

/**
 * Kiểm tra và refresh token tự động khi app mở
 * @returns true nếu refresh thành công (còn phiên), false nếu hết hạn
 */
export const checkAndRefreshSession = async (): Promise<boolean> => {
  try {
    const base = await AsyncStorage.getItem("url");
    const refreshToken = await AsyncStorage.getItem("refreshToken");

    if (!base || !refreshToken) return false;

    // Gọi API refresh (dùng axios thường, không qua interceptor)
    const res = await axios.post(`${base}${REFRESH_ENDPOINT}`, {
      grant_type: "refresh_token",
      refresh_token: refreshToken,
    });

    const newAccessToken = res?.data?.access_token;
    const newRefreshToken = res?.data?.refresh_token;

    if (!newAccessToken) return false;

    // ✅ Lưu token mới
    await AsyncStorage.setItem("token", newAccessToken);
    if (newRefreshToken) await AsyncStorage.setItem("refreshToken", newRefreshToken);
    return true;
  } catch (error) {
    console.warn("⚠️ Refresh token hết hạn hoặc lỗi:", error);

    // ❌ Xóa token hết hạn
    await AsyncStorage.removeItem("token");
    await AsyncStorage.removeItem("refreshToken");
    return false;
  }
};
