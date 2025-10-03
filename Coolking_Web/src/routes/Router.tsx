import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import LoginPage from '../pages/auth/LoginPage';
import ForgotPasswordPage from '../pages/auth/ForgotPasswordPage';
import OTPConfirmPage from '../pages/auth/OTPConfirmPage';
import ChangePasswordPage from '../pages/auth/ChangePasswordPage';
import AccountDbPage from '../pages/admin/Account/AccountsDashboardPage';
import ClazzListPage from '../pages/lecturer/clazz/ClazzListPage';
import SchedulePage from '../pages/lecturer/schedule/SchedulePage';
import ApiTestPage from '../pages/test/ApiTestPage';
import ProtectedRoute from '../components/auth/ProtectedRoute';

const Router: React.FC = () => {
  return (
    <BrowserRouter>
      <Routes>
        {/* Public routes - không cần bearer token */}
        <Route path="/" element={<LoginPage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/forgot-password" element={<ForgotPasswordPage />} />
        <Route path="/otp-confirm" element={<OTPConfirmPage />} />
        <Route path="/change-password" element={<ChangePasswordPage />} />
        <Route path="/test" element={<ApiTestPage />} />
        
        {/* Admin routes - cần bearer token và role admin */}
        <Route 
          path="/admin/accounts" 
          element={
            <ProtectedRoute requiredRole="ADMIN">
              <AccountDbPage />
            </ProtectedRoute>
          } 
        />
        
        {/* Lecturer routes - cần bearer token và role lecturer */}
        <Route 
          path="/lecturer/clazz" 
          element={
            <ProtectedRoute requiredRole="LECTURER">
              <ClazzListPage />
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/lecturer/schedule" 
          element={
            <ProtectedRoute requiredRole="LECTURER">
              <SchedulePage />
            </ProtectedRoute>
          } 
        />
        
        {/* Redirect any unknown routes to login */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
};

export default Router;