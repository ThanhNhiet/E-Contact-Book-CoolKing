import axiosInstance from "@/src/configs/axiosInstance";
import AsyncStorage from '@react-native-async-storage/async-storage';
import {getUserInfoFromToken} from "@/src/utils/DecodeToken";


export const getProfile = async () => {
    try {
        const role = await AsyncStorage.getItem('role');
        const userId = await AsyncStorage.getItem('userId');
        let URL = '';
        if (role === 'STUDENT') {
            URL = `/api/students/info-view-le-ad/${userId}`;
        } else if (role === 'PARENT') {
            URL = `/api/parents/${userId}`;
        }
        const response = await axiosInstance.get(URL);
        return response.data;
    } catch (error) {
        console.error("Fetch profile error:", error);
        throw error;
    }
}

export const updateAvatar = async (fileData: any) => {
    try {
        const role = await AsyncStorage.getItem('role');
        const userId = await AsyncStorage.getItem('userId');
        let URL = '';
        if (role === 'STUDENT') {
            URL = `/api/students/upload-avatar/${userId}`;
        } else if (role === 'PARENT') {
            URL = `/api/parents/upload-avatar/${userId}`;
        }
        const file = new FormData();
            file.append('file',{
                uri: fileData.uri,
                name: fileData.name || `photo.${fileData.uri.split('.').pop()}`,
                type: fileData.mimeType || 'image/jpeg',
            } as any);

        const response = await axiosInstance.post(URL,
            file
        ,{headers: {'Content-Type': 'multipart/form-data'}
        });
        
        return response.data;
    } catch (error) {
        console.error("Update avatar error:", error);
        throw error;
    }
}

export const changePassword = async (currentPassword: string, newPassword: string) => {
    try {
        const response = await axiosInstance.post('/api/accounts/change-password', {
            oldPassword: currentPassword,
            newPassword: newPassword
        });
        return response.data;
    } catch (error) {
        console.error("Change password error:", error);
        throw error;
    }
}

export const getUpdateProfile = async (profileData: any) => {
    try {
        const role = await AsyncStorage.getItem('role');
        if(!role) throw new Error("No role found");
        let URL = '';
        if (role === 'STUDENT') {
            URL = `/api/students/update-info`;
        } else if (role === 'PARENT') {
            URL = `/api/parents/update-info`;
        }
        const response = await axiosInstance.put(URL, {
            name: profileData.name,
            email: profileData.email,
            phone: profileData.phone,
            address: profileData.address,
            gender: profileData.gender,
            dob: profileData.dob,
        });
        return response.data;
    } catch (error) {
        console.error("Get update profile error:", error);
        throw error;
    }
}
