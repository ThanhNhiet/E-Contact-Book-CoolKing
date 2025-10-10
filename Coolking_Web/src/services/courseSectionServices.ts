import axiosInstance from "../configs/axiosConf";

class CourseSectionServices {
    // GET /api/coursesections/lecturer?page=1&pageSize=10
    async getCourseSectionsByLecturer(page: number, pageSize: number) {
        const response = await axiosInstance.get(`/coursesections/lecturer`, {
            params: {
                page,
                pageSize
            }
        });
        return response.data;
    }

    // GET /api/coursesections/lecturer/search?keyword=&page=1&pageSize=10
    async searchCourseSectionsByKeyword(keyword: string, page: number, pageSize: number) {
        const response = await axiosInstance.get(`/coursesections/lecturer/search`, {
            params: {
                keyword,
                page,
                pageSize
            }
        });
        return response.data;
    }

    // GET /api/coursesections/lecturer/filter?session=&faculty=&page=1&pageSize=10
    async filterCourseSectionsByLecturer(session: string, faculty: string, page: number, pageSize: number) {
        const response = await axiosInstance.get(`/coursesections/lecturer/filter`, {
            params: {
                session,
                faculty,
                page,
                pageSize
            }
        });
        return response.data;
    }
};

export const courseSectionServices = new CourseSectionServices();
export default CourseSectionServices;