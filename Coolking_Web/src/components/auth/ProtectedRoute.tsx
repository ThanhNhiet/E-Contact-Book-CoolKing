import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../hooks/auth/useAuth';

interface ProtectedRouteProps {
  children: React.ReactNode;
  requiredRole?: 'ADMIN' | 'LECTURER';
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children, requiredRole }) => {
  const location = useLocation();
  const { isAuthenticated, getUserRole } = useAuth();
  
  if (!isAuthenticated()) {
    // Redirect to login with return url
    return <Navigate to="/login" state={{ from: location }} replace />;
  }
  
  // Kiểm tra role nếu cần
  if (requiredRole) {
    const userRole = getUserRole();
    
    if (userRole !== requiredRole) {
      // Redirect to appropriate dashboard based on user role
      const redirectPath = userRole === 'ADMIN' ? '/admin/accounts' : '/lecturer/clazz';
      return <Navigate to={redirectPath} replace />;
    }
  }
  
  return <>{children}</>;
};

export default ProtectedRoute;