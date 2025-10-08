import { createNativeStackNavigator } from "@react-navigation/native-stack";
import React from "react";

//import page home
import HomeScreen from "@/src/screens/home/HomeScreen";

//import page login
import LoginScreen from "@/src/screens/login/LoginScreen";

//import page forgot password
import ForgotPasswordScreen from "@/src/screens/forgotpassword/ForgotPasswordScreen";

//import page change password
import ChangePasswordScreen from "@/src/screens/changepassword/ChangePasswordScreen";

//import page otp verify
import OtpVerifyScreen from "@/src/screens/otpverify/OtpVerifyScreen";

//import page attendance
import AttendanceScreen from "@/src/screens/attendance/AttendanceScreen";

//import page calendar
import CalendarScreen from "@/src/screens/calendar/CalendarScreen";

//import page profile
import ProfileScreen from "@/src/screens/profile/ProfileSceen";


const Stack = createNativeStackNavigator();

export default function AppRouter() {
    return (
        <Stack.Navigator initialRouteName="LoginScreen">
            {/*Login Screen*/}
            <Stack.Screen
                name="LoginScreen"
                component={LoginScreen}
                options={{
                    headerShown: false,
                }}
            />
            {/*Home Screen*/}
            <Stack.Screen
                name="HomeScreen"
                component={HomeScreen}
                options={{
                    headerShown: false,
                }}
            />
            {/*Forgot Password Screen*/}
            <Stack.Screen
                name="ForgotPasswordScreen"
                component={ForgotPasswordScreen}
                options={{
                    headerShown: false,
                }}
            />
            {/*Change Password Screen*/}
            <Stack.Screen
                name="ChangePasswordScreen"
                component={ChangePasswordScreen}
                options={{
                    headerShown: false,
                }}
            />
            {/*Otp Verify Screen*/}
            <Stack.Screen
                name="OtpVerifyScreen"
                component={OtpVerifyScreen}
                options={{
                    headerShown: false,
                }}
            />
            {/*Attendance Screen*/}
            <Stack.Screen
                name="AttendanceScreen"
                component={AttendanceScreen}
                options={{
                    headerShown: false,
                }}
            />
            {/*Calendar Screen*/}
            <Stack.Screen
                name="CalendarScreen"
                component={CalendarScreen}
                options={{
                    headerShown: false,
                }}
            />
            {/*Profile Screen*/}
            <Stack.Screen
                name="ProfileScreen"
                component={ProfileScreen}
                options={{
                    headerShown: false,
                }}
            />
           

        </Stack.Navigator>
    );
}