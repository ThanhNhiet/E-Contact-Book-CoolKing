import axiosInstance from "../configs/axiosConf";

class ChatServices {
    // GET /api/chats/all?page=1&pageSize=10
    async getAllChats(page: number, pageSize: number) {
        const response = await axiosInstance.get(`/chats/all`, {
            params: {
                page,
                pageSize
            }
        });
        return response.data;
    }

    // GET /api/chats/all/search?keyword=<keyword>&page=1&pageSize=10
    async searchChats(keyword: string, page: number, pageSize: number) {
        const response = await axiosInstance.get(`/chats/all/search`, {
            params: {
                keyword,
                page,
                pageSize
            }
        });
        return response.data;
    }

    // POST /api/chats/group?course_section_id=405e2844-93a7-11f0-a902-088fc3521198&nameGroup=Cơ sở dữ liệu
    // Cho phép truyền param có dấu cách và các ký tự đặc biệt
    async createGroupChat(course_section_id: string, nameGroup: string) {
        const response = await axiosInstance.post(`/chats/group`, {
            params: {
                course_section_id,
                nameGroup
            }
        });
        return response.data;
    }

    // DELETE /api/chats/:chatID
    async deleteChat(chatID: string) {
        const response = await axiosInstance.delete(`/chats/${chatID}`);
        return response.data;
    }

    // PUT /api/chats/group/:chatID
    // body: { name: string, "students":  ["SVxxx", "SVxxx"], "lecturers": ["KExxx", "LExxx"] }
    async AddMembers2GroupChat(chatID: string, name: string, students: string[], lecturers: string[]) {
        const response = await axiosInstance.put(`/chats/group/${chatID}`, {
            name,
            students,
            lecturers
        });
        return response.data;
    }

    // DELETE /api/chats/cleanup-inactive
    async cleanupInactiveChats() {
        const response = await axiosInstance.delete(`/chats/cleanup-inactive`);
        return response.data;
    }

    // GET /api/chats/nonchat-course-sections?page=1&pageSize=10
    async getNonChatCourseSections(page: number, pageSize: number) {
        const response = await axiosInstance.get(`/chats/nonchat-course-sections`, {
            params: {
                page,
                pageSize
            }
        });
        return response.data;
    }

    // GET /api/Chats/nonchat-course-sections/search?keyword=<keyword>&page=1&pageSize=10
    async searchNonChatCourseSections(keyword: string, page: number, pageSize: number) {
        const response = await axiosInstance.get(`/chats/nonchat-course-sections/search`, {
            params: {
                keyword,
                page,
                pageSize
            }
        });
        return response.data;
    }

    // GET /api/students/info-view-le-ad/{studentId}
    async getStudentInfo(studentId: string) {
        const response = await axiosInstance.get(`/students/info-view-le-ad/${studentId}`);
        return response.data;
    }

    // GET /api/lecturers/{lecturerId}
    async getLecturerInfo(lecturerId: string) {
        const response = await axiosInstance.get(`/lecturers/${lecturerId}`);
        return response.data;
    }
}

export const chatServices = new ChatServices();
export default chatServices;
