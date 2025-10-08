import { Ionicons } from "@expo/vector-icons";
import React, { useState } from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";


export default function TopNavigations_Attendance() {
return(
    <View style={styles.container}>
        <Text style={styles.title}>Điểm danh</Text>
    </View>
);
}

const styles = StyleSheet.create({
    container: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "center",
        padding: 12,
        backgroundColor: "#fff",
        borderBottomWidth: 1,
        borderBottomColor: "#eee",
    },
    title: {
        fontSize: 16,
        fontWeight: "600",
        textAlign: "center",

    },
});
