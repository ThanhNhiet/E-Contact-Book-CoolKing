import React, { useState } from 'react';
import { useAuth } from '../../hooks/auth/useAuth';
import { adminService, lecturerService } from '../../services/apiServices';

const ApiTestPage: React.FC = () => {
  const [result, setResult] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(false);
  
  // Sử dụng useAuth hook
  const { login, logout, getUserInfo, getUserRole, isAuthenticated } = useAuth();

  const testLogin = async () => {
    setLoading(true);
    setResult('');
    try {
      const response = await login('ADMIN001', '123456');
      setResult(`✅ Login Success: ${JSON.stringify(response, null, 2)}`);
    } catch (error: any) {
      setResult(`❌ Login Error: ${error.message}`);
    }
    setLoading(false);
  };

  const testLogout = async () => {
    setLoading(true);
    setResult('');
    try {
      const response = await logout();
      setResult(`✅ Logout Success: ${JSON.stringify(response, null, 2)}`);
    } catch (error: any) {
      setResult(`❌ Logout Error: ${error.message}`);
    }
    setLoading(false);
  };

  const testAdminAPI = async () => {
    setLoading(true);
    setResult('');
    try {
      const data = await adminService.getAllAccounts();
      setResult(`✅ Admin API Success: ${JSON.stringify(data, null, 2)}`);
    } catch (error: any) {
      setResult(`❌ Admin API Error: ${error.response?.data?.message || error.message}`);
    }
    setLoading(false);
  };

  const testLecturerAPI = async () => {
    setLoading(true);
    setResult('');
    try {
      const data = await lecturerService.getAllClasses();
      setResult(`✅ Lecturer API Success: ${JSON.stringify(data, null, 2)}`);
    } catch (error: any) {
      setResult(`❌ Lecturer API Error: ${error.response?.data?.message || error.message}`);
    }
    setLoading(false);
  };

  const checkAuthStatus = () => {
    const isAuth = isAuthenticated();
    const userInfo = getUserInfo();
    const role = getUserRole();
    
    setResult(`
Authentication Status: ${isAuth}
User Role: ${role}
User Info: ${JSON.stringify(userInfo, null, 2)}
    `);
  };

  return (
    <div className="min-h-screen bg-gray-100 p-8">
      <div className="max-w-4xl mx-auto">
        <div className="bg-white rounded-lg shadow-lg p-6">
          <h1 className="text-2xl font-bold text-gray-800 mb-6">API Test Page</h1>
          
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-6">
            <button
              onClick={testLogin}
              disabled={loading}
              className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 disabled:bg-gray-400"
            >
              Test Login
            </button>
            
            <button
              onClick={testLogout}
              disabled={loading}
              className="bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700 disabled:bg-gray-400"
            >
              Test Logout
            </button>
            
            <button
              onClick={testAdminAPI}
              disabled={loading}
              className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700 disabled:bg-gray-400"
            >
              Test Admin API
            </button>
            
            <button
              onClick={testLecturerAPI}
              disabled={loading}
              className="bg-purple-600 text-white px-4 py-2 rounded hover:bg-purple-700 disabled:bg-gray-400"
            >
              Test Lecturer API
            </button>
            
            <button
              onClick={checkAuthStatus}
              disabled={loading}
              className="bg-yellow-600 text-white px-4 py-2 rounded hover:bg-yellow-700 disabled:bg-gray-400"
            >
              Check Auth Status
            </button>
          </div>

          <div className="bg-gray-50 rounded-lg p-4">
            <h3 className="text-lg font-semibold mb-2">API Test Result:</h3>
            {loading ? (
              <div className="flex items-center">
                <svg className="animate-spin h-5 w-5 mr-2" viewBox="0 0 24 24">
                  <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" className="opacity-25"></circle>
                  <path fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" className="opacity-75"></path>
                </svg>
                Testing...
              </div>
            ) : (
              <pre className="text-sm text-gray-700 whitespace-pre-wrap">{result || 'Click any button to test API...'}</pre>
            )}
          </div>

          <div className="mt-6 p-4 bg-blue-50 rounded-lg">
            <h3 className="font-semibold text-blue-800 mb-2">API Services Usage:</h3>
            <div className="text-sm text-blue-700 space-y-3">
              <div>
                <strong>Authentication Service:</strong>
                <ul className="ml-4 space-y-1">
                  <li>• authService.login() - POST /api/public/login</li>
                  <li>• authService.logout() - POST /api/public/logout</li>
                </ul>
              </div>
              <div>
                <strong>Admin Service:</strong>
                <ul className="ml-4 space-y-1">
                  <li>• adminService.getAllAccounts() - GET /api/admin/accounts</li>
                  <li>• adminService.getAccountById(id) - GET /api/admin/accounts/:id</li>
                  <li>• adminService.createAccount(data) - POST /api/admin/accounts</li>
                </ul>
              </div>
              <div>
                <strong>Lecturer Service:</strong>
                <ul className="ml-4 space-y-1">
                  <li>• lecturerService.getAllClasses() - GET /api/lecturer/classes</li>
                  <li>• lecturerService.getClassById(id) - GET /api/lecturer/classes/:id</li>
                  <li>• lecturerService.getSchedule() - GET /api/lecturer/schedule</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ApiTestPage;