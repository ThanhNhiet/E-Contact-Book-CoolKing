import { getNotifications, markAsRead } from "@/src/services/api/notification/NotificationApi";
import { useEffect, useState, useMemo } from "react"; // 👈 Import useMemo
import { getAlertID, deleteAlertID } from "@/src/utils/AlertManager";

export type NotificationItem = {
    _id: string;
    senderID: string;
    receiverID: string | null; // receiverID can be null
    header: string;
    body?: string;
    targetScope: string;
    isRead?: boolean;
    createdAt: string | number | Date;
    updatedAt?: string | number | Date;
};

export const UseNotification = () => {
    const [notifications, setNotifications] = useState<NotificationItem[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const fetchNotifications = async () => {
        try {
            setLoading(true); // Ensure loading is true at the start
            const data = await getNotifications(1, 10);
            if (data == null) {
                throw new Error("No data received");
            }
            setNotifications(data.alerts || []);
        } catch (error) {
            setError(error as any);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchNotifications();
    }, []);
    

    const markNotificationAsRead = async (alertId: string) => {
        try {
            setLoading(true);
            const data = await markAsRead(alertId);
            if (data == null) {
                throw new Error("Mark as read failed");
            }

            // ⭐️ IMPORTANT: Update the local state to reflect the change in the UI
            setNotifications(prevNotifications =>
                prevNotifications.map(item =>
                    item._id === alertId ? { ...item, isRead: true } : item
                )
            );
            return data;
        } catch (error) {
            setError(error as any);
        } finally {
            setLoading(false);
        }
    };


    

    return {
        notifications,
        setNotifications,
        loading,
        error,
        fetchNotifications,
        markNotificationAsRead,
    };
}