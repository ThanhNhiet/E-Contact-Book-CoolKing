import {getProfile,updateAvatar} from "@/src/services/api/profile/ProfileApi";
import { useState, useEffect } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";

export const useProfile = () => {
 
    const [profile, setProfile] = useState<any>(null);
    const [profileNavigation, setProfileNavigation] = useState<any>(null);
    const [role, setRole] = useState<string | null>(null);
    const [avatarUrl, setAvatarUrl] = useState<string | null>(null);

    const labelMapStudent: Record<string, string> = {
        name: "Họ và tên",
        student_id: "Mã sinh viên",
        email: "Email",
        phone: "Số điện thoại",
        dob: "Ngày sinh",
        majorName: "Chuyên ngành",
        clazzName: "Lớp",
        address: "Địa chỉ",
        gender: "Giới tính",
    };
    const labelMapParent: Record<string, string> = {
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
                    clazzName: data.clazzName,  
                    majorName: data.majorName,
                    email: data.email,
                    phone: data.phone,
                    address: data.address,
                    dob: data.dob,
                    gender: data.gender,
                };
                navigationData = {
                    name: data.name,
                    avatar: data.avatar || "https://i.pravatar.cc/150?img=3",
                    student_id: data.student_id,
                };
                setAvatarUrl(data.avatar || "https://i.pravatar.cc/150?img=3");
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
                navigationData = {
                    name: data.name,
                    avatar: data.avatar || "https://i.pravatar.cc/150?img=3",
                    studentName: data.studentName,
                };
                setAvatarUrl(data.avatar || "https://i.pravatar.cc/150?img=3");
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

    return{
        profile,
        profileNavigation,
        labelMap: profileNavigation?.student_id ? labelMapStudent : labelMapParent,
        role,
        getUpdateAvatar,
        avatarUrl,
        setAvatarUrl,
    }

}