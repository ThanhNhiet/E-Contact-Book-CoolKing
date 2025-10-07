import axiosInstance from '../configs/axiosConf';

class LecturerService {
   // GET /api/lecturers/info
   async getLecturerInfo() {
        const response = await axiosInstance.get('/lecturers/info');
        return response.data;
    }

    // PUT /api/lecturers/info
    async updateLecturerInfo(name: string, dob: string, gender: boolean, phone: string, email: string, address: string) {
        const data = { name, dob, gender, phone, email, address };
        const response = await axiosInstance.put('/lecturers/info', data);
        return response.data;
    }

    // POST /api/lecturers/avatar
    async updateLecturerAvatar(file: File) {
        const formData = new FormData();
        formData.append('avatar', file);

        const response = await axiosInstance.post('/lecturers/avatar', formData, {
            headers: {
                'Content-Type': 'multipart/form-data'
            }
        });
        return response.data;
    }
}

export const lecturerService = new LecturerService();
export default lecturerService;