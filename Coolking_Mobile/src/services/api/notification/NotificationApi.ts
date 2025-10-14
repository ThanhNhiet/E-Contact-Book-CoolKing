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

// /api/alerts/system/:alertId/read
export const markSystemAsRead = async (alertId: string) => {
    try {
        const response = await axiosInstance.post(`api/alerts/system/${alertId}/read`);
        if (!response.data) {
            throw new Error("Invalid mark system as read response");
        }
        return response.data;
    } catch (error) {
        console.error("Mark system as read error:", error);
        throw error;
    }
}

export const deleteSystemNotification = async (alertId: string) => {
    try {
        const response = await axiosInstance.delete(`api/alerts/system/${alertId}`);
        if (!response.data) {
            throw new Error("Invalid delete system notification response");
        }
        return response.data;
    } catch (error) {
        console.error("Delete system notification error:", error);
        throw error;
    }
}