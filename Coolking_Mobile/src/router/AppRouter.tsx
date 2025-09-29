import { createNativeStackNavigator } from "@react-navigation/native-stack";
import React from "react";

//import page home
import HomeScreen from "@/src/screens/home/HomeScreen";

//import page login
import LoginScreen from "@/src/screens/auth/LoginScreen";

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

        </Stack.Navigator>
    );
}