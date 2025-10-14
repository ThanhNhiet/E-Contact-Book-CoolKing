import axiosInstance from "@/src/configs/axiosInstance";


export const getChats = async (page: number, pageSize: number) => {
    try {
        const response = await axiosInstance.get(`/api/chats?page=${page}&pageSize=${pageSize}`);
        if (response.data == null) {
            throw new Error("No data received");
        }
        return response.data;
    } catch (error) {
        console.error("Error fetching chats:", error);
        throw error;
    }
}
