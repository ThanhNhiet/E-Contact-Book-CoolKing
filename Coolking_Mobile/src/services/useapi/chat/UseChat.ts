import { useEffect, useState,useCallback } from "react";
import { getChats , getSearchChatsByKeyword } from "../../api/chat/ChatApi";
import { refresh } from "@react-native-community/netinfo";

// Giữ nguyên các type ChatItemType, lastMessageType
type ChatItemType = {
    _id: string;
    type: string;
    name: string;
    avatar: string;
    course_section_id: string;
    lastMessage: lastMessageType | null;
    createdAt: string;
    updatedAt: string;
    unread:boolean;
}
type lastMessageType = {
            senderID: string;
            content: string;
            type: string;
            createdAt: string;
}


export const useChat = () => {
    const [chats, setChats] = useState<ChatItemType[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<Error | null>(null);
    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState<any[]>([]);

    const getfetchChats = useCallback(async (page: number,pageSize: number) => {
        try {
           // setLoading(true);
            const res = await getChats(page, pageSize);
            if (!res && !res.chats){
                console.warn("No chats data received");
                setChats([]);
                return;
            }
            setChats(res.chats);
            setTotalPages(res.pages);
            setError(null);
            
        } catch (error) {
            setError(error as Error);
            setChats([])
        } finally{
            setLoading(false);
        }
    },[page]);
    useEffect(() => {
        getfetchChats(page,10);
    },[page,getfetchChats]);

    const searchChats = useCallback(async (query: string) => {
        setLoading(true);
        try {
            const res = await getSearchChatsByKeyword(query);
            if (!res || !res.success) {
                console.warn("No search results found");
                setChats([]);
                return;
            }
            return res.chats;
            setError(null);
        } catch (error) {
            setError(error as Error);
            setChats([]);
        } finally {
            setLoading(false);
        }
    }, []);

    return {
        chats,
        loading,
        error,
        page,
        refetch: () => getfetchChats(page,10),
        setPage,
        totalPages,
        searchChats,
    };
};