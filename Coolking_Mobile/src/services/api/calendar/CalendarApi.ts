import AsyncStorage from "@react-native-async-storage/async-storage";
import axiosInstance from "@/src/configs/axiosInstance";


export const getCalendarExamsAndStudy = async (page: number, limit: number) => {
    try {
        const role = await AsyncStorage.getItem("role");
        if (!role) throw new Error("Role not found in storage");
        let URL='';
        if(role==="STUDENT"){
            URL=`api/students/my-schedule?page=${page}&limit=${limit}`;
        } else if(role==="PARENT"){
            URL=`api/parents/my-schedule?page=${page}&limit=${limit}`;
        }
        const response  = await axiosInstance.get(URL);
        if (!response.data) {
            throw new Error("Invalid response structure");
        }
        return response.data;
        
    } catch (error) {
        console.error("Calendar API error:", error);
        throw error;
    }
} 
