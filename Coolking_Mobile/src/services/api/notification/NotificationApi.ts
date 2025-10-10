import axiosInstance from "@/src/configs/axiosInstance";


export const getNotifications = async (page: number, pageSize: number) => {
    try {
        const response = await axiosInstance.get(`api/alerts/my-alerts?page=${page}&pageSize=${pageSize}`);
        if (!response.data) {
            throw new Error("Invalid notifications response");
        }
        return response.data;
    } catch (error) {
        console.error("Fetch notifications error:", error);
        throw error;
    }
}