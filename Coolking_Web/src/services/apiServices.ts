import axiosInstance from '../configs/axiosConf';

// Example Admin Service
export class AdminService {
  // GET /api/admin/accounts
  async getAllAccounts(params?: any) {
    const response = await axiosInstance.get('/admin/accounts', { params });
    return response.data;
  }

  // GET /api/admin/accounts/:id
  async getAccountById(id: string) {
    const response = await axiosInstance.get(`/admin/accounts/${id}`);
    return response.data;
  }

  // POST /api/admin/accounts
  async createAccount(data: any) {
    const response = await axiosInstance.post('/admin/accounts', data);
    return response.data;
  }

  // PUT /api/admin/accounts/:id
  async updateAccount(id: string, data: any) {
    const response = await axiosInstance.put(`/admin/accounts/${id}`, data);
    return response.data;
  }

  // DELETE /api/admin/accounts/:id
  async deleteAccount(id: string) {
    const response = await axiosInstance.delete(`/admin/accounts/${id}`);
    return response.data;
  }
}

// Example Lecturer Service
export class LecturerService {
  // GET /api/lecturer/classes
  async getAllClasses(params?: any) {
    const response = await axiosInstance.get('/lecturer/classes', { params });
    return response.data;
  }

  // GET /api/lecturer/classes/:id
  async getClassById(id: string) {
    const response = await axiosInstance.get(`/lecturer/classes/${id}`);
    return response.data;
  }

  // GET /api/lecturer/schedule
  async getSchedule(params?: any) {
    const response = await axiosInstance.get('/lecturer/schedule', { params });
    return response.data;
  }
}

// Export singleton instances
export const adminService = new AdminService();
export const lecturerService = new LecturerService();