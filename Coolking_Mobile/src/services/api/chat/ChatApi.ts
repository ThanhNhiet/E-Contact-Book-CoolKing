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

export const getSearchChatsByKeyword = async (query: string) => {
    try {
        const response = await axiosInstance.get(`/api/chats/search?keyword=${query}`);
        if (response.data == null) {
            throw new Error("No data received");
        }
        return response.data;
    } catch (error) {
        console.error("Error searching chats:", error);
        throw error;
    }
};
