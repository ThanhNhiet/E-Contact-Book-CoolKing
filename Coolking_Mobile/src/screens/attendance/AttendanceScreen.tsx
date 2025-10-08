import React from "react";
import {
  View,
  Text,
  StyleSheet,
  StatusBar,
  Platform,
} from "react-native";
import { SafeAreaProvider, SafeAreaView } from "react-native-safe-area-context";
import { useNavigation } from "@react-navigation/native";
import BottomNavigation from "@/src/components/navigations/BottomNavigations";
import TopNavigations_Attendance from "@/src/components/navigations/TopNavigations_Attendance";

export default function AttendanceScreen() {
  const navigation = useNavigation<any>();

  return (
    <SafeAreaProvider>
      <SafeAreaView style={styles.container}>
        <StatusBar
          barStyle={Platform.OS === "ios" ? "dark-content" : "dark-content"}
          backgroundColor={Platform.OS === "android" ? "#f8f9fa" : "transparent"}
          translucent={false}
          animated
        />

        {/* Top Navigation */}
        <TopNavigations_Attendance />

        {/* Nội dung chính */}
        <View style={styles.content}>
          <Text style={styles.title}>Chào mừng bạn đến trang điểm danh!</Text>
        </View>

        {/* Thanh điều hướng dưới */}
        <View style={styles.bottomWrapper}>
          <BottomNavigation navigation={navigation} />
        </View>
      </SafeAreaView>
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f8f9fa",
  },
  content: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  title: {
    fontSize: 22,
    fontWeight: "600",
    color: "#333",
  },
  bottomWrapper: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    width: "100%",
  },
});
