import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from "axios";

const localhost = '192.168.159.1'
const URL = `http://${localhost}:3000`;


 export const getlogin = async (username: string, password: string) => {
     try {
        const response = await axios.post(`${URL}/api/public/login`, { username, password });
        return response.data;
     } catch (error) {
        console.error("Login error:", error);
        throw error;
     }
}
export const getcheckemail = async (email: string) => {
    try {
        const response = await axios.post(`${URL}/api/public/check-email/${email}`);
        return response.data;
    } catch (error) {
        console.error("Check email error:", error);
        throw error;
    }

}
export const  getVerifyOTP = async (email: string, otp: string) => {
    try {
        const response = await axios.post(`${URL}/api/public/verify-otp-email`, { email, otp });
        return response.data;
    } catch (error) {
        console.error("Verify OTP error:", error);
        throw error;
    }
}
export const getchangePassword = async (email: string, resetToken: string, newPassword: string) => {
    try {
        const response = await axios.post(`${URL}/api/public/change-password-by-email`, { email, resetToken, newPassword });
        return response.data;
    } catch (error) {
        console.error("Change password error:", error);
        throw error;
    }
}
