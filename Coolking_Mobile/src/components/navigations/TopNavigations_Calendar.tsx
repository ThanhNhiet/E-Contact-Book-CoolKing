import { Ionicons } from "@expo/vector-icons";
import React, { useState } from "react";
import { StyleSheet, Text, TouchableOpacity, View, Modal, Pressable } from "react-native";

type CalendarFilter = "all" | "study" | "exam";

type Props = {
  onChangeFilter?: (f: CalendarFilter) => void; // callback đổi filter (optional)
  initialFilter?: CalendarFilter;               // filter ban đầu
};

export default function TopNavigations_Calendar({
  onChangeFilter,
  initialFilter = "all",
}: Props) {
  const [open, setOpen] = useState(false);
  const [filter, setFilter] = useState<CalendarFilter>(initialFilter);

  const apply = (f: CalendarFilter) => {
    setFilter(f);
    onChangeFilter?.(f);
    setOpen(false);
  };

  const labelOf = (f: CalendarFilter) =>
    f === "all" ? "Tất cả" : f === "study" ? "Lịch học" : "Lịch thi";

  return (
    <>
      <View style={styles.container}>
        <Text style={styles.title}>Lịch học / Lịch thi</Text>

        <TouchableOpacity style={styles.filterBtn} onPress={() => setOpen(true)}>
          <Ionicons name="calendar-outline" size={22} color="#333" />
          <Text style={styles.filterText}>{labelOf(filter)}</Text>
          <Ionicons name="chevron-down" size={18} color="#666" />
        </TouchableOpacity>
      </View>

      {/* Modal chọn bộ lọc */}
      <Modal visible={open} transparent animationType="fade" onRequestClose={() => setOpen(false)}>
        <Pressable style={styles.backdrop} onPress={() => setOpen(false)}>
          <Pressable style={styles.sheet}>
            <View style={styles.sheetHeader}>
              <Text style={styles.sheetTitle}>Chọn bộ lọc</Text>
              <TouchableOpacity onPress={() => setOpen(false)}>
                <Ionicons name="close" size={22} color="#333" />
              </TouchableOpacity>
            </View>

            {/* Option: Tất cả */}
            <OptionRow
              label="Tất cả"
              selected={filter === "all"}
              icon="grid-outline"
              onPress={() => apply("all")}
            />
            <Divider />

            {/* Option: Lịch học */}
            <OptionRow
              label="Lịch học"
              selected={filter === "study"}
              icon="school-outline"
              onPress={() => apply("study")}
            />
            <Divider />

            {/* Option: Lịch thi */}
            <OptionRow
              label="Lịch thi"
              selected={filter === "exam"}
              icon="reader-outline"
              onPress={() => apply("exam")}
            />
          </Pressable>
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
    <TouchableOpacity style={rowStyles.row} onPress={onPress} activeOpacity={0.7}>
      <View style={rowStyles.left}>
        <Ionicons name={icon} size={20} color={selected ? "#007AFF" : "#555"} />
        <Text style={[rowStyles.text, selected && { color: "#007AFF", fontWeight: "700" }]}>{label}</Text>
      </View>
      <Ionicons
        name={selected ? "radio-button-on" : "radio-button-off"}
        size={20}
        color={selected ? "#007AFF" : "#999"}
      />
    </TouchableOpacity>
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
    backgroundColor: "#fff",
    borderBottomWidth: 1,
    borderBottomColor: "#eee",
  },
  title: {
    fontSize: 16,
    fontWeight: "600",
    color: "#222",
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

  backdrop: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.25)",
    justifyContent: "flex-end",
  },
  sheet: {
    backgroundColor: "#fff",
    paddingHorizontal: 14,
    paddingTop: 12,
    paddingBottom: 14,
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: -3 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 16,
  },
  sheetHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 8,
  },
  sheetTitle: {
    fontSize: 16,
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
