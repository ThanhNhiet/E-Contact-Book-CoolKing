import React from "react";
import {
  Modal,
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  FlatList,
  Pressable,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";


export type NotificationItem = {
  _id: string;
  senderID: string;
  receiverID: string | null; // receiverID can be null
  header: string;
  body?: string;
  targetScope: string;
  isRead?: boolean;
  createdAt: string | number | Date;
  updatedAt?: string | number | Date;
};

interface Props {
  visible: boolean;
  notifications: NotificationItem[];
  onClose: () => void;
  onPressItem: (item: NotificationItem) => void;
  onMarkAllRead: () => void;
  fetchNotifications: () => Promise<void>;
}

const formatTime = (input: string | number | Date) => {
  const d = new Date(input);
  const hh = String(d.getHours()).padStart(2, "0");
  const mm = String(d.getMinutes()).padStart(2, "0");
  return `${hh}:${mm} • ${d.getDate()}/${d.getMonth() + 1}/${d.getFullYear()}`;
};

export default function NotificationModal({
  visible,
  notifications,
  onClose,
  onPressItem,
  onMarkAllRead,
  fetchNotifications,
}: Props) {


  const handlePressItem = async (item: NotificationItem) => {
   
  };
  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <Pressable style={styles.overlay} onPress={onClose}>
        <Pressable style={styles.modalContainer}>
          {/* Header */}
          <View style={styles.header}>
            <Text style={styles.headerTitle}>Thông báo</Text>
            {notifications.length > 0 && (
              <TouchableOpacity onPress={onMarkAllRead}>
                <Text style={styles.markAll}>Đã đọc hết</Text>
              </TouchableOpacity>
            )}
          </View>

          {/* Danh sách */}
          {notifications.length === 0 ? (
            <View style={styles.empty}>
              <Ionicons name="checkmark-circle-outline" size={48} color="#aaa" />
              <Text style={styles.emptyText}>Không có thông báo</Text>
            </View>
          ) : (
            <FlatList
              data={notifications}
              keyExtractor={(it) => it._id}
              renderItem={({ item }) => (
                <TouchableOpacity
                  style={[styles.item, !item.isRead && styles.itemUnread]}
                  onPress={() => {handlePressItem(item)}}
                  activeOpacity={0.7}
                >
                  {/* <Ionicons
                    name={item.icon || "notifications-outline"}
                    size={22}
                    color={item.isRead ? "#666" : "#007AFF"}
                    style={{ marginRight: 10 }}
                  /> */}
                  <View style={{ flex: 1 }}>
                    <Text
                      style={[styles.itemTitle, !item.isRead && styles.itemTitleUnread]}
                      numberOfLines={2}
                    >
                      {item.header}
                    </Text>
                    {!!item.body && (
                      <Text style={styles.itemBody} numberOfLines={2}>
                        {item.body}
                      </Text>
                    )}
                    <Text style={styles.itemTime}>{formatTime(item.createdAt)}</Text>
                  </View>
                </TouchableOpacity>
              )}
              ItemSeparatorComponent={() => <View style={styles.separator} />}
              showsVerticalScrollIndicator={false}
            />
          )}
        </Pressable>
      </Pressable>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.3)",
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 20,
  },
  modalContainer: {
    width: "90%",
    maxHeight: "70%",
    backgroundColor: "#fff",
    borderRadius: 16,
    paddingVertical: 16,
    paddingHorizontal: 14,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 6,
    elevation: 10,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 10,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: "#333",
  },
  markAll: {
    color: "#007AFF",
    fontWeight: "600",
    fontSize: 14,
  },
  item: {
    flexDirection: "row",
    alignItems: "flex-start",
    paddingVertical: 10,
  },
  itemUnread: {
    backgroundColor: "#F6F9FF",
    borderRadius: 8,
    paddingHorizontal: 6,
  },
  itemTitle: { fontSize: 15, fontWeight: "600", color: "#333" },
  itemTitleUnread: { color: "#0A58FF" },
  itemBody: { fontSize: 13, color: "#555", marginTop: 2 },
  itemTime: { fontSize: 12, color: "#888", marginTop: 4 },
  separator: { height: 1, backgroundColor: "#eee", marginVertical: 6 },
  empty: { alignItems: "center", paddingVertical: 30 },
  emptyText: { color: "#999", marginTop: 6 },
});
