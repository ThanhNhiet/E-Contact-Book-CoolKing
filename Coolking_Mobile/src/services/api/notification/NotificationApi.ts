import axiosInstance from "@/src/configs/axiosInstance";
import { saveAlertID,getAlertID,deleteAlertID} from "@/src/utils/AlertManager";


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

export const markAsRead = async (alertId: string) => {
    try {
        const response = await axiosInstance.put(`api/alerts/${alertId}/read`);
        if (!response.data) {
            throw new Error("Invalid mark as read response");
        }
        return response.data;
    } catch (error) {
        console.error("Mark as read error:", error);
        throw error;
    }
}