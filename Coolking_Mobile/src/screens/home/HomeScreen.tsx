import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Alert, StatusBar, Platform } from 'react-native';
import { SafeAreaProvider, SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';

export default function HomeScreen() {
    const navigation = useNavigation<any>();

    const handleBackToLogin = () => {
        Alert.alert('Navigate', 'Going back to Login!');
        navigation.goBack();
    };

    const handleShowAlert = () => {
        Alert.alert('Home Action', 'Home screen button pressed!');
    };

    return (
        <SafeAreaProvider>
            <SafeAreaView style={styles.container}>
                <StatusBar 
                    barStyle={Platform.OS === 'ios' ? 'dark-content' : 'dark-content'}
                    backgroundColor={Platform.OS === 'android' ? '#f8f9faaf' : 'transparent'}
                    translucent={Platform.OS === 'android' ? false : false}
                    hidden={false}
                    animated={true}
                />


                {/*Content */}
                <Text style={styles.title}>Home Screen</Text>
                <Text style={styles.subtitle}>ABC - Test Home Screen</Text>
                <Text style={styles.welcomeText}>Welcome to the Home Screen! 🎉</Text>
                
                <View style={styles.buttonContainer}>
                    <TouchableOpacity style={[styles.button, styles.primaryButton]} onPress={handleShowAlert}>
                        <Text style={styles.buttonText}>Test Home Action</Text>
                    </TouchableOpacity>
                    
                    <TouchableOpacity style={[styles.button, styles.secondaryButton]} onPress={handleBackToLogin}>
                        <Text style={[styles.buttonText, styles.secondaryButtonText]}>Back to Login</Text>
                    </TouchableOpacity>
                </View>
            </SafeAreaView>
        </SafeAreaProvider>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#f8f9fa',
        padding: 20,
    },
    title: {
        fontSize: 28,
        fontWeight: Platform.OS === 'ios' ? 'bold' : 'normal',
        marginBottom: 10,
        color: '#2c3e50',
        ...(Platform.OS === 'android' && {
            includeFontPadding: false,
            textAlignVertical: 'center',
        }),
    },
    subtitle: {
        fontSize: 16,
        fontWeight: 'normal',
        marginBottom: 20,
        color: '#7f8c8d',
        textAlign: 'center',
        ...(Platform.OS === 'android' && {
            includeFontPadding: false,
            textAlignVertical: 'center',
        }),
    },
    welcomeText: {
        fontSize: 18,
        fontWeight: Platform.OS === 'ios' ? '500' : 'normal',
        marginBottom: 40,
        color: '#27ae60',
        textAlign: 'center',
        ...(Platform.OS === 'android' && {
            includeFontPadding: false,
            textAlignVertical: 'center',
        }),
    },
    buttonContainer: {
        width: '100%',
        gap: Platform.OS === 'ios' ? 15 : 12,
    },
    button: {
        paddingHorizontal: 30,
        paddingVertical: Platform.OS === 'ios' ? 15 : 18,
        borderRadius: Platform.OS === 'ios' ? 12 : 8,
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: 50,
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
    primaryButton: {
        backgroundColor: '#27ae60',
    },
    secondaryButton: {
        backgroundColor: '#ecf0f1',
        borderWidth: Platform.OS === 'ios' ? 0 : 1,
        borderColor: '#bdc3c7',
    },
    buttonText: {
        fontSize: 16,
        fontWeight: Platform.OS === 'ios' ? '600' : 'normal',
        color: '#fff',
        textAlign: 'center',
        ...(Platform.OS === 'android' && {
            includeFontPadding: false,
            textAlignVertical: 'center',
        }),
    },
    secondaryButtonText: {
        color: '#2c3e50',
    },
});