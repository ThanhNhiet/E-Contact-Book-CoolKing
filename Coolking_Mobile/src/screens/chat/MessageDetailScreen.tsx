import React from "react";
import { View, Text } from "react-native";
import { useNavigation } from "expo-router";
import TopNavigations_Detail from "@/src/components/navigations/TopNavigations";
import { SafeAreaProvider, SafeAreaView } from "react-native-safe-area-context";


export default function MessageDetailScreen() {
    const navigation = useNavigation();
  return (
    <SafeAreaProvider>
      <SafeAreaView>
        <View>
          <TopNavigations_Detail navigation={navigation} name="Chi tiết hội thoại" />
          <Text>Message Detail Screen</Text>
        </View>
      </SafeAreaView>
    </SafeAreaProvider>
  );
}