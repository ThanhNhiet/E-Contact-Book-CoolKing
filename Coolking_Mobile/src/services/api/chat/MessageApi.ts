import axiosInstance from "@/src/configs/axiosInstance";

export const getLastMessage = async (chatId: string) => {
    try {
        const response = await axiosInstance.get(`/api/messages/last/${chatId}`);
        if (response.data == null) {
            throw new Error("No data received");
        }
        return response.data;
    } catch (error) {
        console.error("Error fetching last message:", error);
        throw error;
    }
}
