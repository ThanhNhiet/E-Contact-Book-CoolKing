import { useState, useEffect, useCallback } from "react";
import { getAllMessages, sendMessageText as apiSendMessageText , sendMessageImage as apiSendMessageImage , sendMessageFile as apiSendMessageFile , replyToMessage } from "../../api/chat/MessageApi";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { set } from "date-fns";
// --- CẬP NHẬT: Hàm parseCustomDate ổn định hơn ---
const parseCustomDate = (dateString: string): Date => {
    // Input format: "DD/MM/YYYY HH:mm:ss"
    const parts = dateString.match(/(\d{2})\/(\d{2})\/(\d{4})\s(\d{2}):(\d{2}):(\d{2})/);
    if (parts && parts.length === 7) {
        try {
            // parts[0] is the full match
            const day = parseInt(parts[1], 10);
            const month = parseInt(parts[2], 10) - 1; // Month is 0-indexed
            const year = parseInt(parts[3], 10);
            const hour = parseInt(parts[4], 10);
            const minute = parseInt(parts[5], 10);
            const second = parseInt(parts[6], 10);

            // Kiểm tra tính hợp lệ cơ bản
            if (month < 0 || month > 11 || day < 1 || day > 31 || hour < 0 || hour > 23 || minute < 0 || minute > 59 || second < 0 || second > 59) {
                 console.warn("Invalid date components parsed:", { day, month, year, hour, minute, second });
                 return new Date(0); // Fallback
            }

           // Tạo đối tượng Date (giờ địa phương)
           const d = new Date(year, month, day, hour, minute, second);
           // Kiểm tra xem việc tạo Date có thành công không (tránh trường hợp tháng/ngày không hợp lệ)
           if (isNaN(d.getTime())) {
                console.warn("Resulting date is invalid:", dateString);
                return new Date(0);
           }
           return d;
        } catch (e) {
           console.error(`Error creating date object from "${dateString}":`, e);
           return new Date(0); // Fallback
        }
    }
    console.warn("Could not parse date format:", dateString);
    return new Date(0); // Fallback
};

// --- Types (không đổi) ---
type ItemSenderInfo = { userID: string; name: string; avatar: string | null; role: string; muted: boolean; joninDate?: string | null; lastReadAt?: string | null; }
type ItemPinnedInfo = { messageID: string; pinnedByinfo : ItemSenderInfo; pinnedDate: string; }
type ItemReplyInfo = { messageID: string; senderInfo: ItemSenderInfo; content: string; type: string; }
type ItemMessage = { _id: string; chatID: string; type: 'text' | 'image' | string; content: string; filename: string | null; status: string; isDeleted: boolean; senderInfo: ItemSenderInfo; pinnedInfo: ItemPinnedInfo | null; replyTo: ItemReplyInfo | null; createdAt: string; updatedAt: string; };

type File = { uri: string; name?: string; mimeType?: string; }

interface MessagesApiResponse { messages: ItemMessage[]; hasMore: boolean; }

// --- Custom Hook ---
export const useMessages = (chatId: string) => {
    const [messages, setMessages] = useState<ItemMessage[]>([]);
    const [newMessage, setNewMessage] = useState<string>('');
    const [replyingTo, setReplyingTo] = useState<ItemMessage | null>(null);
    const [page, setPage] = useState(1);
    const pageSize = 15;
    const [loadingInitial, setLoadingInitial] = useState(false);
    const [loadingMore, setLoadingMore] = useState(false);
    const [hasMore, setHasMore] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [userId, setUserId] = useState<string | null>(null);
    const [senderInfo, setSenderInfo] = useState<ItemSenderInfo | null>(null);
    const [file, setFile] = useState<File[] | null>(null);
    const [image, setImage] = useState<File[] | null>(null);
    const [fileName, setFileName] = useState<string[] | null>(null);
    const [imageName, setImageName] = useState<string[] | null>(null);

    const fetchMessages = useCallback(async (chatID: string, requestedPage: number, pSize: number) => {
        if (loadingMore || (requestedPage > 1 && !hasMore)) return;

        if (requestedPage === 1) setLoadingInitial(true);
        else setLoadingMore(true);
        setError(null);

        try {
            const response: MessagesApiResponse = await getAllMessages(chatID, requestedPage, pSize);
            if (!response || !Array.isArray(response.messages)) throw new Error("Invalid API response");

            // Sắp xếp lô tin nhắn mới nhất -> cũ nhất (chronological: oldest first)
            const sortedNewMessages = [...response.messages].sort((a, b) => // Tạo bản sao trước khi sort
                parseCustomDate(a.createdAt).getTime() - parseCustomDate(b.createdAt).getTime()
            );


            setMessages((prevMessages) => {
                let updatedMessages;
                if (requestedPage === 1) {
                    updatedMessages = sortedNewMessages;
                } else {
                    const existingIds = new Set(prevMessages.map(m => m._id));
                    const uniqueNewMessages = sortedNewMessages.filter(m => !existingIds.has(m._id));
                    updatedMessages = [...uniqueNewMessages, ...prevMessages]; // Prepend older
                }
                
                return updatedMessages;
            });

            setHasMore(response.hasMore ?? false);

        } catch (err) {
            console.error("Error fetching messages:", err);
            setError(err instanceof Error ? err.message : "Failed to fetch messages");
        } finally {
            setLoadingInitial(false);
            setLoadingMore(false);
        }
    }, [loadingMore, hasMore]);

    // Effect reset khi chatId thay đổi
    useEffect(() => {
        if (chatId) {
            setMessages([]);
            setPage(1);
            setHasMore(true);
            setError(null);
            fetchMessages(chatId, 1, pageSize);
        } else {
            setMessages([]);
            setPage(1);
            setHasMore(false);
        }
    }, [chatId, pageSize]);


     // Effect fetch khi page thay đổi (cho phân trang)
    useEffect(() => {
        if (page > 1 && chatId) {
            fetchMessages(chatId, page, pageSize);
        }
    }, [page, chatId, fetchMessages, pageSize]); // Thêm fetchMessages và pageSize

    useEffect(() => {
        const fetchUserId = async () => {
            const id = await AsyncStorage.getItem('userId');
            if (id) {
                setUserId(id);
            } else {
                console.warn("Could not retrieve userId from AsyncStorage");
            }
        };
        fetchUserId();
    }, []); 

    useEffect(() => {
        
        if (userId && messages.length > 0) {
            const foundSenderInfo = messages.find(msg => msg.senderInfo?.userID === userId)?.senderInfo; 

            if (foundSenderInfo) {
                setSenderInfo(foundSenderInfo);
            }
        }
    }, [userId, messages]);

    const loadMoreMessages = useCallback(() => {
        if (!loadingMore && hasMore) {
            setPage((prevPage) => prevPage + 1);
        } else {
            console.log("Load more skipped:", {loadingMore, hasMore});
        }
    }, [loadingMore, hasMore]);


    const sendMessageText = async (chatId: string, content: string) => {
        try {
            const data = await apiSendMessageText(chatId, content);
            if (data == null) {
                throw new Error("No data received");
            }
            return data;
        } catch (error) {
            console.error("Error sending text message:", error);
            throw error;
        }

    };
    const sendMessageImage = async (chatId: string, images: File[]) => {
        try {
            const data = await apiSendMessageImage(chatId, images);
            if (data == null) {
                throw new Error("No data received");
            }
            return data;
        } catch (error) {
            console.error("Error sending text message:", error);
            throw error;
        }

    };

    
    const handleSendMessageText = async (chatID :string , content:string) => {
        if (content.trim() === '') return;

        const  newMsg = await sendMessageText(chatID, content);
        if (newMsg) {
        const  newLastMsg : ItemMessage = {
            _id: newMsg._id,
            chatID: newMsg.chatID,
            type: newMsg.type,
            content: newMsg.content,
            filename: newMsg.filename,
            status: newMsg.status,
            isDeleted: newMsg.isDeleted,
            senderInfo: senderInfo!,
            pinnedInfo: newMsg.pinnedInfo,
            replyTo: newMsg.replyTo,
            createdAt: newMsg.createdAt,
            updatedAt: newMsg.updatedAt,
        };
        setMessages(prevMessages => [newLastMsg, ...prevMessages]);
        setNewMessage('');
        await fetchMessages(chatID, 1, pageSize);

      } 
    };

    const handleSendMessageImage = async (chatID: string, images: File[]) => {
        if (images.length === 0) return;

        const newMsg = await sendMessageImage(chatID, images);
        if (newMsg) {
            const newLastMsg: ItemMessage = {
                _id: newMsg._id,
                chatID: newMsg.chatID,
                type: newMsg.type,
                content: newMsg.content,
                filename: newMsg.filename,
                status: newMsg.status,
                isDeleted: newMsg.isDeleted,
                senderInfo: senderInfo!,
                pinnedInfo: newMsg.pinnedInfo,
                replyTo: newMsg.replyTo,
                createdAt: newMsg.createdAt,
                updatedAt: newMsg.updatedAt,
            };
            setMessages(prevMessages => [newLastMsg, ...prevMessages]);
            setImage(null);
            setImageName(null);
            await fetchMessages(chatID, 1, pageSize);
        }
    };

     const handleSendReply = async (chatID:string ,content:string) => {
        if (content.trim() === '' || !senderInfo) return; // Need senderInfo too

        // Create base message object
        const newMsg: ItemMessage = {
            _id: `temp_${Date.now()}`,
            chatID: chatID,
            type: 'text',
            content: content.trim(),
            filename: null,
            status: 'sending',
            isDeleted: false,
            replyTo: null,
            pinnedInfo: null,
            senderInfo: senderInfo!,
            createdAt: new Intl.DateTimeFormat('vi-VN', {
                 day: '2-digit', month: '2-digit', year: 'numeric',
                 hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: false
            }).format(new Date()).replace(',', ''),
            updatedAt: new Intl.DateTimeFormat('vi-VN', {
                 day: '2-digit', month: '2-digit', year: 'numeric',
                 hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: false
            }).format(new Date()).replace(',', ''),
        };
    // Add replyTo field if replying
        const messageToSend: ItemMessage = replyingTo
            ? {
                ...newMsg,
                replyTo: { // Construct the replyTo object based on API requirements
                    messageID: replyingTo._id,
                    senderInfo: replyingTo.senderInfo, // Or just sender ID/Name
                    content: replyingTo.content,
                    type: replyingTo.type,
                }
            }
            : { ...newMsg, replyTo: null }; // Ensure replyTo is explicitly null otherwise

        // Optimistic UI Update
        setMessages(prevMessages => [messageToSend, ...prevMessages]);
        setNewMessage('');
        setReplyingTo(null); // Clear reply state after sending

        // TODO: Call actual API function (e.g., sendMessageText or a new one for replies)
        try {
            // const sentMsg = await sendMessageWithReply(messageToSend); // Example API call
            // Update message state with server response (e.g., update _id, status)
            // setMessages(prev => prev.map(m => m._id === messageToSend._id ? { ...sentMsg, status: 'sent' } : m));
             console.log("Simulating sending:", messageToSend); 
        } catch (err) {
            console.error("Send message failed:", err);
            // Revert or mark message as failed
            setMessages(prev => prev.map(m => m._id === messageToSend._id ? { ...m, status: 'failed' } : m));
        }
    };



    return { 
        
        // States
        loading: loadingInitial, 
        loadingMore, 
        hasMore, 
        error, 


        messages,
        userId,
        senderInfo,
        newMessage,
        replyingTo,
        file,
        image,
        fileName,
        imageName,

        // Functions
        loadMoreMessages ,
        sendMessageText,
        handleSendMessageText,
        handleSendReply,
        handleSendMessageImage,

        // Setters
        setNewMessage,
        setMessages, 
        setReplyingTo,
        setFile,
        setImage,
        setFileName,
        setImageName
    };
}