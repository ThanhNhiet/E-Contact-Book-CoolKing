import { Ionicons } from "@expo/vector-icons";
import React,{useState} from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import SearchChatModal  from "../modals/SearchChatModal";   

type props = {
  navigation: any;
  name: string;
};

export default function TopNavigations_Chat({ navigation, name }: props) {

    const [open, setOpen] = useState(false);
    const onPress = () => setOpen(true);

  return (
    <>
    <View style={styles.container}>
      {/* Nút Back */}
      <TouchableOpacity
        style={styles.leftButton} 
        onPress={() => navigation.goBack()}
        activeOpacity={0.7}
      >
        <Ionicons name="arrow-back" size={24} color="#e5f0f0ff" />
      </TouchableOpacity>

      {/* Tiêu đề */}
      <Text style={styles.title} numberOfLines={1}>{name}</Text>

      {/* Nút Search */}
      <TouchableOpacity 
        style={styles.rightButton} 
        onPress={onPress}
        activeOpacity={0.7}
      >
        <Ionicons name="search" size={24} color="#e5f0f0ff" />
      </TouchableOpacity>
    </View>

    <SearchChatModal
      visible={open}
      onClose={() => setOpen(false)}
      navigation={navigation}
    />

    </>
  );
}

const styles = StyleSheet.create({
  container: {
    height: 60,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center", 
    backgroundColor: "#6e2febff",
    paddingHorizontal: 14, 
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: "#a088ff",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 3,
    elevation: 4,
  },
  title: {
    flex: 1, 
    fontSize: 17,
    fontWeight: "700",
    color: "#e5f0f0ff",
    textAlign: "center", 
    marginHorizontal: 10, 
  },
  // Style chung cho các nút
  button: {
    padding: 6,
    justifyContent: "center",
    alignItems: "center",
  },
  // Style riêng cho nút trái
  leftButton: {
    position: "absolute",
    left: 14,
    padding: 6,
  },
  // Style riêng cho nút phải
  rightButton: {
    position: "absolute",
    right: 14,
    padding: 6,
  },
});