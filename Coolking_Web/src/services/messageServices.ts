import axiosInstance from "../configs/axiosConf";

class MessageServices {

    // GET /api/messages/search/:chatID?keyword=xin chào
    async searchMessages(chatID: string, keyword: string) {
        try {
            const response = await axiosInstance.get(`/messages/search/${chatID}`, {
                params: { keyword }
            });
            return response.data;
        } catch (error) {
            console.error("Error searching messages:", error);
            throw error;
        }
    }

    // GET /api/messages/images/:chatID
    async getAllImagesInChat(chatID: string) {
        try {
            const response = await axiosInstance.get(`/messages/images/${chatID}`);
            return response.data;
        } catch (error) {
            console.error("Error fetching images in chat:", error);
            throw error;
        }
    }

    // GET /api/messages/files/:chatID
    async getAllFilesInChat(chatID: string) {
        try {
            const response = await axiosInstance.get(`/messages/files/${chatID}`);
            return response.data;
        } catch (error) {
            console.error("Error fetching files in chat:", error);
            throw error;
        }
    }

    // GET /api/messages/links/:chatID
    async getAllLinksInChat(chatID: string) {
        try {
            const response = await axiosInstance.get(`/messages/links/${chatID}`);
            return response.data;
        } catch (error) {
            console.error("Error fetching links in chat:", error);
            throw error;
        }
    }
}

export const messageServices = new MessageServices();
export default messageServices;
