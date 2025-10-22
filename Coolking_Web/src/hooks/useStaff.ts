import { useState, useCallback } from 'react';
import { staffService } from '../services/staffServices';

export interface Staff {
    staff_id: string;
    admin_id: string;
    name: string;
    dob: string;
    gender: string;
    avatar: string;
    phone: string;
    email: string;
    address: string;
    department: string;
    position: string;
    createdAt: string;
    updatedAt: string;
}

export const useStaff = () => {
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string>('');
    const [staff, setStaff] = useState<Staff | null>(null);

    // Lấy thông tin bản thân nhân viên admin
    const getStaffInfo = useCallback(async () => {
        setLoading(true);
        setError('');
        try {
            const data = await staffService.getStaffInfo();
            setStaff(data);
        } catch (error : any) {
            setError(error.message || 'Failed to fetch staff information');
        } finally {
            setLoading(false);
        }
    }, []);

    // Cập nhật thông tin nhân viên admin
    const updateStaffInfo = useCallback(async (data: any) => {
        setLoading(true);
        setError('');
        try {
            const updatedStaff = await staffService.updateStaffInfo(data);
            return updatedStaff;
        } catch (error : any) {
            setError(error.message || 'Failed to update staff information');
        } finally {
            setLoading(false);
        }
    }, []);

    // Cập nhật avatar nhân viên admin
    const updateStaffAvatar = useCallback(async (avatar: File) => {
        setLoading(true);
        setError('');
        try {
            const updatedStaff = await staffService.updateStaffAvatar(avatar);
            if (updatedStaff.success) {
                await getStaffInfo();
                const staffAvatar_local = localStorage.getItem('admin_avatar_url');
                if (staffAvatar_local) localStorage.setItem('admin_avatar_url', updatedStaff.avatar);
            }
            return updatedStaff;
        } catch (error : any) {
            setError(error.message || 'Failed to update staff avatar');
        } finally {
            setLoading(false);
        }
    }, []);

    // Change password
    const changePassword = useCallback(async (oldPassword: string, newPassword: string) => {
        setLoading(true);
        setError('');
        try {
            const response = await staffService.changePassword(oldPassword, newPassword);
            return response;
        } catch (error : any) {
            setError(error.message || 'Failed to change password');
        } finally {
            setLoading(false);
        }
    }, []);

    // Lấy thông tin 1 nhân viên theo staff_id dành cho admin
    const getStaff = useCallback(async (staff_id: string) => {
        setLoading(true);
        setError('');
        try {
            const data = await staffService.getStaff(staff_id);
            setStaff(data);
        } catch (error : any) {
            setError(error.message || 'Failed to fetch staff information');
        } finally {
            setLoading(false);
        }
    }, []);

    return {
        loading,
        error,
        staff,
        getStaffInfo,
        updateStaffInfo,
        updateStaffAvatar,
        changePassword,
        getStaff
    };
};