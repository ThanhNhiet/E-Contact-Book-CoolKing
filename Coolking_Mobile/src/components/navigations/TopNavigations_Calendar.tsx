import { Ionicons } from "@expo/vector-icons";
import React, { useState } from "react";
import { StyleSheet, Text, TouchableOpacity, View, Modal, Pressable, Animated } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
type CalendarFilter = "all" | "study" | "exam";

type Props = {
  onChangeFilter?: (f: CalendarFilter) => void;
  initialFilter?: CalendarFilter;
};

export default function TopNavigations_Calendar({
  onChangeFilter,
  initialFilter = "all",
}: Props) {
  const [open, setOpen] = useState(false);
  const [filter, setFilter] = useState<CalendarFilter>(initialFilter);
  const [slideAnim] = useState(new Animated.Value(-300)); // slide animation

  const apply = (f: CalendarFilter) => {
    setFilter(f);
    onChangeFilter?.(f);
    closeModal();
  };

  const labelOf = (f: CalendarFilter) =>
    f === "all" ? "Tất cả" : f === "study" ? "Lịch học" : "Lịch thi";

  const openModal = () => {
    setOpen(true);
    Animated.timing(slideAnim, {
      toValue: 0,
      duration: 250,
      useNativeDriver: true,
    }).start();
  };

  const closeModal = () => {
    Animated.timing(slideAnim, {
      toValue: -300,
      duration: 200,
      useNativeDriver: true,
    }).start(() => setOpen(false));
  };

  return (
    <>
      <View style={styles.container}>
        <Text style={styles.title}>Lịch học / Lịch thi</Text>

        <TouchableOpacity style={styles.filterBtn} onPress={openModal}>
          <Ionicons name="calendar-outline" size={22} color="#333" />
          <Text style={styles.filterText}>{labelOf(filter)}</Text>
          <Ionicons name="chevron-down" size={18} color="#666" />
        </TouchableOpacity>
      </View>

      {/* Modal chọn bộ lọc bên trái */}
      <Modal visible={open} transparent animationType="none" onRequestClose={closeModal}>
        <Pressable style={styles.overlay} onPress={closeModal}>
          <Animated.View style={[styles.sidePanel, { transform: [{ translateX: slideAnim }] }]}>
            {/* Header */}
            <View style={styles.sheetHeader}>
              <Text style={styles.sheetTitle}>Chọn bộ lọc</Text>
              <TouchableOpacity onPress={closeModal}>
                <Ionicons name="close" size={22} color="#333" />
              </TouchableOpacity>
            </View>

            <OptionRow
              label="Tất cả"
              selected={filter === "all"}
              icon="grid-outline"
              onPress={() => apply("all")}
            />
            <Divider />
            <OptionRow
              label="Lịch học"
              selected={filter === "study"}
              icon="school-outline"
              onPress={() => apply("study")}
            />
            <Divider />
            <OptionRow
              label="Lịch thi"
              selected={filter === "exam"}
              icon="reader-outline"
              onPress={() => apply("exam")}
            />
          </Animated.View>
        </Pressable>
      </Modal>
    </>

  );
}

/* ==== Item option ==== */
function OptionRow({
  label,
  selected,
  onPress,
  icon,
}: {
  label: string;
  selected: boolean;
  onPress: () => void;
  icon: keyof typeof Ionicons.glyphMap;
}) {
  return (
    <SafeAreaView>
    <TouchableOpacity style={rowStyles.row} onPress={onPress} activeOpacity={0.7}>
      <View style={rowStyles.left}>
        <Ionicons name={icon} size={20} color={selected ? "#6e2febff" : "#555"} />
        <Text style={[rowStyles.text, selected && { color: "#6e2febff", fontWeight: "700" }]}>{label}</Text>
      </View>
      <Ionicons
        name={selected ? "radio-button-on" : "radio-button-off"}
        size={20}
        color={selected ? "#6e2febff" : "#aaa"}
      />
    </TouchableOpacity>
    </SafeAreaView>
  );
}

function Divider() {
  return <View style={{ height: 1, backgroundColor: "#eee", marginVertical: 6 }} />;
}

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    padding: 12,
    backgroundColor: "#6e2febff",
    borderBottomWidth: 1,
    borderBottomColor: "#eee",
  },
  title: {
    fontSize: 16,
    fontWeight: "600",
    color: "#e5f0f0ff",
  },
  filterBtn: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#F4F6F8",
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 10,
  },
  filterText: {
    marginHorizontal: 6,
    fontSize: 14,
    color: "#333",
    fontWeight: "600",
  },
  overlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.25)",
    flexDirection: "row",
    justifyContent: "flex-start",
  },
  sidePanel: {
    width: "70%",
    height: "100%",
    backgroundColor: "#fff",
    paddingHorizontal: 16,
    paddingVertical: 20,
    borderTopRightRadius: 16,
    borderBottomRightRadius: 16,
    shadowColor: "#000",
    shadowOffset: { width: 2, height: 0 },
    shadowOpacity: 0.2,
    shadowRadius: 6,
    elevation: 10,
  },
  sheetHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 16,
  },
  sheetTitle: {
    fontSize: 17,
    fontWeight: "700",
    color: "#333",
  },
});

const rowStyles = StyleSheet.create({
  row: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 12,
    justifyContent: "space-between",
  },
  left: { flexDirection: "row", alignItems: "center", gap: 10 },
  text: { marginLeft: 10, fontSize: 15, color: "#333" },
});
