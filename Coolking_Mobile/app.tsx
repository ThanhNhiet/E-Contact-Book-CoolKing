import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { NavigationContainer, NavigationContainerRef } from '@react-navigation/native';
import React, { useRef } from 'react';
import { Text, Platform } from 'react-native';
import AppRouter from "@/src/router/AppRouter";

// Set global font for all Text components
const originalTextRender = (Text as any).render;
if (originalTextRender) {
    (Text as any).render = function(props: any, ref: any) {
        const defaultStyle = Platform.OS === 'android' 
            ? { fontFamily: 'System', includeFontPadding: false }
            : { fontFamily: 'System' };
            
        const newProps = {
            ...props,
            style: [defaultStyle, props.style]
        };
        return originalTextRender.call(this, newProps, ref);
    };
} else {
    // Fallback for newer React Native versions
    const defaultProps = (Text as any).defaultProps;
    (Text as any).defaultProps = {
        ...defaultProps,
        style: Platform.OS === 'android' 
            ? { fontFamily: 'System', includeFontPadding: false }
            : { fontFamily: 'System' }
    };
}

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