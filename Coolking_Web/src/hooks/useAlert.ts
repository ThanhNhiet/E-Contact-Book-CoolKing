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
            return data;
        } catch (error: any) {
            setError(error.message);
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

        getMyAlerts
    };
};