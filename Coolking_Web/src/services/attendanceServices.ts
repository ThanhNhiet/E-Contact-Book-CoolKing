import axiosInstance from '../configs/axiosConf';

class AttendanceService {
    // GET /api/attendances/students/:course_section_id
    async getStudentsWithAttendance(course_section_id: string) {
        const response = await axiosInstance.get(`/attendances/students/${course_section_id}`);
        return response.data;
    }

    // POST /api/attendances/students/:course_section_id
    async recordAttendance(course_section_id: string, start_lesson: number, end_lesson: number,
        students: { student_id: string, status: string, description?: string }[]) {
        const attendanceData = {
            start_lesson,
            end_lesson,
            students
        };
        const response = await axiosInstance.post(`/attendances/students/${course_section_id}`, attendanceData);
        return response.data;
    }

    // PUT /api/attendances/students/:attendance_id
    async updateAttendance(attendance_id: string, start_lesson: number, end_lesson: number,
        students: { student_id: string, status: string, description?: string }[]) {
        const attendanceData = {
            start_lesson,
            end_lesson,
            students
        };
        const response = await axiosInstance.put(`/attendances/students/${attendance_id}`, attendanceData);
        return response.data;
    }

    // DELETE /api/attendances/students/:attendance_id
    async deleteAttendance(attendance_id: string) {
        const response = await axiosInstance.delete(`/attendances/students/${attendance_id}`);
        return response.data;
    }
}
// Export singleton instance
export const attendanceService = new AttendanceService();
export default attendanceService;