import { Ionicons } from "@expo/vector-icons";
import React from "react";
import { StyleSheet, Text, TouchableOpacity, View, Image } from "react-native";

interface Props {
  navigation: any;
  chatPartner: {
    name: string;
    avatar: string;
    isOnline: boolean;
  };
}

export default function TopNavigations_Message({ navigation, chatPartner }: Props) {
  const ICON_COLOR = "#FFFFFF"; // Định nghĩa màu icon chung

  return (
    <View style={styles.container}>
      <TouchableOpacity onPress={() => navigation.goBack()}>
        {/* THAY ĐỔI: Màu icon đã được đổi thành màu sáng */}
        <Ionicons name="arrow-back" size={24} color={ICON_COLOR} />
      </TouchableOpacity>

      <Image source={{ uri: chatPartner.avatar }} style={styles.headerAvatar} />

      <View>
        <Text style={styles.headerName}>{chatPartner.name}</Text>
        {chatPartner.isOnline && <Text style={styles.headerStatus}>Đang hoạt động</Text>}
      </View>

      <View style={styles.headerActions}>
        <TouchableOpacity style={{ marginRight: 16 }}>
           {/* THAY ĐỔI: Sử dụng màu icon chung */}
          <Ionicons name="call-outline" size={24} color={ICON_COLOR} />
        </TouchableOpacity>
        <TouchableOpacity>
           {/* THAY ĐỔI: Sử dụng màu icon chung */}
          <Ionicons name="videocam-outline" size={26} color={ICON_COLOR} />
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    height: 60,
    flexDirection: "row",
    alignItems: "center",
    // Sử dụng padding để tạo khoảng cách đều từ các cạnh màn hình
    paddingHorizontal: 16,
    backgroundColor: "#6A3DE8", // Một màu tím hiện đại và dễ chịu hơn
    // Bỏ shadow và border để có giao diện phẳng, sạch sẽ
  },
  headerAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    // Điều chỉnh lại khoảng cách giữa các phần tử
    marginLeft: 16,
    marginRight: 12,
  },
  headerName: {
    fontSize: 17, // Tăng kích thước chữ cho dễ đọc
    fontWeight: '600',
    color: '#FFFFFF', // Màu trắng tinh để có độ tương phản tốt nhất
  },
  headerStatus: {
    fontSize: 13,
    // Sử dụng màu trắng mờ để tạo sự phân cấp thông tin
    color: 'rgba(255, 255, 255, 0.8)',
  },
  headerActions: {
    flexDirection: 'row',
    // Thuộc tính này rất quan trọng để đẩy các icon về phía bên phải
    marginLeft: 'auto',
    alignItems: 'center',
  },
});