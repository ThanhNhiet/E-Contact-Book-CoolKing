import { Ionicons } from "@expo/vector-icons";
import React, { useState, useEffect } from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { useNavigation, useRoute } from "@react-navigation/native";
import { SafeAreaView } from "react-native-safe-area-context";


interface Props {
  navigation: any;
}

export default function BottomNavigations({ navigation }: Props) {
  const route = useRoute();
  const [activeTab, setActiveTab] = useState(route.name);

  const tabs = [
    { name: "HomeScreen", label: "Trang chủ", icon: "home-outline", iconActive: "home" },
    { name: "AttendanceScreen", label: "Điểm danh", icon: "checkmark-circle-outline", iconActive: "checkmark-circle" },
    { name: "CalendarScreen", label: "Lịch", icon: "calendar-outline", iconActive: "calendar" },
    { name: "ProfileScreen", label: "Hồ sơ", icon: "person-outline", iconActive: "person" },
  ];

  useEffect(() => {
    // Cập nhật khi route thay đổi
    setActiveTab(route.name);
  }, [route.name]);

  const handleNavigate = (screen: string) => {
    navigation.navigate(screen);
  };

  return (
     <SafeAreaView edges={["bottom"]} style={{ backgroundColor: "#e6f4fa" }}>
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
              size={28}
              color={isActive ? "#007AFF" : "#666"}
            />
            <Text style={[styles.text, isActive && styles.textActive]}>
              {tab.label}
            </Text>
          </TouchableOpacity>
        );
      })}
    </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    justifyContent: "space-around",
    alignItems: "center",
    height: 65,
    backgroundColor: "#e6f4fa",
    borderTopWidth: 1,
    borderTopColor: "#cfd8dc",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 6,
  },
  button: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingVertical: 6,
  },
  text: {
    fontSize: 12,
    marginTop: 3,
    color: "#666",
    fontWeight: "500",
  },
  textActive: {
    color: "#007AFF",
    fontWeight: "700",
  },
});
