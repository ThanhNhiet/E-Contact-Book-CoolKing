import { getProfile , updateAvatar , changePassword , getUpdateProfile } from "@/src/services/api/profile/ProfileApi";
import { useState, useEffect } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";

export const useProfile = () => {
 
    const [profile, setProfile] = useState<any>(null);
    const [profileNavigation, setProfileNavigation] = useState<any>(null);
    const [role, setRole] = useState<string | null>(null);
    const [avatarUrl, setAvatarUrl] = useState<string | null>(null);
    const [profileParent, setProfileParent] = useState<any>(null);
    const [profileStudent, setProfileStudent] = useState<any>(null);

    const labelMapStudent: Record<string, string> = {
        name: "Họ và tên",
        student_id: "Mã sinh viên",
        email: "Email",
        phone: "Số điện thoại",
        dob: "Ngày sinh",
        majorName: "Chuyên ngành",
        className: "Lớp",
        address: "Địa chỉ",
        gender: "Giới tính",
    };
    const labelMapParent: Record<string, string> = {
        parent_id: "Mã phụ huynh",
        name: "Họ và tên",
        student_id: "Mã sinh viên", 
        studentName: "Họ tên con",
        address: "Địa chỉ",
        email: "Email",
        phone: "Số điện thoại",
        dob: "Ngày sinh",
        gender : "Giới tính"
    };

    const fetchProfile = async () => {
        try {
            const role = await AsyncStorage.getItem('role');
            if (!role) {
                throw new Error("No role found");
            }
            setRole(role);
            const data = await getProfile();
            if (!data){
                throw new Error("Invalid profile response"); 
                return;
            }
            let profileData = {};
            let navigationData = {};
            if (role === 'STUDENT') {
                profileData = {
                    name: data.name,
                    student_id: data.student_id,
                    className: data.className,
                    majorName: data.majorName,
                    email: data.email,
                    phone: data.phone,
                    address: data.address,
                    dob: data.dob,
                    gender: data.gender,
                };
                setProfileParent(data.parent);
                navigationData = {
                    name: data.name,
                    avatar: data?.avatar ,
                    student_id: data.student_id,
                };
                setAvatarUrl(data?.avatar);
        } else if (role === 'PARENT') {
                profileData = {
                    name: data.name,
                    student_id: data.student_id,
                    studentName: data.studentName,
                    address: data.address,
                    email: data.email,
                    phone: data.phone,
                    gender: data.gender,
                    dob: data.dob,
                };
                setProfileStudent(data.student);
                navigationData = {
                    name: data.name,
                    avatar: data?.avatar,
                    studentName: data.studentName,
                };
                setAvatarUrl(data?.avatar);
        }
            setProfileNavigation(navigationData);
            setProfile(profileData);
        } catch (error) {
            console.error("Fetch profile error:", error);
            throw error;

        }
    }
    useEffect(() => {
        fetchProfile();
    }, []);


    const getUpdateAvatar = async (file: any) => {
        try {
            if (!file) {
                throw new Error("No file provided");
            }
            const data = await updateAvatar(file);
            if (!data) {
                throw new Error("Invalid update avatar response");
            }
            return data;
            
        } catch (error) {
            console.error("Update avatar error:", error);
            throw error;
        }
    }
    const getchangePassword = async (currentPassword: string, newPassword: string) => {
        try {
            const data = await changePassword(currentPassword, newPassword);
            if (!data) {
                throw new Error("Invalid change password response");
            }
            return data;
            
        } catch (error) {
            console.error("Change password error:", error);
            throw error;
        }
    }

    const getUpdateProfileData = async (profileData: any) => {
        try {
            const data = await getUpdateProfile(profileData);
            if (!data) {
                throw new Error("Invalid update profile response");
            }
            return data;
        } catch (error) {
            console.error("Update profile error:", error);
            throw error;
        }
    }

    return{
        profile,
        profileNavigation,
        labelMap: profileNavigation?.student_id ? labelMapStudent : labelMapParent,
        role,
        getUpdateAvatar,
        avatarUrl,
        setAvatarUrl,
        getchangePassword,
        labelMapParent,
        labelMapStudent,
        profileParent,
        profileStudent,
        getUpdateProfileData,
        fetchProfile,
    }

}