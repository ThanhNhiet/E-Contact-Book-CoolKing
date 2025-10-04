import { useState, useCallback } from 'react';
import { alertService } from '../services/alertServices';

//Respone template
// {
//     "success": true,
//     "total": 4,
//     "page": 1,
//     "pageSize": 10,
//     "alerts": [
//         {
//             "_id": "6ae0c178-c614-451a-8448-ec1222d12afc",
//             "senderID": "ADMIN001",
//             "receiverID": "All",
//             "header": "Test header 4/10",
//             "body": "Xin chào tất cả",
//             "targetScope": "all",
//             "isRead": false,
//             "createdAt": "04/10/2025 16:43:30",
//             "updatedAt": "04/10/2025 16:43:30"
//         },
//         {
//             "_id": "453eb3d7-55bc-4f39-982b-d2f71627b714",
//             "senderID": "LE00001",
//             "receiverID": "3",
//             "header": "Test header",
//             "body": "Xin chào tất cả 1, 2, 3",
//             "targetScope": "person",
//             "isRead": false,
//             "createdAt": "25/09/2025 12:47:18",
//             "updatedAt": "25/09/2025 12:47:18"
//         },
//         {
//             "_id": "faa376d1-b975-478d-9875-190980ae206e",
//             "senderID": "LE00001",
//             "receiverID": "2",
//             "header": "Test header",
//             "body": "Xin chào tất cả 1, 2, 3",
//             "targetScope": "person",
//             "isRead": false,
//             "createdAt": "25/09/2025 12:47:18",
//             "updatedAt": "25/09/2025 12:47:18"
//         },
//         {
//             "_id": "af6bfdf0-de91-49bd-986c-a7518c9d4f1b",
//             "senderID": "LE00001",
//             "receiverID": "1",
//             "header": "Test header",
//             "body": "Xin chào tất cả 1, 2, 3",
//             "targetScope": "person",
//             "isRead": false,
//             "createdAt": "25/09/2025 12:47:18",
//             "updatedAt": "25/09/2025 12:47:18"
//         }
//     ],
//     "linkPrev": null,
//     "linkNext": null,
//     "pages": [
//         1
//     ]
// }

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

    // Lấy danh sách thông báo
    const getAlerts = useCallback(async (page: number, pageSize: number) => {
        try {
            setLoading(true);
            setError('');
            const data = await alertService.getAlerts(page, pageSize);
            setAlerts(data.alerts || []);
            setTotal(data.total);
            setCurrentPage(data.page);
            setPageSize(data.pageSize);
            setLinkPrev(data.linkPrev);
            setLinkNext(data.linkNext);
            setPages(data.pages);
            return data;
        } catch (error: any) {
            setError(error.message);
        } finally {
            setLoading(false);
        }
    }, []);

    // Lấy kết quả tìm kiếm thông báo
    const searchAlerts = useCallback(async (keyword: string, page: number, pageSize: number) => {
        try {
            setLoading(true);
            setError('');
            const data = await alertService.searchAlerts(keyword, page, pageSize);
            setAlerts(data.alerts || []);
            setTotal(data.total);
            setCurrentPage(data.page);
            setPageSize(data.pageSize);
            setLinkPrev(data.linkPrev);
            setLinkNext(data.linkNext);
            setPages(data.pages);
            return data;
        } catch (error: any) {
            setError(error.message);
        } finally {
            setLoading(false);
        }
    }, []);

    //Gửi thông báo đến tất cả
    const sendAlertToAll = useCallback(async (header: string, body: string) => {
        try {
            setLoading(true);
            setError('');
            const data = await alertService.sendAlertToAll(header, body);
            return data;
        } catch (error: any) {
            setError(error.message);
        } finally {
            setLoading(false);
        }
    }, []);

    //Xóa thông báo
    const deleteAlert = useCallback(async (alertID: string, createdAt: string, senderID: string) => {
        try {
            setLoading(true);
            setError('');
            const data = await alertService.deleteAlert(alertID, createdAt, senderID);
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

        getAlerts,
        searchAlerts,
        sendAlertToAll,
        deleteAlert
    };
};