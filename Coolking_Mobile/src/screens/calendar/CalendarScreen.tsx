import React, { useMemo, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  StatusBar,
  Platform,
  FlatList,
  ActivityIndicator,
} from "react-native";
import { SafeAreaProvider, SafeAreaView } from "react-native-safe-area-context";
import { useNavigation } from "@react-navigation/native";
import { Calendar } from "react-native-calendars";
import dayjs from "dayjs";

import BottomNavigation from "@/src/components/navigations/BottomNavigations";
import TopNavigations_Calendar from "@/src/components/navigations/TopNavigations_Calendar";
import { useCalendar } from "@/src/services/useapi/calendar/UseCalender";

type Filter = "all" | "study" | "exam";

const getDayText = (day: number) => {
  const arr = ["Chủ nhật", "Thứ 2", "Thứ 3", "Thứ 4", "Thứ 5", "Thứ 6", "Thứ 7"];
  return arr[day === 7 ? 0 : day - 1];
};

export default function CalendarScreen() {
  const navigation = useNavigation<any>();
  const [filter, setFilter] = useState<Filter>("all");
  const [selectedDate, setSelectedDate] = useState(dayjs().format("YYYY-MM-DD"));

  const { loading, getMarkedDates, getSchedulesByDate } = useCalendar();

  // Dữ liệu lịch trong ngày
   // Dữ liệu lịch trong ngày
  const dayEvents = useMemo(() => {
    const schedules = getSchedulesByDate(selectedDate);
    const filtered = schedules.filter((s) => {
      if (filter === "all") return true;
      if (filter === "study") return s.schedule_info.type === 0;
      if (filter === "exam") return s.schedule_info.type === 1;
      return true;
    });

    return filtered
      .sort((a, b) => (a.schedule_info.start_lesson || 0) - (b.schedule_info.start_lesson || 0))
      .map((s) => ({
        id: s.schedule_id,
        title: s.subject_info.subject_name,
        // giữ lại time text để hiển thị nhanh
        time: `Tiết ${s.schedule_info.start_lesson} - ${s.schedule_info.end_lesson}`,
        // đồng thời truyền riêng start/end để xử lý ngoại lệ đổi tiết
        startLesson: s.schedule_info.start_lesson,
        endLesson: s.schedule_info.end_lesson,

        type: s.schedule_info.type === 0 ? "study" : "exam",
        location: s.schedule_info.room,

        // giảng viên gốc + mới (nếu có)
        lecturer: s.lecturer_info.original_lecturer,
        lecturerNew: s.lecturer_info.new_lecturer,

        status: s.schedule_info.status,
        session: s.subject_info.session_name,
        academic: s.subject_info.academic_year,

        // truyền nguyên exception_info để card xử lý chi tiết
        exception_info: s.exception_info,
      }));
  }, [selectedDate, filter, getSchedulesByDate]);


  // Marked dates quanh năm
  const marked = useMemo(() => {
    const base = getMarkedDates();
    return {
      ...base,
      [selectedDate]: {
        ...(base[selectedDate] || { dots: [] }),
        selected: true,
        selectedColor: "#007AFF",
      },
    };
  }, [getMarkedDates, selectedDate]);

  return (
    <SafeAreaProvider>
      <SafeAreaView style={styles.container}>
        <StatusBar
          barStyle="dark-content"
          backgroundColor={Platform.OS === "android" ? "#f8f9fa" : "transparent"}
        />

        <TopNavigations_Calendar
          initialFilter={filter}
          onChangeFilter={(f: Filter) => setFilter(f)}
        />

        <View style={styles.calendarWrap}>
          {loading ? (
            <ActivityIndicator style={{ padding: 20 }} size="large" color="#007AFF" />
          ) : (
            <Calendar
              current={selectedDate}
              onDayPress={(d) => setSelectedDate(d.dateString)}
              markedDates={marked}
              markingType="multi-dot"
              firstDay={1}
              theme={{
                todayTextColor: "#007AFF",
                selectedDayBackgroundColor: "#007AFF",
                selectedDayTextColor: "#fff",
                arrowColor: "#007AFF",
                monthTextColor: "#0f172a",
                textMonthFontWeight: "800",
                textDayHeaderFontWeight: "700",
              }}
              style={styles.calendar}
            />
          )}
        </View>

        <View style={styles.listWrap}>
          <View style={styles.listHeader}>
            <Text style={styles.sectionTitle}>
              {getDayText(dayjs(selectedDate).day() || 7)},{" "}
              {dayjs(selectedDate).format("DD/MM/YYYY")}
            </Text>
            <Text style={styles.eventCount}>
              {dayEvents.length}{" "}
              {filter === "all"
                ? "sự kiện"
                : filter === "study"
                ? "lịch học"
                : "lịch thi"}
            </Text>
          </View>

          {loading ? (
            <ActivityIndicator size="large" color="#007AFF" />
          ) : dayEvents.length === 0 ? (
            <EmptyState filter={filter} />
          ) : (
            <FlatList
              data={dayEvents}
              keyExtractor={(i) => i.id}
              renderItem={({ item }) => <EventCard item={item} />}
              ItemSeparatorComponent={() => <View style={{ height: 10 }} />}
              showsVerticalScrollIndicator={false}
            />
          )}
        </View>

        <BottomNavigation navigation={navigation} />
      </SafeAreaView>
    </SafeAreaProvider>
  );
}

// ================== CARD HIỂN THỊ ==================
function EventCard({ item }: { item: any }) {
  const isStudy = item?.type === "study";

  // TH nếu room bắt đầu bằng "TH"
  const isPractical = !!item?.location && /^TH[\s\-_]?/i.test(String(item.location).trim());

  // Màu nhận diện: LT = xanh dương, TH = xanh lá, Thi = đỏ
  const studyColor = isPractical ? "#22C55E" : "#2E86DE";
  const color = isStudy ? studyColor : "#E74C3C";
  const bg = isStudy ? (isPractical ? "#EAFBF1" : "#E8F1FE") : "#FDECEC";
  const border = isStudy ? (isPractical ? "#BEF3D0" : "#C7DBF9") : "#FAC8C6";
  const typeLabel = isStudy ? (isPractical ? "Học TH" : "Học LT") : "Thi";

  // Ngoại lệ
  const ex = item?.exception_info ?? null;
  const changes = ex?.changes ?? {};
  const isCanceled = ex?.exception_type === "CANCELED";

  // Thời gian
  const timeOld =
    item?.time ??
    ((item?.startLesson && item?.endLesson) ? `Tiết ${item.startLesson} - ${item.endLesson}` : "");

  const timeNew =
    ex?.new_start_lesson != null && ex?.new_end_lesson != null
      ? `Tiết ${ex.new_start_lesson} - ${ex.new_end_lesson}`
      : null;

  // Phòng
  const roomOld = item?.location ?? "";
  const roomNew = ex?.new_room ?? null;

  // Giảng viên
  const lecturerOld = item?.lecturer ?? "";
  const lecturerNew = (changes?.lecturer_changed && item?.lecturerNew) ? item.lecturerNew : null;

  // Ngày (nếu có đổi ngày)
  const fmt = (d?: string | null) =>
    d ? dayjs(d, ["YYYY-MM-DD", "DD-MM-YYYY"]).format("DD/MM/YYYY") : null;

  const dateOld = fmt(ex?.original_date);
  const dateNew = fmt(ex?.new_date);

  // Màu trạng thái
  const statusColor = isCanceled ? "#DC2626" : (ex ? "#D97706" : "#10B981");

  return (
    <View style={[styles.card, isCanceled && { opacity: 0.85 }]}>
      {/* Header: Pill + Time (có gạch ngang nếu đổi tiết) */}
      <View style={styles.cardHeader}>
        <View style={[styles.typePill, { backgroundColor: bg, borderColor: border }]}>
          <View style={[styles.dot, { backgroundColor: color }]} />
          <Text style={[styles.pillText, { color }]}>{typeLabel}</Text>
        </View>

        {!timeNew ? (
          !!timeOld && <Text style={styles.timeText}>{timeOld}</Text>
        ) : (
          <View style={{ alignItems: "flex-end" }}>
            <Text style={[styles.timeText, { textDecorationLine: "line-through", color: "#64748b" }]}>
              {timeOld}
            </Text>
            <Text style={[styles.timeText, { color }]}>{timeNew}</Text>
          </View>
        )}
      </View>

      {/* Tiêu đề + học kỳ/năm */}
      {!!item?.title && <Text style={styles.titleText}>{item.title}</Text>}
      {(item?.session || item?.academic) && (
        <Text style={styles.courseInfo}>
          {item?.session ?? ""}{item?.session && item?.academic ? " - " : ""}{item?.academic ?? ""}
        </Text>
      )}

      {/* Địa điểm */}
      {!!roomOld && !roomNew && (
        <Text style={styles.subText}>
          Địa điểm: {roomOld}
          {isStudy && <Text style={{ color, fontWeight: "700" }}> {isPractical ? "(TH)" : "(LT)"}</Text>}
        </Text>
      )}
      {!!roomNew && (
        <View style={{ marginTop: 2 }}>
          <Text style={[styles.subText, { textDecorationLine: "line-through", color: "#64748b" }]}>
            Địa điểm: {roomOld}
          </Text>
          <Text style={[styles.subText, { color }]}>
            → {roomNew}
            {isStudy && (
              <Text style={{ fontWeight: "700" }}>
                {" "}{/^TH/i.test(roomNew) ? "(TH)" : "(LT)"}
              </Text>
            )}
          </Text>
        </View>
      )}

      {/* Giảng viên */}
      {!!lecturerOld && !lecturerNew && (
        <Text style={styles.subText}>Giảng viên: {lecturerOld}</Text>
      )}
      {!!lecturerNew && (
        <View style={{ marginTop: 2 }}>
          <Text style={[styles.subText, { textDecorationLine: "line-through", color: "#64748b" }]}>
            Giảng viên: {lecturerOld}
          </Text>
          <Text style={[styles.subText, { color }]}>&rarr; {lecturerNew}</Text>
        </View>
      )}

      {/* Trạng thái / Ngoại lệ */}
      {isCanceled ? (
        <View style={[styles.exceptionWrap, { backgroundColor: "#FEF2F2", borderColor: "#FECACA" }]}>
          <Text style={[styles.exceptionText, { color: "#DC2626" }]}>
            ĐÃ HỦY{dateOld ? ` (gốc: ${dateOld})` : ""}
          </Text>
        </View>
      ) : ex ? (
        <View style={[styles.exceptionWrap, { backgroundColor: "#FFFAEB", borderColor: "#FDE68A" }]}>
          {changes?.date_changed && (dateOld || dateNew) && (
            <Text style={[styles.exceptionText, { color: "#D97706" }]}>
              Đổi ngày{dateOld ? ` ${dateOld}` : ""}{dateNew ? ` → ${dateNew}` : ""}
            </Text>
          )}
          {changes?.time_changed && timeNew && (
            <Text style={[styles.exceptionText, { color: "#D97706" }]}>
              Đổi tiết {timeOld} → {timeNew}
            </Text>
          )}
          {changes?.room_changed && roomNew && (
            <Text style={[styles.exceptionText, { color: "#D97706" }]}>
              Đổi phòng {roomOld} → {roomNew}
            </Text>
          )}
          {changes?.lecturer_changed && lecturerNew && (
            <Text style={[styles.exceptionText, { color: "#D97706" }]}>
              Đổi giảng viên {lecturerOld} → {lecturerNew}
            </Text>
          )}
        </View>
      ) : (
        !!item?.status && (
          <Text style={[styles.statusText, { color: statusColor }]}>{item.status}</Text>
        )
      )}
    </View>
  );
}


// ================== EMPTY STATE ==================
function EmptyState({ filter }: { filter: Filter }) {
  const msg =
    filter === "all"
      ? "Không có sự kiện trong ngày này"
      : filter === "study"
      ? "Không có lịch học trong ngày này"
      : "Không có lịch thi trong ngày này";
  return (
    <View style={styles.empty}>
      <Text style={styles.emptyTitle}>Không có sự kiện</Text>
      <Text style={styles.emptyDesc}>{msg}</Text>
    </View>
  );
}

// ================== STYLES ==================
const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#f8f9fa" },
  calendarWrap: {
    backgroundColor: "#fff",
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: "#e5e7eb",
  },
  calendar: { borderRadius: 12 },

  listWrap: { flex: 1, paddingHorizontal: 16, paddingTop: 10, paddingBottom: 70 },
  listHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
  },
  sectionTitle: { fontSize: 15, fontWeight: "800", color: "#0f172a" },
  eventCount: { fontSize: 13, color: "#64748b", fontWeight: "600" },

  card: {
    backgroundColor: "#fff",
    borderRadius: 14,
    padding: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 6,
    elevation: 2,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: "#EDF2F7",
  },
  cardHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 6,
  },
  typePill: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 999,
    borderWidth: 1,
  },
  dot: { width: 8, height: 8, borderRadius: 4 },
  pillText: { fontWeight: "800" },
  timeText: { color: "#334155", fontWeight: "700", marginBottom: 8 },

  titleText: { fontSize: 15, fontWeight: "800", color: "#0f172a", marginBottom: 2 },
  subText: { color: "#475569", fontWeight: "600" },
  courseInfo: { fontSize: 12, color: "#64748b", marginBottom: 4, fontWeight: "500" },

  empty: {
    backgroundColor: "#fff",
    borderRadius: 14,
    padding: 16,
    alignItems: "center",
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: "#e5e7eb",
    marginTop: 8,
  },
  emptyTitle: { fontWeight: "800", color: "#0f172a", marginBottom: 4 },
  emptyDesc: { color: "#64748b" },

  statusText: { marginTop: 4, fontSize: 13, fontWeight: "600" },
  exceptionWrap: {
    marginTop: 8,
    padding: 8,
    backgroundColor: "#FEF2F2",
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#FECACA",
  },
  exceptionText: { color: "#DC2626", fontSize: 13, fontWeight: "600" },
});
