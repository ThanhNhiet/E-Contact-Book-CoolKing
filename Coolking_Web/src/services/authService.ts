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

  // POST /api/public/check-email/{email}
  async checkEmail(email: string) {
    const response = await axiosInstance.post(`/public/check-email/${email}`);
    return response.data;
  }

  // POST /api/public/check-phone-number/{phoneNumber}
  async checkPhone(phone: string) {
    const response = await axiosInstance.post(`/public/check-phone-number/${phone}`);
    return response.data;
  }

  // /api/public/verify-otp-email
  async verifyOtpEmail(email: string, otp: string) {
    const response = await axiosInstance.post('/public/verify-otp-email', {
      email,
      otp
    });
    return response.data;
  }

  // /api/public/verify-otp-phone
  async verifyOtpPhone(phone: string, otp: string) {
    const response = await axiosInstance.post('/public/verify-otp-phone', {
      phoneNumber: phone,
      otp
    });
    return response.data;
  }

  // /api/public/change-password-by-email
  async changePasswordByEmail(email: string, newPassword: string) {
    const resetToken = localStorage.getItem('resetToken');
    const response = await axiosInstance.post('/public/change-password-by-email', {
      email,
      resetToken,
      newPassword
    });
    return response.data;
  }

  // /api/public/change-password-by-phone
  async changePasswordByPhone(phone: string, newPassword: string) {
    const resetToken = localStorage.getItem('resetToken');
    const response = await axiosInstance.post('/public/change-password-by-phone', {
      phoneNumber: phone,
      resetToken,
      newPassword
    });
    return response.data;
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