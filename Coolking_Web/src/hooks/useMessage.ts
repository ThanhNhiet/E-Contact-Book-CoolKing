import { useState, useCallback } from 'react';
import { messageServices } from '../services/messageServices';

export const useMessage = () => {
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string>('');

    // Tìm kiếm tin nhắn trong một cuộc trò chuyện
    const searchMessagesInChat = useCallback(async (chatID: string, keyword: string) => {
        setLoading(true);
        setError('');
        try {
            const response = await messageServices.searchMessages(chatID, keyword);
            setLoading(false);
            return response;
        } catch (err: any) {
            setError(err.message || 'Có lỗi xảy ra khi tìm kiếm tin nhắn.');
            setLoading(false);
            throw err;
        }
    }, []);

    // Lấy tất cả hình ảnh trong một cuộc trò chuyện
    const getAllImagesInChat = useCallback(async (chatID: string) => {
        setLoading(true);
        setError('');
        try {
            const response = await messageServices.getAllImagesInChat(chatID);
            setLoading(false);
            return response;
        } catch (err: any) {
            setError(err.message || 'Có lỗi xảy ra khi lấy hình ảnh.');
            setLoading(false);
            throw err;
        }
    }, []);

    // Lấy tất cả files trong một cuộc trò chuyện
    const getAllFilesInChat = useCallback(async (chatID: string) => {
        setLoading(true);
        setError('');
        try {
            const response = await messageServices.getAllFilesInChat(chatID);
            setLoading(false);
            return response;
        } catch (err: any) {
            setError(err.message || 'Có lỗi xảy ra khi lấy files.');
            setLoading(false);
            throw err;
        }
    }, []);

    // Lấy tất cả links trong một cuộc trò chuyện
    const getAllLinksInChat = useCallback(async (chatID: string) => {
        setLoading(true);
        setError('');
        try {
            const response = await messageServices.getAllLinksInChat(chatID);
            setLoading(false);
            return response;
        } catch (err: any) {
            setError(err.message || 'Có lỗi xảy ra khi lấy links.');
            setLoading(false);
            throw err;
        }
    }, []);

    return { 
        loading, 
        error, 
        searchMessagesInChat, 
        getAllImagesInChat, 
        getAllFilesInChat, 
        getAllLinksInChat
    };
};