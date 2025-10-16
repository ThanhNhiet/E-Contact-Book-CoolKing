import { useState, useCallback } from 'react';
import { messageServices } from '../services/messageServices';

export interface Message {
    _id: string;
    messageID: string;
    chatID: string;
    senderID: string;
    type: string;
    content: string;
    filename: string | null;
    replyTo: Reply | null;
    pinnedInfo: PinnedInfo | null;
    status: string;
    createdAt: string;
    updatedAt: string;
}

interface Reply {
    messageID: string;
    senderID: string;
    type: string;
    content: string;
}

interface PinnedInfo {
    messageID: string;
    pinnedBy: string;
    pinnedDate: string;
}

export const useMessage = () => {
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string>('');
    const [messages, setMessages] = useState<Message[]>([]);
    const [searchResults, setSearchResults] = useState<Message[]>([]);
    const [collectionMessages, setCollectionMessages] = useState<Message[]>([]);

    // Tìm kiếm tin nhắn trong một cuộc trò chuyện
    const searchMessagesInChat = useCallback(async (chatID: string, keyword: string) => {
        setLoading(true);
        setError('');
        try {
            const response = await messageServices.searchMessages(chatID, keyword);
            setLoading(false);
            setSearchResults(response);
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
            setCollectionMessages(response);
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
            setCollectionMessages(response);
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
            setCollectionMessages(response);
        } catch (err: any) {
            setError(err.message || 'Có lỗi xảy ra khi lấy links.');
            setLoading(false);
            throw err;
        }
    }, []);

    return { 
        loading, 
        error,
        messages,
        searchResults,
        collectionMessages,
        searchMessagesInChat, 
        getAllImagesInChat, 
        getAllFilesInChat, 
        getAllLinksInChat
    };
};