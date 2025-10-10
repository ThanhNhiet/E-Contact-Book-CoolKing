import AsyncStorage from "@react-native-async-storage/async-storage";
import axiosInstance from "@/src/configs/axiosInstance";

///api/schedules/by-user?currentDate=10/10/2025
export const getCalendarExamsAndStudy = async (date: string) => {
    try {
        const response  = await axiosInstance.get(`/api/schedules/by-user?currentDate=${date}`);
        if (!response.data) {
            throw new Error("Invalid response structure");
        }
        return response.data;
        
    } catch (error) {
        console.error("Calendar API error:", error);
        throw error;
    }
} 
