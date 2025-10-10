import {getNotifications} from "@/src/services/api/notification/NotificationApi";
import {useEffect, useState} from "react";
export type NotificationItem = {
  _id: string;
  senderID: string;
  receiverID: string;
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

    useEffect(() => {
        const fetchNotifications = async () => {
            try {
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

        fetchNotifications();
    }, []);


    return { notifications,setNotifications, loading, error };
}
