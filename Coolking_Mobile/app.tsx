import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { NavigationContainer, NavigationContainerRef } from '@react-navigation/native';
import React, { useRef } from 'react';
import { Text, Platform } from 'react-native';
import AppRouter from "@/src/router/AppRouter";


export default function App() {
    const navigationRef = useRef(null);
    
    return (
        <NavigationContainer ref={navigationRef}>
            <GestureHandlerRootView style={{ flex: 1 }}>
                <AppRouter />
            </GestureHandlerRootView>
        </NavigationContainer>
    );
}