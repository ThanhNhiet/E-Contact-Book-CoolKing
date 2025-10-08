import React from "react";
import {
  Modal, View, Text, StyleSheet, TouchableOpacity, FlatList, Pressable
} from "react-native";
import { Ionicons } from "@expo/vector-icons";

export type NotificationItem = {
  id: string;
  title: string;
  body?: string;
  createdAt: string | number | Date;
  read?: boolean;
  icon?: keyof typeof Ionicons.glyphMap;
};

type Props = {
  visible: boolean;
  notifications: NotificationItem[];
  onClose: () => void;
  onPressItem?: (item: NotificationItem) => void;
  onMarkAllRead?: () => void;
  title?: string;
};

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
  title = "Thông báo",
}: Props) {
  const unreadCount = notifications.filter((n) => !n.read).length;

  const renderItem = ({ item }: { item: NotificationItem }) => {
    const isUnread = !item.read;
    return (
      <Pressable
        style={[styles.item, isUnread && styles.itemUnread]}
        onPress={() => onPressItem?.(item)}
        android_ripple={{ color: "#eee" }}
      >
        <View style={styles.itemLeft}>
          <View style={[styles.iconWrap, isUnread && styles.iconWrapUnread]}>
            <Ionicons name={item.icon || "notifications"} size={20} color={isUnread ? "#007AFF" : "#666"} />
          </View>
        </View>
        <View style={styles.itemContent}>
          <Text style={[styles.itemTitle, isUnread && styles.itemTitleUnread]} numberOfLines={2}>
            {item.title}
          </Text>
          {!!item.body && <Text style={styles.itemBody} numberOfLines={2}>{item.body}</Text>}
          <Text style={styles.itemTime}>{formatTime(item.createdAt)}</Text>
        </View>
        {isUnread && <View style={styles.dot} />}
      </Pressable>
    );
  };

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <Pressable style={styles.backdrop} onPress={onClose}>
        <Pressable style={styles.sheet}>
          {/* Header */}
          <View style={styles.header}>
            <View style={styles.headerLeft}>
              <Ionicons name="notifications-outline" size={20} color="#333" />
              <Text style={styles.headerTitle}>{title}</Text>
              {unreadCount > 0 && (
                <View style={styles.badge}>
                  <Text style={styles.badgeText}>{unreadCount}</Text>
                </View>
              )}
            </View>

            <View style={styles.headerRight}>
              {notifications.length > 0 && (
                <TouchableOpacity onPress={onMarkAllRead} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
                  <Text style={styles.markAll}>Đã đọc hết</Text>
                </TouchableOpacity>
              )}
              <TouchableOpacity onPress={onClose} style={{ marginLeft: 12 }}>
                <Ionicons name="close" size={22} color="#333" />
              </TouchableOpacity>
            </View>
          </View>

          {/* List */}
          {notifications.length === 0 ? (
            <View style={styles.empty}>
              <Ionicons name="checkmark-circle-outline" size={48} color="#9e9e9e" />
              <Text style={styles.emptyText}>Không có thông báo</Text>
            </View>
          ) : (
            <FlatList
              data={notifications}
              keyExtractor={(it) => it.id}
              renderItem={renderItem}
              contentContainerStyle={{ paddingBottom: 16 }}
              ItemSeparatorComponent={() => <View style={styles.separator} />}
              showsVerticalScrollIndicator={false}
            />
          )}
        </Pressable>
      </Pressable>
    </Modal>
  );
}

const SHEET_MAX_HEIGHT = 520;

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.25)",
    justifyContent: "flex-end",
  },
  sheet: {
    backgroundColor: "#fff",
    paddingTop: 12,
    paddingBottom: 8,
    paddingHorizontal: 14,
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
    maxHeight: SHEET_MAX_HEIGHT,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.15,
    shadowRadius: 6,
    elevation: 12,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 12,
    justifyContent: "space-between",
  },
  headerLeft: { flexDirection: "row", alignItems: "center" },
  headerRight: { flexDirection: "row", alignItems: "center" },
  headerTitle: { fontSize: 18, fontWeight: "700", marginLeft: 8, color: "#333" },
  markAll: { color: "#007AFF", fontSize: 14, fontWeight: "600" },
  badge: {
    marginLeft: 8,
    minWidth: 20,
    height: 20,
    paddingHorizontal: 6,
    borderRadius: 10,
    backgroundColor: "#FF3B30",
    alignItems: "center",
    justifyContent: "center",
  },
  badgeText: { color: "#fff", fontSize: 12, fontWeight: "700" },

  item: { flexDirection: "row", alignItems: "flex-start", paddingVertical: 10 },
  itemUnread: { backgroundColor: "#F5F9FF" },
  itemLeft: { paddingTop: 2, paddingRight: 8 },
  iconWrap: {
    width: 34, height: 34, borderRadius: 17, backgroundColor: "#f0f0f0",
    alignItems: "center", justifyContent: "center",
  },
  iconWrapUnread: { backgroundColor: "#E6F0FF" },
  itemContent: { flex: 1 },
  itemTitle: { fontSize: 15, color: "#333", fontWeight: "700" },
  itemTitleUnread: { color: "#0A58FF" },
  itemBody: { fontSize: 13, color: "#555", marginTop: 2 },
  itemTime: { fontSize: 12, color: "#888", marginTop: 6 },
  dot: { width: 8, height: 8, borderRadius: 4, backgroundColor: "#FF3B30", marginLeft: 8, marginTop: 6 },

  empty: { alignItems: "center", paddingVertical: 32 },
  emptyText: { color: "#9e9e9e", marginTop: 8, fontSize: 14 },
  separator: { height: 1, backgroundColor: "#eee" },
});
