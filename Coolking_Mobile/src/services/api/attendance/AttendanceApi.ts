import axiosInstance from "@/src/configs/axiosInstance";

export const getCourseSectionsByStudent = async (page: number, pageSize: number) => {
    try {
        const response = await axiosInstance.get(`/api/coursesections/student?page=${page}&pageSize=${pageSize}`);
        if(!response.data){
            throw new Error("No data received");
        }
        return response.data;
    }catch (error) {
        console.error("Error fetching course sections:", error);
        throw error;
    }
}

export const getAttendanceByStudentBySubject = async (courseSectionId: string, subjectId: string) => {
    try {
        const response = await axiosInstance.get(`/api/attendances/student`, {
            params: {
                course_section_id: courseSectionId,
                subject_id: subjectId,
            },
        });
        if(!response.data){
            throw new Error("No data received");
        }
        return response.data;
    } catch (error) {
        console.error("Error fetching attendance details:", error);
        throw error;
    }
};

export const getAttendanceByStudentBySubject_Parent = async (page:number,pageSize:number) => {
    try {
        const response = await axiosInstance.get(`/api/attendances/parent?page=${page}&pageSize=${pageSize}`);
        if(!response.data){
            throw new Error("No data received");
        }
        return response.data;
    } catch (error) {
        console.error("Error fetching attendance details:", error);
        throw error;
    }
};
