import { useState, useCallback } from 'react';
import { accountService } from '../services/accountServices';

//Response template for searchAccounts and getAccounts
// {
//     "total": 653,
//     "page": 1,
//     "pageSize": 10,
//     "accounts": [
//         {
//             "id": "114e3b26-939c-11f0-a902-088fc3521198",
//             "user_id": "SV2100001",
//             "email": "sv2100001@stu.edu.vn",
//             "phone_number": "0907000001",
//             "role": "STUDENT",
//             "status": "ACTIVE",
//             "createdAt": "17-09-2025 21:58:16",
//             "updatedAt": "17-09-2025 21:58:16"
//         },
//         {
//             "id": "114e3b81-939c-11f0-a902-088fc3521198",
//             "user_id": "SV2100101",
//             "email": "sv2100101@stu.edu.vn",
//             "phone_number": "0907000101",
//             "role": "STUDENT",
//             "status": "ACTIVE",
//             "createdAt": "17-09-2025 21:58:16",
//             "updatedAt": "17-09-2025 21:58:16"
//         },
//         {
//             "id": "114e3b99-939c-11f0-a902-088fc3521198",
//             "user_id": "SV2100201",
//             "email": "sv2100201@stu.edu.vn",
//             "phone_number": "0907000201",
//             "role": "STUDENT",
//             "status": "ACTIVE",
//             "createdAt": "17-09-2025 21:58:16",
//             "updatedAt": "17-09-2025 21:58:16"
//         },
//         {
//             "id": "114e3ba4-939c-11f0-a902-088fc3521198",
//             "user_id": "SV2100002",
//             "email": "sv2100002@stu.edu.vn",
//             "phone_number": "0907000002",
//             "role": "STUDENT",
//             "status": "ACTIVE",
//             "createdAt": "17-09-2025 21:58:16",
//             "updatedAt": "17-09-2025 21:58:16"
//         },
//         {
//             "id": "114e3bbe-939c-11f0-a902-088fc3521198",
//             "user_id": "SV2100102",
//             "email": "sv2100102@stu.edu.vn",
//             "phone_number": "0907000102",
//             "role": "STUDENT",
//             "status": "ACTIVE",
//             "createdAt": "17-09-2025 21:58:16",
//             "updatedAt": "17-09-2025 21:58:16"
//         },
//         {
//             "id": "114e3bd8-939c-11f0-a902-088fc3521198",
//             "user_id": "SV2100202",
//             "email": "sv2100202@stu.edu.vn",
//             "phone_number": "0907000202",
//             "role": "STUDENT",
//             "status": "ACTIVE",
//             "createdAt": "17-09-2025 21:58:16",
//             "updatedAt": "17-09-2025 21:58:16"
//         },
//         {
//             "id": "114e3bed-939c-11f0-a902-088fc3521198",
//             "user_id": "SV2100003",
//             "email": "sv2100003@stu.edu.vn",
//             "phone_number": "0907000003",
//             "role": "STUDENT",
//             "status": "ACTIVE",
//             "createdAt": "17-09-2025 21:58:16",
//             "updatedAt": "17-09-2025 21:58:16"
//         },
//         {
//             "id": "114e3bfa-939c-11f0-a902-088fc3521198",
//             "user_id": "SV2100103",
//             "email": "sv2100103@stu.edu.vn",
//             "phone_number": "0907000103",
//             "role": "STUDENT",
//             "status": "ACTIVE",
//             "createdAt": "17-09-2025 21:58:16",
//             "updatedAt": "17-09-2025 21:58:16"
//         },
//         {
//             "id": "114e3c13-939c-11f0-a902-088fc3521198",
//             "user_id": "SV2100203",
//             "email": "sv2100203@stu.edu.vn",
//             "phone_number": "1111111111",
//             "role": "STUDENT",
//             "status": "ACTIVE",
//             "createdAt": "17-09-2025 21:58:16",
//             "updatedAt": "02-10-2025 20:01:31"
//         },
//         {
//             "id": "114e3c2a-939c-11f0-a902-088fc3521198",
//             "user_id": "SV2100004",
//             "email": "sv2100004@stu.edu.vn",
//             "phone_number": "0907000004",
//             "role": "STUDENT",
//             "status": "ACTIVE",
//             "createdAt": "17-09-2025 21:58:16",
//             "updatedAt": "17-09-2025 21:58:16"
//         }
//     ],
//     "linkPrev": null,
//     "linkNext": "/api/accounts?page=2&pagesize=10",
//     "pages": [
//         1,
//         2,
//         3
//     ]
// }

export interface Account {
    id: string;
    user_id: string;
    email: string;
    phone_number: string;
    role: string;
    status: string;
    createdAt: string;
    updatedAt: string;
}

export const useAccount = () => {
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string>('');
    const [accounts, setAccounts] = useState<Account[]>([]);
    const [totalAccounts, setTotalAccounts] = useState(0);
    const [currentPage, setCurrentPage] = useState(1);
    const [pageSize, setPageSize] = useState(10);
    const [linkPrev, setLinkPrev] = useState<string | null>(null);
    const [linkNext, setLinkNext] = useState<string | null>(null);
    const [pages, setPages] = useState<number[]>([]);

    const getAccounts = useCallback(async (page: number, pageSize: number) => {
        try {
            setLoading(true);
            setError('');
            const data = await accountService.getAccounts(page, pageSize);
            setAccounts(data.accounts || []);
            setTotalAccounts(data.total);
            setCurrentPage(page);
            setPageSize(pageSize);
            setLinkPrev(data.linkPrev);
            setLinkNext(data.linkNext);
            setPages(data.pages);
            return data;
        } catch (error: any) {
            setError('Failed to fetch accounts');
            console.error('Get accounts error:', error);
        } finally {
            setLoading(false);
        }
    }, []);

    const searchAccounts = useCallback(async (keyword: string, page: number, pageSize: number) => {
        try {
            setLoading(true);
            setError('');
            const data = await accountService.searchAccounts(keyword, page, pageSize);
            setAccounts(data.accounts || []);
            setTotalAccounts(data.total);
            setCurrentPage(page);
            setPageSize(pageSize);
            setLinkPrev(data.linkPrev);
            setLinkNext(data.linkNext);
            setPages(data.pages);
            return data;
        } catch (error: any) {
            setError('Failed to search accounts');
            console.error('Search accounts error:', error);
        } finally {
            setLoading(false);
        }
    }, []);

    const disableAccount = useCallback(async (accountId: string) => {
        try {
            setLoading(true);
            setError('');
            const data = await accountService.deleteAccount(accountId);
            return data;
        } catch (error: any) {
            setError('Failed to disable account');
            console.error('Disable account error:', error);
            throw error;
        } finally {
            setLoading(false);
        }
    }, []);

    const resetPassword = useCallback(async (accountId: string) => {
        try {
            setLoading(true);
            setError('');
            const data = await accountService.resetPassword(accountId);
            return data;
        } catch (error: any) {
            setError('Failed to reset password');
            console.error('Reset password error:', error);
            throw error;
        } finally {
            setLoading(false);
        }
    }, []);

    const refreshAccounts = useCallback(() => {
        getAccounts(currentPage, pageSize);
    }, [getAccounts, currentPage, pageSize]);

    return {
        loading,
        error,
        accounts,
        totalAccounts,
        currentPage,
        pageSize,
        linkPrev,
        linkNext,
        pages,
        getAccounts,
        searchAccounts,
        disableAccount,
        resetPassword,
        refreshAccounts
    };
};