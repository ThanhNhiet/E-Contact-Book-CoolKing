import { useEffect, useState, useCallback } from "react";
import dayjs from "dayjs";
import isSameOrAfter from "dayjs/plugin/isSameOrAfter";
import isSameOrBefore from "dayjs/plugin/isSameOrBefore";
import customParseFormat from "dayjs/plugin/customParseFormat";
import { getCalendarExamsAndStudy } from "@/src/services/api/calendar/CalendarApi";

dayjs.extend(isSameOrAfter);
dayjs.extend(isSameOrBefore);
dayjs.extend(customParseFormat);

// ================== TYPE DEFINITIONS ==================
interface StudentInfo {
  student_id: string;
  student_name: string;
  class_name: string;
}
interface SubjectInfo {
  subject_name: string;
  session_name: string;
  academic_year: string;
  course_start_date: string;
  course_end_date: string;
}
interface ScheduleInfo {
  day_of_week: number; // 1..7 (CN=1)
  start_lesson: number;
  end_lesson: number;
  schedule_date: string | null;
  room: string;
  type: number; // 0=study, 1=exam
  status: string;
}
interface LecturerInfo {
  original_lecturer: string;
  new_lecturer: string | null;
}
interface OriginalInfo {
  start_lesson: number;
  end_lesson: number;
  date: string | null;
  room: string;
}
interface ExceptionInfo {
  exception_type: string;
  original_date: string;
  new_date: string;
  new_start_lesson: number | null;
  new_end_lesson: number | null;
  new_room: string | null;
  changes: {
    time_changed: boolean;
    date_changed: boolean;
    room_changed: boolean;
    lecturer_changed: boolean;
  };
}
export interface Schedule {
  schedule_id: string;
  course_section_id: string;
  student_info: StudentInfo;
  subject_info: SubjectInfo;
  schedule_info: ScheduleInfo;
  lecturer_info: LecturerInfo;
  original_info: OriginalInfo;
  exception_info: ExceptionInfo | null;
}

// ================== HELPERS ==================
const parseDate = (str?: string) => {
  if (!str) return dayjs('invalid');
  const norm = String(str).trim().replace(/[/.]/g, "-");
  const isISO = /^\d{4}-\d{2}-\d{2}$/.test(norm);
  return isISO ? dayjs(norm, "YYYY-MM-DD", true) : dayjs(norm, "DD-MM-YYYY", true);
};

// API dùng 1..7 (CN=1 → Th7=7)
const weekdayMatch = (apiDow?: number, selectedDow0?: number) => {
  if (apiDow == null || selectedDow0 == null) return false;
  const mapped = apiDow === 1 ? 0 : apiDow - 1;
  return mapped === selectedDow0;
};

// ================== MAIN HOOK ==================
export const useCalendar = () => {
  const [examSchedules, setExamSchedules] = useState<Schedule[]>([]);
  const [studySchedules, setStudySchedules] = useState<Schedule[]>([]);
  const [loading, setLoading] = useState(false);

  // Fetch data
  const fetchCalendar = useCallback(async (page = 1, limit = 30) => {
    try {
      setLoading(true);
      const data = await getCalendarExamsAndStudy(page, limit);
      setExamSchedules(Array.isArray(data?.exams) ? data.exams : []);
      setStudySchedules(Array.isArray(data?.schedules) ? data.schedules : []);
    } catch (err) {
      console.error("❌ Fetch calendar error:", err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchCalendar(1, 30);
  }, [fetchCalendar]);

  // ================== getSchedulesByDate ==================
  const getSchedulesByDate = useCallback(
    (date: string) => {
      const selected = dayjs(date);
      const selectedDow0 = selected.day(); // 0..6

      // Lọc lịch học trong range
      const study = studySchedules.filter((s) => {
        const si = s?.schedule_info;
        const sub = s?.subject_info;
        if (!si || !sub) return false;

        const start = parseDate(sub.course_start_date);
        const end = parseDate(sub.course_end_date);

        // chỉ lấy lịch học có thứ trùng & trong khoảng start-end
        return (
          start.isValid() &&
          end.isValid() &&
          weekdayMatch(si.day_of_week, selectedDow0) &&
          selected.isSameOrAfter(start, "day") &&
          selected.isSameOrBefore(end, "day")
        );
      });

      // Lịch thi theo ngày cụ thể
      const exams = examSchedules.filter((ex) => {
        const dStr = ex?.schedule_info?.schedule_date;
        if (!dStr) return false;
        const d = parseDate(dStr);
        return d.isValid() && d.format("YYYY-MM-DD") === date;
      });

      return [...study, ...exams].sort(
        (a, b) =>
          (a.schedule_info.start_lesson || 0) -
          (b.schedule_info.start_lesson || 0)
      );
    },
    [studySchedules, examSchedules]
  );

  // Helper: xác định phòng thực hành (room bắt đầu bằng "TH", không phân biệt hoa thường)
const isPracticalRoom = (room?: string | null) => {
  if (!room) return false;
  return /^TH[\s\-_]?/i.test(room.trim()); // match "TH", "TH_", "TH-"
};

const getMarkedDates = useCallback(() => {
  const marked: Record<string, { dots: { key: string; color: string }[] }> = {};

  // Lịch học: chỉ vẽ dot trong đúng range course_start_date → course_end_date
  studySchedules.forEach((s) => {
    const si = s?.schedule_info;
    const sub = s?.subject_info;
    if (!si || !sub) return;

    const start = parseDate(sub.course_start_date);
    const end = parseDate(sub.course_end_date);
    if (!start.isValid() || !end.isValid()) return;

    const practical = isPracticalRoom(si.room); // ✅ phân loại theo room
    const studyColor = practical ? "#22C55E" /* TH: xanh lá */ : "#2E86DE" /* LT: xanh dương */;

    let cur = start.startOf("day");
    while (cur.isSameOrBefore(end, "day")) {
      const curDow0 = cur.day();
      if (weekdayMatch(si.day_of_week, curDow0)) {
        const key = cur.format("YYYY-MM-DD");
        if (!marked[key]) marked[key] = { dots: [] };
        marked[key].dots.push({
          // ✅ key duy nhất + có nhãn loại để tránh đụng nhau
          key: `${practical ? "studyTH" : "studyLT"}-${s.schedule_id}`,
          color: studyColor,
        });
      }
      cur = cur.add(1, "day");
    }
  });

  // Lịch thi
  examSchedules.forEach((ex) => {
    const dStr = ex?.schedule_info?.schedule_date;
    if (!dStr) return;
    const d = parseDate(dStr);
    if (!d.isValid()) return;

    const key = d.format("YYYY-MM-DD");
    if (!marked[key]) marked[key] = { dots: [] };
    marked[key].dots.push({
      key: `exam-${ex.schedule_id}`,
      color: "#E74C3C",
    });
  });

  return marked;
}, [studySchedules, examSchedules]);



  return {
    loading,
    studySchedules,
    examSchedules,
    getSchedulesByDate,
    getMarkedDates,
    fetchCalendar,
  };
};
