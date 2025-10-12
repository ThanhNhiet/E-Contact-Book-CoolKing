import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import LoginPage from '../pages/auth/LoginPage';
import ForgotPasswordPage from '../pages/auth/ForgotPasswordPage';
import OTPConfirmPage from '../pages/auth/OTPConfirmPage';
import ChangePasswordPage from '../pages/auth/ChangePasswordPage';
import AccountDbPage from '../pages/admin/account/AccountsDashboardPage';
import ClazzListPage from '../pages/lecturer/clazz/ClazzListPage';
import SchedulePage from '../pages/lecturer/schedule/SchedulePage';
import ProtectedRoute from '../components/auth/ProtectedRoute';
import AlertDbPage from '../pages/admin/alert/AlertDashboardPage';
import ChatDbPage from '../pages/admin/chat/ChatDashboardPage';
import CourseSectionSLPage from '../pages/admin/chat/CourseSectionSLPage';
import StatisticsMainPage from '../pages/admin/statistics/StatisticsMainPage';
import ProfileInfoPage from '../pages/lecturer/profile/ProfileInfoPage';
import StudentListWithScorePage from '../pages/lecturer/clazz/StudentListWithScorePage';
import AlertListPage from '../pages/lecturer/alert/AlertListPage';

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
        
        {/* Admin routes - cần bearer token và role admin */}
        <Route 
          path="/admin/accounts" 
          element={
            <ProtectedRoute requiredRole="ADMIN">
              <AccountDbPage />
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/admin/alerts" 
          element={
            <ProtectedRoute requiredRole="ADMIN">
              <AlertDbPage />
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/admin/chat/course-sections" 
          element={
            <ProtectedRoute requiredRole="ADMIN">
              <CourseSectionSLPage />
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/admin/chats" 
          element={
            <ProtectedRoute requiredRole="ADMIN">
              <ChatDbPage />
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/admin/statistics"
          element={
            <ProtectedRoute requiredRole="ADMIN">
              <StatisticsMainPage />
            </ProtectedRoute>
          } 
        />

        {/* Lecturer routes - cần bearer token và role lecturer */}
        <Route 
          path="/lecturer/profile" 
          element={
            <ProtectedRoute requiredRole="LECTURER">
              <ProfileInfoPage />
            </ProtectedRoute>
          } 
        />
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
        <Route 
          path="/lecturer/clazz/students/:course_section_id" 
          element={
            <ProtectedRoute requiredRole="LECTURER">
              <StudentListWithScorePage />
            </ProtectedRoute>
          }
        />
        <Route 
          path="/lecturer/alerts" 
          element={
            <ProtectedRoute requiredRole="LECTURER">
              <AlertListPage />
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