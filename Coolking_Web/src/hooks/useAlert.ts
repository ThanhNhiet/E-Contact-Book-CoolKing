import { useState, useCallback } from 'react';
import { alertService } from '../services/alertServices';

export interface Alert {
    _id: string;
    senderID: string;
    receiverID: string;
    header: string;
    body: string;
    targetScope: 'all' | 'person';
    isRead: boolean;
    createdAt: string;
    updatedAt: string;
}

export const useAlert = () => {
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string>('');
    const [alerts, setAlerts] = useState<Alert[]>([]);
    const [total, setTotal] = useState(0);
    const [currentPage, setCurrentPage] = useState(1);
    const [pageSize, setPageSize] = useState(10);
    const [linkPrev, setLinkPrev] = useState<string | null>(null);
    const [linkNext, setLinkNext] = useState<string | null>(null);
    const [pages, setPages] = useState<number[]>([]);
    const [unreadCount, setUnreadCount] = useState(0);

    // Lấy danh sách thông báo
    const getMyAlerts = useCallback(async (page: number, pageSize: number) => {
        try {
            setLoading(true);
            setError('');
            const data = await alertService.getMyAlerts(page, pageSize);
            setAlerts(data.alerts || []);
            setTotal(data.total);
            setCurrentPage(page);
            setPageSize(data.pageSize);
            setLinkPrev(data.linkPrev);
            setLinkNext(data.linkNext);
            setPages(data.pages);
            setUnreadCount(data.unreadCount || 0);
        } catch (error: any) {
            setError(error.message || 'Failed to fetch alerts');
        } finally {
            setLoading(false);
        }
    }, []);

    // Gửi thông báo đến người dùng cụ thể
    const sendAlertPersonal = useCallback(async (header: string, body: string, receiversID: string[]) => {
        try {
            setLoading(true);
            setError('');
            const data = await alertService.sendAlertPersonal(header, body, receiversID);
            return data;
        } catch (error: any) {
            setError(error.message || 'Failed to send alert');
        } finally {
            setLoading(false);
        }
    }, []);

    return {
        loading,
        error,
        alerts,
        total,
        currentPage,
        pageSize,
        linkPrev,
        linkNext,
        pages,
        unreadCount,

        getMyAlerts,
        sendAlertPersonal
    };
};