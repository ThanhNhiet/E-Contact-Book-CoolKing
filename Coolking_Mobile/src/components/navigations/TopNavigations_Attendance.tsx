import { Ionicons } from "@expo/vector-icons";
import React, { useState } from "react";
import { StyleSheet, Text, TouchableOpacity, View} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";


export default function TopNavigations_Attendance() {
return(
    <SafeAreaView>
    <View style={styles.container}>
        <Text style={styles.title}>Điểm danh</Text>
    </View>
    </SafeAreaView>
);
}

const styles = StyleSheet.create({
    container: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "center",
        padding: 12,
        backgroundColor: "#6e2febff",
        borderBottomWidth: 1,
        borderBottomColor: "#eee",
    },
    title: {
        fontSize: 16,
        fontWeight: "600",
        textAlign: "center",
        color: "#e5f0f0ff",
    },
});
