import axiosInstance from "../configs/axiosConf";

class StudentServices {
    // GET /api/students/class-score-view/{course_section_id}
    async getStudentsByCourseSection(course_section_id: string) {
        const response = await axiosInstance.get(`/students/class-score-view/${course_section_id}`);
        return response.data;
    }

    // GET /api/students/info-view-le-ad/{studentId}
    async getStudentInfo(studentId: string) {
        const response = await axiosInstance.get(`/students/info-view-le-ad/${studentId}`);
        return response.data;
    }
};
export const studentServices = new StudentServices();
export default StudentServices;