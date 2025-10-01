import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Alert, StatusBar, Platform } from 'react-native';
import { SafeAreaProvider, SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';

export default function LoginScreen() {
    const navigation = useNavigation<any>();

    const handleLogin = () => {
        Alert.alert('Login', 'Login button pressed!');
        // Navigate to Home screen
        navigation.navigate('HomeScreen');
    };

    return (
        <SafeAreaProvider>
            <SafeAreaView style={styles.container}>
                <StatusBar 
                    barStyle={Platform.OS === 'ios' ? 'dark-content' : 'dark-content'}
                    backgroundColor={Platform.OS === 'android' ? '#f5f5f5' : 'transparent'}
                    translucent={Platform.OS === 'android' ? false : false}
                    hidden={false}
                    animated={true}
                />

                {/*Content */}
                <Text style={styles.title}>Login Screen</Text>
                <Text style={styles.subtitle}>ABC - Test Login Screen</Text>

                <TouchableOpacity style={styles.button} onPress={handleLogin}>
                    <Text style={styles.buttonText}>Login & Go to Home</Text>
                </TouchableOpacity>
            </SafeAreaView>
        </SafeAreaProvider >
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#f5f5f5',
        padding: 20,
    },
    title: {
        fontSize: 24,
        fontWeight: Platform.OS === 'ios' ? '600' : 'normal',
        marginBottom: 10,
        color: '#333',
        ...(Platform.OS === 'android' && {
            includeFontPadding: false,
            textAlignVertical: 'center',
        }),
    },
    subtitle: {
        fontSize: 16,
        fontWeight: 'normal',
        marginBottom: 30,
        color: '#666',
        textAlign: 'center',
        ...(Platform.OS === 'android' && {
            includeFontPadding: false,
            textAlignVertical: 'center',
        }),
    },
    button: {
        backgroundColor: '#007AFF',
        paddingHorizontal: 30,
        paddingVertical: Platform.OS === 'ios' ? 15 : 18,
        borderRadius: Platform.OS === 'ios' ? 12 : 8,
        minHeight: 50,
        justifyContent: 'center',
        alignItems: 'center',
        // Android shadow
        ...(Platform.OS === 'android' && {
            elevation: 3,
        }),
        // iOS shadow
        ...(Platform.OS === 'ios' && {
            shadowOffset: { width: 0, height: 2 },
            shadowOpacity: 0.25,
            shadowRadius: 3.84,
        }),
    },
    buttonText: {
        color: '#fff',
        fontSize: 16,
        fontWeight: Platform.OS === 'ios' ? '600' : 'normal',
        textAlign: 'center',
        ...(Platform.OS === 'android' && {
            includeFontPadding: false,
            textAlignVertical: 'center',
        }),
    },
});