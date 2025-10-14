import { Ionicons } from "@expo/vector-icons";
import React, { useMemo, useState } from "react";
import { StyleSheet, Text, TouchableOpacity, View, Image } from "react-native";
import NotificationModal, { NotificationItem } from "@/src/components/modals/NotificationModal";
import { UseNotification } from "@/src/services/useapi/notification/UseNotification";
interface Props {
  navigation: any;
  profileNavigation?: {
    name: string;
    avatar: string;
    student_id: string;
  };
}

export default function TopNavigations_Home({
  navigation: any,
  profileNavigation,
}: Props) {

  const {
    notifications,
    setNotifications, 
    loading, 
    error,  
    fetchNotifications,
    markNotificationAsRead,
    markSystemNotificationAsRead,
    markAllNotificationsAsRead,
    getDeleteSystemNotification
  } = UseNotification();
  const [open, setOpen] = useState(false);
 

  const unread = useMemo(() => notifications.filter(n => !n.isRead).length, [notifications]);

  const onPressBell = () => setOpen(true);

  const onPressItem =  async () => {
    //setNotifications(cur => cur.map(n => (n._id === item._id ? { ...n, isRead: true } : n)));
    // ví dụ: điều hướng chi tiết nếu cần
     await fetchNotifications();
    // navigation.navigate("SomeDetail", { id: item.id });
  };

  const onMarkAllRead = () => {
    markAllNotificationsAsRead();
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
          <Ionicons name="notifications-outline" size={26} color="#eae2e2ff" />
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
        fetchNotifications={fetchNotifications}
        markNotificationAsRead={markNotificationAsRead}
        markSystemNotificationAsRead={markSystemNotificationAsRead}
        getDeleteSystemNotification={getDeleteSystemNotification}
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
