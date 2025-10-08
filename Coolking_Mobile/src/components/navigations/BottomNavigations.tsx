import { Ionicons } from "@expo/vector-icons";
import React, { useState } from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";

interface Props {
  navigation: any;
}

export default function BottomNavigations({ navigation }: Props) {
  const [activeTab, setActiveTab] = useState("HomeScreen");

  const tabs = [
    { name: "HomeScreen", label: "Trang chủ", icon: "home-outline", iconActive: "home" },
    { name: "AttendanceScreen", label: "Điểm danh", icon: "checkmark-circle-outline", iconActive: "checkmark-circle" },
    { name: "CalendarScreen", label: "Lịch", icon: "calendar-outline", iconActive: "calendar" },
    { name: "ProfileScreen", label: "Hồ sơ", icon: "person-outline", iconActive: "person" },
  ];

  const handleNavigate = (screen: string) => {
    setActiveTab(screen);
    navigation.navigate(screen);
  };

  return (
    <View style={styles.container}>
      {tabs.map((tab) => {
        const isActive = activeTab === tab.name;
        return (
          <TouchableOpacity
            key={tab.name}
            style={styles.button}
            onPress={() => handleNavigate(tab.name)}
            activeOpacity={0.8}
          >
            <Ionicons
              name={isActive ? (tab.iconActive as any) : (tab.icon as any)}
              size={26}
              color={isActive ? "#007AFF" : "#666"}
            />
            <Text style={[styles.text, isActive && styles.textActive]}>{tab.label}</Text>
          </TouchableOpacity>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    justifyContent: "space-around",
    alignItems: "center",
    height: 65,
    backgroundColor: "#aad9eeff",
    borderTopWidth: 1,
    borderTopColor: "#ddd",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 8, // Android shadow
  },
  button: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingVertical: 6,
  },
  text: {
    fontSize: 12,
    marginTop: 2,
    color: "#666",
    fontWeight: "500",
  },
  textActive: {
    color: "#007AFF",
    fontWeight: "700",
  },
});
