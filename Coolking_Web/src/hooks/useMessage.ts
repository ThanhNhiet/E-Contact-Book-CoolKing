import { useState, useCallback } from 'react';
import { messageServices } from '../services/messageServices';

export interface Message {
    _id: string;
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
    const [linkPrev, setLinkPrev] = useState<string | null>(null);
    const [pinnedMessages, setPinnedMessages] = useState<Message[]>([]);

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

    // Lấy 20 tin nhắn gần nhất trong một cuộc trò chuyện
    const getLatestMessagesInChat = useCallback(async (chatID: string) => {
        setLoading(true);
        setError('');
        try {
            const response = await messageServices.getLatestMessages(chatID);
            setLoading(false);
            setMessages(response);
            setLinkPrev(response.linkPrev || null);
        } catch (err: any) {
            setError(err.message || 'Có lỗi xảy ra khi lấy tin nhắn.');
            setLoading(false);
            throw err;
        }
    }, []);

    // Gửi tin nhắn text
    const sendTextMessage = useCallback(async (chatID: string, text: string) => {
        setLoading(true);
        setError('');
        try {
            const response = await messageServices.sendTextMessage(chatID, text);
            setLoading(false);
            messages.push(response);
            setMessages([...messages]);
        } catch (err: any) {
            setError(err.message || 'Có lỗi xảy ra khi gửi tin nhắn.');
            setLoading(false);
            throw err;
        }
    }, []);

    // Gửi tin nhắn file (có thể là nhiều file)
    const sendFileMessage = useCallback(async (chatID: string, files: File[]) => {
        setLoading(true);
        setError('');
        try {
            const response = await messageServices.sendFileMessages(chatID, files);
            setLoading(false);
            setMessages(prevMessages => [...prevMessages, ...response]);
        }
        catch (err: any) {
            setError(err.message || 'Có lỗi xảy ra khi gửi tin nhắn.');
            setLoading(false);
            throw err;
        }
    }, []);

    // Gửi tin nhắn hình ảnh
    const sendImageMessage = useCallback(async (chatID: string, files: File[]) => {
        setLoading(true);
        setError('');
        try {
            const response = await messageServices.sendImageMessages(chatID, files);
            setLoading(false);
            setMessages(prevMessages => [...prevMessages, ...response]);
        } catch (err: any) {
            setError(err.message || 'Có lỗi xảy ra khi gửi tin nhắn.');
            setLoading(false);
            throw err;
        }
    }, []);

    // Gửi tin nhắn reply text
    const sendReplyTextMessage = useCallback(async (chatID: string, text: string, replyTo: { messageID: string; senderID: string; type: string; content: string; }) => {
        setLoading(true);
        setError('');
        try {
            const response = await messageServices.sendReplyTextMessage(chatID, text, replyTo);
            setLoading(false);
            setMessages(prevMessages => [...prevMessages, response]);
        }
        catch (err: any) {
            setError(err.message || 'Có lỗi xảy ra khi gửi tin nhắn.');
            setLoading(false);
            throw err;
        }
    }, []);

    // Gửi tin nhắn reply file
    const sendReplyFileMessage = useCallback(async (chatID: string, files: File[], replyTo: { messageID: string; senderID: string; type: string; content: string; }) => {
        setLoading(true);
        setError('');
        try {
            const response = await messageServices.sendReplyFileMessage(chatID, files, replyTo);
            setLoading(false);
            setMessages(prevMessages => [...prevMessages, ...response]);
        } catch (err: any) {
            setError(err.message || 'Có lỗi xảy ra khi gửi tin nhắn.');
            setLoading(false);
            throw err;
        }
    }, []);

    // Gửi tin nhắn reply image
    const sendReplyImageMessage = useCallback(async (chatID: string, files: File[], replyTo: { messageID: string; senderID: string; type: string; content: string; }) => {
        setLoading(true);
        setError('');
        try {
            const response = await messageServices.sendReplyImageMessage(chatID, files, replyTo);
            setLoading(false);
            setMessages(prevMessages => [...prevMessages, response]);
        } catch (err: any) {
            setError(err.message || 'Có lỗi xảy ra khi gửi tin nhắn.');
            setLoading(false);
            throw err;
        }
    }, []);

    // Lấy danh sách tin nhắn đã ghim trong cuộc trò chuyện
    const getPinnedMessagesInChat = useCallback(async (chatID: string) => {
        setLoading(true);
        setError('');
        try {
            const response = await messageServices.getPinnedMessages(chatID);
            setLoading(false);
            setPinnedMessages(response);
        } catch (err: any) {
            setError(err.message || 'Có lỗi xảy ra khi lấy tin nhắn đã ghim.');
            setLoading(false);
            throw err;
        }
    }, []);

    // Pin tin nhắn
    const pinMessage = useCallback(async (chatID: string, messageID: string, pinnedBy: string) => {
        setLoading(true);
        setError('');
        try {
            const response = await messageServices.pinMessage(chatID, messageID, pinnedBy);
            setLoading(false);
            pinnedMessages.push(response);
            setPinnedMessages([...pinnedMessages]);
        } catch (err: any) {
            setError(err.message || 'Có lỗi xảy ra khi ghim tin nhắn.');
            setLoading(false);
            throw err;
        }
    }, []);

    // unpin tin nhắn, render lại component
    const unpinMessage = useCallback(async (messageID: string) => {
        setLoading(true);
        setError('');
        try {
            const response = await messageServices.unpinMessage(messageID);
            setLoading(false);
            setPinnedMessages(prevPinnedMessages => prevPinnedMessages.filter(msg => msg._id !== messageID));
            return response;
        } catch (err: any) {
            setError(err.message || 'Có lỗi xảy ra khi bỏ ghim tin nhắn.');
            setLoading(false);
            throw err;
        }
    }, []);

    // Thu hồi tin nhắn
    const deleteMessage = useCallback(async (messageID: string) => {
        setLoading(true);
        setError('');
        try {
            const response = await messageServices.deleteMessage(messageID);
            setLoading(false);
            return response;
        }
        catch (err: any) {
            setError(err.message || 'Có lỗi xảy ra khi thu hồi tin nhắn.');
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
        linkPrev,
        pinnedMessages,
        
        getLatestMessagesInChat,
        searchMessagesInChat,
        getAllImagesInChat,
        getAllFilesInChat,
        getAllLinksInChat,
        getPinnedMessagesInChat,
        sendTextMessage,
        sendImageMessage,
        sendFileMessage,
        sendReplyTextMessage,
        sendReplyImageMessage,
        sendReplyFileMessage,
        deleteMessage,
        pinMessage,
        unpinMessage,
    };
};