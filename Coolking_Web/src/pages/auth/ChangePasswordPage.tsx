import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { authService } from '../../services/authService';

interface LocationState {
  method: 'email' | 'phone';
  contact: string;
}

const ChangePasswordPage: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const state = location.state as LocationState;

  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string>('');
  const [success, setSuccess] = useState<string>('');
  const [countdown, setCountdown] = useState(300); // 5 minutes
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  // Redirect if no state or no resetToken
  useEffect(() => {
    const resetToken = localStorage.getItem('resetToken');
    if (!state?.method || !state?.contact || !resetToken) {
      navigate('/forgot-password');
    }
  }, [state, navigate]);

  // Countdown timer for resetToken expiry
  useEffect(() => {
    if (countdown > 0) {
      const timer = setTimeout(() => setCountdown(countdown - 1), 1000);
      return () => clearTimeout(timer);
    } else {
      // Token expired
      localStorage.removeItem('resetToken');
      alert('Token xác thực đã hết hạn');
      navigate('/forgot-password');
    }
  }, [countdown, navigate]);

  const formatTime = (seconds: number): string => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  const validatePassword = (password: string): { isValid: boolean; errors: string[] } => {
    const errors: string[] = [];
    
    if (password.length < 8) {
      errors.push('Tối thiểu 8 ký tự');
    }
    
    if (!/[a-zA-Z]/.test(password)) {
      errors.push('Ít nhất 1 chữ cái');
    }
    
    if (!/[0-9]/.test(password)) {
      errors.push('Ít nhất 1 chữ số');
    }
    
    if (!/[^a-zA-Z0-9]/.test(password)) {
      errors.push('Ít nhất 1 ký tự đặc biệt');
    }
    
    return { isValid: errors.length === 0, errors };
  };

  const handlePasswordChange = (value: string) => {
    setNewPassword(value);
    setError('');
  };

  const handleConfirmPasswordChange = (value: string) => {
    setConfirmPassword(value);
    setError('');
  };

  const handleChangePassword = async () => {
    // Validate new password
    const passwordValidation = validatePassword(newPassword);
    if (!passwordValidation.isValid) {
      setError(`Mật khẩu không hợp lệ: ${passwordValidation.errors.join(', ')}`);
      return;
    }

    // Check password confirmation
    if (newPassword !== confirmPassword) {
      setError('Mật khẩu xác nhận không khớp');
      return;
    }

    setLoading(true);
    setError('');

    try {
      let response;
      if (state.method === 'email') {
        response = await authService.changePasswordByEmail(state.contact, newPassword);
      } else if (state.method === 'phone') {
        response = await authService.changePasswordByPhone(state.contact, newPassword);
      }

      if (response?.success) {
        localStorage.removeItem('resetToken'); // Clear resetToken
        setSuccess('Đổi mật khẩu thành công!');
        
        setTimeout(() => {
          navigate('/login', {
            state: { message: 'Mật khẩu đã được thay đổi. Vui lòng đăng nhập với mật khẩu mới.' }
          });
        }, 2000);
      } else {
        setError(response?.message || 'Có lỗi xảy ra khi đổi mật khẩu');
      }
    } catch (error: any) {
      if (error.response?.status === 401) {
        setError('Token đã hết hạn. Vui lòng thực hiện lại từ đầu.');
        localStorage.removeItem('resetToken');
        setTimeout(() => navigate('/forgot-password'), 2000);
      } else {
        setError(error.response?.data?.message || 'Có lỗi xảy ra khi đổi mật khẩu');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && newPassword && confirmPassword && !loading) {
      handleChangePassword();
    }
  };

  if (!state) {
    return null; // Will redirect in useEffect
  }

  const passwordValidation = validatePassword(newPassword);

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-xl p-8 w-full max-w-md">
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z" />
            </svg>
          </div>
          <h1 className="text-3xl font-bold text-gray-800 mb-2">Đổi mật khẩu</h1>
          <p className="text-gray-600 mb-2">
            Tạo mật khẩu mới cho tài khoản
          </p>
          <p className="text-blue-600 font-semibold">
            {state.method === 'email' ? '📧 ' : '📱 '}{state.contact}
          </p>
        </div>

        {/* Countdown Timer */}
        <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-4 mb-6">
          <div className="text-center">
            <p className="text-yellow-800 text-sm font-medium">Thời gian còn lại</p>
            <p className="text-yellow-900 text-xl font-mono font-bold">{formatTime(countdown)}</p>
            <p className="text-yellow-700 text-xs">Token sẽ hết hạn sau thời gian trên</p>
          </div>
        </div>

        {success && (
          <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-xl mb-6">
            {success}
          </div>
        )}

        <div className="space-y-6">
          {/* New Password */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Mật khẩu mới
            </label>
            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'}
                value={newPassword}
                onChange={(e) => handlePasswordChange(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="Nhập mật khẩu mới"
                className="w-full px-4 py-3 pr-12 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition duration-200"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  {showPassword ? (
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.878 9.878L3 3m6.878 6.878L21 21" />
                  ) : (
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                  )}
                </svg>
              </button>
            </div>
            {/* Password Requirements */}
            {newPassword && (
              <div className="mt-2 text-xs space-y-1">
                <div className={`flex items-center space-x-1 ${passwordValidation.isValid ? 'text-green-600' : 'text-red-600'}`}>
                  <span>Yêu cầu mật khẩu:</span>
                </div>
                {passwordValidation.errors.map((error, index) => (
                  <div key={index} className="flex items-center space-x-1 text-red-600">
                    <span>• {error}</span>
                  </div>
                ))}
                {passwordValidation.isValid && (
                  <div className="flex items-center space-x-1 text-green-600">
                    <span>✓ Mật khẩu hợp lệ</span>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Confirm Password */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Nhập lại mật khẩu mới
            </label>
            <div className="relative">
              <input
                type={showConfirmPassword ? 'text' : 'password'}
                value={confirmPassword}
                onChange={(e) => handleConfirmPasswordChange(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="Nhập lại mật khẩu mới"
                className="w-full px-4 py-3 pr-12 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition duration-200"
              />
              <button
                type="button"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  {showConfirmPassword ? (
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.878 9.878L3 3m6.878 6.878L21 21" />
                  ) : (
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                  )}
                </svg>
              </button>
            </div>
            {confirmPassword && (
              <div className="mt-2 text-xs">
                {newPassword === confirmPassword ? (
                  <span className="text-green-600">✓ Mật khẩu khớp</span>
                ) : (
                  <span className="text-red-600">✗ Mật khẩu không khớp</span>
                )}
              </div>
            )}
          </div>

          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl">
              {error}
            </div>
          )}

          <button
            onClick={handleChangePassword}
            disabled={loading || !passwordValidation.isValid || newPassword !== confirmPassword}
            className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white font-semibold py-3 px-6 rounded-xl transition duration-200 flex items-center justify-center space-x-2"
          >
            {loading ? (
              <>
                <svg className="animate-spin h-4 w-4" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                <span>Đang thay đổi...</span>
              </>
            ) : (
              <span>Thay đổi mật khẩu</span>
            )}
          </button>

          <button
            onClick={() => navigate('/forgot-password')}
            className="w-full bg-gray-200 hover:bg-gray-300 text-gray-700 font-semibold py-3 px-6 rounded-xl transition duration-200"
          >
            Quay lại
          </button>
        </div>
      </div>
    </div>
  );
};

export default ChangePasswordPage;
