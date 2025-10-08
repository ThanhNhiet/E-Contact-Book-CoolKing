import axiosInstance from "@/src/configs/axiosInstance";
import AsyncStorage from '@react-native-async-storage/async-storage';
import {getUserInfoFromToken} from "@/src/utils/DecodeToken";


export const getProfile = async () => {
    try {
        const role = await AsyncStorage.getItem('role');
        const userId = await AsyncStorage.getItem('userId');
        let URL = '';
        if (role === 'STUDENT') {
            URL = `/api/students/${userId}`;
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
        console.log("URL:", URL);
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




