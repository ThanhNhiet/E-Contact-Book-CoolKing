import { Ionicons } from "@expo/vector-icons";
import React from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";

type props = {
  navigation: any;
  name: string;
};

export default function TopNavigations({ navigation, name }: props) {
  return (
    <View style={styles.container}>
      {/* Nút Back */}
      <TouchableOpacity
        style={styles.button}
        onPress={() => navigation.goBack()}
        activeOpacity={0.7}
      >
        <Ionicons name="arrow-back" size={24} color="#e5f0f0ff" />
      </TouchableOpacity>

      {/* Tiêu đề */}
      <Text style={styles.title}>{name}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    height: 60,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#6e2febff",
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: "#a088ff",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 3,
    elevation: 4,
  },
  title: {
    fontSize: 17,
    fontWeight: "700",
    color: "#e5f0f0ff",
    textAlign: "center",
  },
  button: {
    position: "absolute",
    left: 14,
    padding: 6,
    justifyContent: "center",
    alignItems: "center",
  },
});
