import { useEffect, useState } from "react";
import { getChats } from "../../api/chat/ChatApi";
import { set } from "date-fns";

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
    currentMember:{
        userID: string;
        userName: string;
        role: string;
        joninedAt: string;
        muted: boolean;
    }
}
type lastMessageType = {
  
            _id: string;
            messageID: string;
            chatID: string;
            senderID: string;
            content: string;
            type: string;
            status: string;
            filename: string;
            replyTo: Object | null;
            pinnedInfor : Object | null;
            createdAt: string;
            updatedAt: string;
}


export const UseChat = () => {
    const [chats, setChats] = useState<ChatItemType[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<Error | null>(null);
    const [page, setPage] = useState(1);

    const getfetchChats = async (pageNumber: number,pageSize: number) => {
        try {
           // setLoading(true);
            const res = await getChats(pageNumber, pageSize);
            if (!res && !res.chats){
                console.warn("No chats data received");
                setChats([]);
                return;
            }
            setChats(res.chats);
            setError(null);
            console.log("Chats data set:", res.chats);
            
        } catch (error) {
            setError(error as Error);
            setChats([])
        } finally{
            setLoading(false);
        }
    }
    useEffect(() => {
        getfetchChats(page,10);
    },[page]);
    


    return {
        chats,
        loading,
        error,
        refresh: () => {
            setPage(1);
            // Không cần gọi fetchChats(1) ở đây, useEffect sẽ tự làm
        }
    };
};