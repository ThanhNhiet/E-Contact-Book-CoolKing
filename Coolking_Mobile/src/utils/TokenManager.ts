import * as SecureStore from 'expo-secure-store';

const REFRESH_TOKEN_KEY = 'refreshToken'; // Dùng hằng số để tránh gõ sai

// --- Hàm lưu refresh token ---
export async function saveRefreshToken(refreshToken: string) {
  try {
    await SecureStore.setItemAsync(REFRESH_TOKEN_KEY, refreshToken);
    console.log('✅ Refresh token đã được lưu an toàn.');
  } catch (error) {
    console.error('Lỗi khi lưu refresh token:', error);
  }
}

// --- Hàm đọc refresh token ---
export async function getRefreshToken() {
  try {
    const token = await SecureStore.getItemAsync(REFRESH_TOKEN_KEY);
    return token; // Sẽ trả về null nếu không tìm thấy
  } catch (error) {
    console.error('Lỗi khi đọc refresh token:', error);
    return null;
  }
}

// --- Hàm xóa refresh token (khi logout) ---
export async function deleteRefreshToken() {
  try {
    await SecureStore.deleteItemAsync(REFRESH_TOKEN_KEY);
    console.log('✅ Refresh token đã được xóa.');
  } catch (error) {
    console.error('Lỗi khi xóa refresh token:', error);
  }
}