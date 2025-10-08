import { Ionicons } from "@expo/vector-icons";
import React, { useMemo, useState } from "react";
import { StyleSheet, Text, TouchableOpacity, View, Image } from "react-native";
import NotificationModal, { NotificationItem } from "@/src/components/modals/NotificationModal";

interface Props {
  navigation: any;
  profileNavigation?: {
    name: string;
    avatar: string;
    student_id: string;
  };
  initialNotifications?: NotificationItem[];
}

export default function TopNavigations_Home({
  navigation: any,
  profileNavigation,
  initialNotifications,
}: Props) {
  const [open, setOpen] = useState(false);
  const [notifications, setNotifications] = useState<NotificationItem[]>(
    initialNotifications ?? [
      { id: "1", title: "Điểm danh hôm nay", body: "Đừng quên điểm danh buổi sáng", createdAt: Date.now(), read: false, icon: "checkmark-circle" },
      { id: "2", title: "Lịch thi cập nhật", body: "Môn CSDL chuyển sang 20/10", createdAt: Date.now() - 3600_000, read: true, icon: "calendar" },
      { id: "3", title: "Tin hệ thống", body: "Đổi mật khẩu định kỳ để bảo mật tốt hơn", createdAt: Date.now() - 7200_000, read: false, icon: "shield-checkmark" },
    ]
  );

  const unread = useMemo(() => notifications.filter(n => !n.read).length, [notifications]);

  const onPressBell = () => setOpen(true);

  const onPressItem = (item: NotificationItem) => {
    setNotifications(cur => cur.map(n => (n.id === item.id ? { ...n, read: true } : n)));
    // ví dụ: điều hướng chi tiết nếu cần
    // navigation.navigate("SomeDetail", { id: item.id });
  };

  const onMarkAllRead = () => {
    setNotifications(cur => cur.map(n => ({ ...n, read: true })));
  };

  return (
    <>
      <View style={styles.container}>
        {/* Avatar + Name */}
        <View style={styles.leftSection}>
          <Image source={{ uri: profileNavigation?.avatar || "https://i.pravatar.cc/150?img=3" }} style={styles.avatar} />
          <View style={{ marginLeft: 10 }}>
            <Text style={styles.welcomeText}>Xin chào,</Text>
            <Text style={styles.userName}>{profileNavigation?.name || "Người dùng"}</Text>
          </View>
        </View>

        {/* Bell + Badge */}
        <TouchableOpacity style={styles.iconButton} onPress={onPressBell} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
          <Ionicons name="notifications-outline" size={26} color="#333" />
          {unread > 0 && (
            <View style={styles.badge}>
              <Text style={styles.badgeText}>{unread}</Text>
            </View>
          )}
        </TouchableOpacity>
      </View>

      {/* Modal thông báo */}
      <NotificationModal
        visible={open}
        notifications={notifications}
        onClose={() => setOpen(false)}
        onPressItem={onPressItem}
        onMarkAllRead={onMarkAllRead}
      />
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    height: 70,
    backgroundColor: "#6e2febff",
    paddingHorizontal: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.1,
    shadowRadius: 5,
    elevation: 6,
  },
  leftSection: { flexDirection: "row", alignItems: "center" },
  avatar: { width: 46, height: 46, borderRadius: 23, backgroundColor: "#ddd" },
  welcomeText: { fontSize: 13, color: "#e5f0f0ff" },
  userName: { fontSize: 16, fontWeight: "700", color: "#e5f0f0ff" },
  iconButton: { padding: 6 ,color: "#e5f0f0ff"},
  badge: {
    position: "absolute",
    right: 2,
    top: 2,
    minWidth: 18,
    height: 18,
    borderRadius: 9,
    backgroundColor: "#FF3B30",
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 4,
  },
  badgeText: { color: "#fff", fontSize: 11, fontWeight: "700" },
});
