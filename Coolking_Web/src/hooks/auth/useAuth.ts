import { useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import authService from '../../services/authService';

export interface UserInfo {
  id: string;
  user_id: string;
  role: 'ADMIN' | 'LECTURER' | 'STUDENT' | 'PARENT';
  email?: string;
  name?: string;
  iat: number;
  exp: number;
}

export const useAuth = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string>('');
  const navigate = useNavigate();

  // Kiểm tra trạng thái authentication
  const isAuthenticated = useCallback((): boolean => {
    return authService.isValidToken();
  }, []);

  // Lấy thông tin user
  const getUserInfo = useCallback((): UserInfo | null => {
    const payload = authService.parseToken();
    if (!payload) return null;

    return {
      id: payload.id,
      user_id: payload.user_id,
      role: payload.role,
      email: payload.email,
      name: payload.name,
      iat: payload.iat,
      exp: payload.exp,
    };
  }, []);

  // Lấy role của user
  const getUserRole = useCallback((): 'ADMIN' | 'LECTURER' | 'STUDENT' | 'PARENT' | null => {
    const userInfo = getUserInfo();
    return userInfo?.role || null;
  }, [getUserInfo]);

  // Kiểm tra role
  const isAdmin = useCallback(() => getUserRole() === 'ADMIN', [getUserRole]);
  const isLecturer = useCallback(() => getUserRole() === 'LECTURER', [getUserRole]);
  const isStudent = useCallback(() => getUserRole() === 'STUDENT', [getUserRole]);

  // Đăng nhập
  const login = useCallback(async (username: string, password: string) => {
    try {
      setLoading(true);
      setError('');
      
      // Gọi API login
      const data = await authService.login(username, password);
      
      // Lưu tokens
      authService.saveTokens(data.access_token, data.refresh_token);
      console.log('Tokens saved:', { accessToken: authService.getToken() });
      
      console.log('Login successful:', data.message);
      
      // Redirect dựa trên role
      const role = getUserRole();
      if (role === 'ADMIN') {
        navigate('/admin/accounts');
      } else if (role === 'LECTURER') {
        navigate('/lecturer/clazz');
      } else {
        const errorMessage = 'Phiên bản web hiện tại chỉ hỗ trợ Admin và Giảng viên. Vui lòng sử dụng ứng dụng di động để đăng nhập với tài khoản Sinh viên hoặc Phụ huynh.';
        setError(errorMessage);
        authService.clearTokens();
      }
      
      return data;
    } catch (err: any) {
      const errorMessage = err.response?.data?.message || err.message || 'Đăng nhập thất bại';
      setError(errorMessage);
      console.error('Login error:', err);
      throw new Error(errorMessage);
    } finally {
      setLoading(false);
    }
  }, [navigate, getUserRole]);

  // Đăng xuất
  const logout = useCallback(async () => {
    try {
      setLoading(true);
      setError('');
      
      // Gọi API logout
      const data = await authService.logout();
      
      // Xóa tokens
      authService.clearTokens();
      console.log('tokens cleared: ', authService.getToken());
      
      console.log('Logout successful:', data.message);
      
      // Redirect về login
      navigate('/login');
      
      return data;
    } catch (err: any) {
      const errorMessage = err.response?.data?.message || err.message || 'Đăng xuất thất bại';
      setError(errorMessage);
      console.error('Logout error:', err);
      
      // Vẫn xóa tokens dù API lỗi
      authService.clearTokens();
      navigate('/login');
      
      throw new Error(errorMessage);
    } finally {
      setLoading(false);
    }
  }, [navigate]);

  // Force logout (không gọi API)
  const forceLogout = useCallback(() => {
    authService.clearTokens();
    navigate('/login');
  }, [navigate]);

  // Clear error
  const clearError = useCallback(() => {
    setError('');
  }, []);

  return {
    // State
    loading,
    error,
    
    // Authentication methods
    login,
    logout,
    forceLogout,
    
    // Auth status
    isAuthenticated,
    getUserInfo,
    getUserRole,
    isAdmin,
    isLecturer,
    isStudent,
    
    // Utility
    clearError,
  };
};