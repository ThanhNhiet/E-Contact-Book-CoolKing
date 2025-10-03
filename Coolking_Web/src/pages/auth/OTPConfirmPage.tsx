import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { authService } from '../../services/authService';

interface LocationState {
  method: 'email' | 'phone';
  contact: string;
  message?: string;
}

const OTPConfirmPage: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const state = location.state as LocationState;

  const [otp, setOtp] = useState('');
  const [loading, setLoading] = useState(false);
  const [resendLoading, setResendLoading] = useState(false);
  const [error, setError] = useState<string>('');
  const [countdown, setCountdown] = useState(180); // 3 minutes
  const [success, setSuccess] = useState<string>('');

  // Redirect if no state
  useEffect(() => {
    if (!state?.method || !state?.contact) {
      navigate('/forgot-password');
    }
  }, [state, navigate]);

  // Countdown timer
  useEffect(() => {
    if (countdown > 0) {
      const timer = setTimeout(() => setCountdown(countdown - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [countdown]);

  const formatTime = (seconds: number): string => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  const handleOtpChange = (value: string) => {
    // Only allow numbers and max 6 digits
    const numericValue = value.replace(/[^0-9]/g, '').slice(0, 6);
    setOtp(numericValue);
    setError('');
  };

  const handleVerifyOtp = async () => {
    if (otp.length !== 6) {
      setError('Vui lòng nhập đầy đủ 6 chữ số');
      return;
    }

    setLoading(true);
    setError('');

    try {
      let response;
      if (state.method === 'email') {
        response = await authService.verifyOtpEmail(state.contact, otp);
      } else if (state.method === 'phone') {
        response = await authService.verifyOtpPhone(state.contact, otp);
      }

      if (response?.success && response?.data?.resetToken) {
        // Save resetToken to localStorage
        localStorage.setItem('resetToken', response.data.resetToken);
        
        setSuccess('Xác thực thành công!');
        
        // Navigate to change password page
        setTimeout(() => {
          navigate('/change-password', {
            state: {
              method: state.method,
              contact: state.contact
            }
          });
        }, 1000);
      } else {
        setError(response?.message || 'Mã OTP không chính xác');
      }
    } catch (error: any) {
      setError(error.response?.data?.message || 'Mã OTP không chính xác');
    } finally {
      setLoading(false);
    }
  };

  const handleResendOtp = async () => {
    setResendLoading(true);
    setError('');

    try {
      let response;
      if (state.method === 'email') {
        response = await authService.checkEmail(state.contact);
      } else if (state.method === 'phone') {
        response = await authService.checkPhone(state.contact);
      }

      if (response?.success) {
        setSuccess('Mã xác thực đã được gửi lại!');
        setCountdown(180); // Reset countdown
        setOtp(''); // Clear current OTP
        setTimeout(() => setSuccess(''), 3000);
      } else {
        setError('Không thể gửi lại mã xác thực');
      }
    } catch (error: any) {
      setError('Không thể gửi lại mã xác thực');
    } finally {
      setResendLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && otp.length === 6 && !loading) {
      handleVerifyOtp();
    }
  };

  if (!state) {
    return null; // Will redirect in useEffect
  }

  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-xl p-8 w-full max-w-md">
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
            </svg>
          </div>
          <h1 className="text-3xl font-bold text-gray-800 mb-2">Xác thực OTP</h1>
          <p className="text-gray-600 mb-2">
            Nhập mã 6 chữ số được gửi đến
          </p>
          <p className="text-blue-600 font-semibold">
            {state.method === 'email' ? '📧 ' : '📱 '}{state.contact}
          </p>
        </div>

        {state.message && (
          <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-xl mb-6">
            {state.message}
          </div>
        )}

        {success && (
          <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-xl mb-6">
            {success}
          </div>
        )}

        <div className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Mã xác thực OTP
            </label>
            <input
              type="number"
              value={otp}
              onChange={(e) => handleOtpChange(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="000000"
              className="w-full px-4 py-4 text-center text-2xl font-mono border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition duration-200 tracking-widest"
              maxLength={6}
            />
            <p className="text-xs text-gray-500 mt-1 text-center">
              Nhập 6 chữ số từ tin nhắn bạn nhận được
            </p>
          </div>

          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl">
              {error}
            </div>
          )}

          <button
            onClick={handleVerifyOtp}
            disabled={loading || otp.length !== 6}
            className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white font-semibold py-3 px-6 rounded-xl transition duration-200 flex items-center justify-center space-x-2"
          >
            {loading ? (
              <>
                <svg className="animate-spin h-4 w-4" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                <span>Đang xác thực...</span>
              </>
            ) : (
              <span>Xác nhận</span>
            )}
          </button>

          <div className="text-center space-y-3">
            <div className="text-sm text-gray-600">
              Hiệu lực: <span className="font-mono font-semibold text-blue-600">{formatTime(countdown)}</span>
            </div>
            
            <button
              onClick={handleResendOtp}
              disabled={resendLoading || countdown > 0}
              className="text-blue-600 hover:text-blue-700 disabled:text-gray-400 disabled:cursor-not-allowed font-semibold transition duration-200 flex items-center justify-center space-x-2 mx-auto"
            >
              {resendLoading ? (
                <>
                  <svg className="animate-spin h-4 w-4" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  <span>Đang gửi...</span>
                </>
              ) : (
                <span>Gửi lại mã xác thực</span>
              )}
            </button>
          </div>

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

export default OTPConfirmPage;
