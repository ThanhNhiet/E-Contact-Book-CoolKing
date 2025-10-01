import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { NavigationContainer, NavigationContainerRef } from '@react-navigation/native';
import React, { useRef } from 'react';
import { Text, Platform } from 'react-native';
import AppRouter from "@/src/router/AppRouter";

// Set global font for all Text components - Cross-platform compatible
const setupGlobalTextStyles = () => {
    // Cross-platform default text styles
    const getDefaultTextStyle = () => {
        if (Platform.OS === 'android') {
            return {
                fontFamily: 'System',
                includeFontPadding: false,
                textAlignVertical: 'center' as const,
            };
        } else if (Platform.OS === 'ios') {
            return {
                fontFamily: 'System',
                fontWeight: 'normal' as const,
            };
        }
        // Fallback for other platforms
        return {
            fontFamily: 'System',
        };
    };

    // Try modern approach first
    try {
        const originalTextRender = (Text as any).render;
        if (originalTextRender) {
            (Text as any).render = function(props: any, ref: any) {
                const defaultStyle = getDefaultTextStyle();
                const newProps = {
                    ...props,
                    style: [defaultStyle, props.style]
                };
                return originalTextRender.call(this, newProps, ref);
            };
            return;
        }
    } catch (error) {
        console.warn('Modern Text override failed, using fallback:', error);
    }

    // Fallback approach for compatibility
    try {
        const defaultProps = (Text as any).defaultProps || {};
        (Text as any).defaultProps = {
            ...defaultProps,
            style: [getDefaultTextStyle(), defaultProps.style].filter(Boolean)
        };
    } catch (error) {
        console.warn('Text defaultProps fallback failed:', error);
    }
};

// Initialize global text styles
setupGlobalTextStyles();

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