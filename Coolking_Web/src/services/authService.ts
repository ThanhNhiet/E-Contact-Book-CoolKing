import axiosInstance, { TokenManager } from '../configs/axiosConf';

class AuthService {
  // POST /api/public/login
  async login(username: string, password: string) {
    const response = await axiosInstance.post('/public/login', {
      username: username,
      password: password
    });
    return response.data;
  }

  // POST /api/public/logout
  // Đặc biệt: logout có thể cần bearer token để server invalidate token
  async logout() {
    const accessToken = TokenManager.getToken();
    const refreshToken = TokenManager.getRefreshToken();
    
    // Nếu không có token nào, chỉ logout local
    if (!accessToken && !refreshToken) {
      return { message: 'Đăng xuất thành công (local only)' };
    }
    
    try {
      // Tạo config với bearer token nếu có
      const config: any = {};
      if (accessToken) {
        config.headers = {
          'Authorization': `Bearer ${accessToken}`
        };
      }
      
      // Gửi request với refresh_token trong body và bearer token trong header
      const response = await axiosInstance.post('/public/logout', {
        refresh_token: refreshToken
      }, config);
      
      return response.data;
    } catch (error: any) {
      // Nếu server trả lỗi, vẫn logout local để user không bị stuck
      console.warn('Server logout failed, but clearing local tokens:', error.message);
      return { 
        message: 'Đăng xuất thành công (server error, but local cleared)',
        serverError: error.message 
      };
    }
  }

  isValidToken(): boolean {
    return TokenManager.hasValidToken();
  }

  /**
   * Lấy thông tin từ token
   */
  parseToken() {
    const token = TokenManager.getToken();
    if (!token) return null;
    
    try {
      return JSON.parse(atob(token.split('.')[1]));
    } catch {
      return null;
    }
  }

  /**
   * Token management methods
   */
  saveTokens(accessToken: string, refreshToken: string): void {
    TokenManager.setToken(accessToken);
    TokenManager.setRefreshToken(refreshToken);
  }

  clearTokens(): void {
    TokenManager.removeTokens();
  }

  getToken(): string | null {
    return TokenManager.getToken();
  }
}

// Export singleton instance
export const authService = new AuthService();
export default authService;