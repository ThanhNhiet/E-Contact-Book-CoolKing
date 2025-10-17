import {getAttendanceByStudentBySubject_Parent} from "@/src/services/api/attendance/AttendanceApi";
import { useEffect,useState,useCallback } from "react";

interface ApiResponse {
    children: ChildData[];
}
interface ChildData {
    student_id: string;
    student_name: string;
    course_sections: CourseSection[]; // Sửa từ 'course_section' thành 'course_sections'
}
interface CourseSection {
    subject_info: SubjectInfo; // Sửa từ 'subject_infor' thành 'subject_info'
    statistics: Statistics;
    attendance_details: AttendanceDetail[];
}
interface SubjectInfo {
    course_section_id: string;
    faculty_name: string;
    subject_name: string;
    session: string;
}
interface Statistics {
    absent: number;
    attendance_rate: string;
    late: number;
    present: number;
    total_sessions: number;
}
interface AttendanceDetail {
    date: string;
    description: string;
    end_lesson: number;
    start_lesson: number;
    status: string;
}



export const useAttendance_Parent = () => {
    const [attendanceDetails, setAttendanceDetails] = useState<ApiResponse | null>(null);
    const [loading, setLoading] = useState<boolean>(false);
    const [error, setError] = useState<string | null>(null);
    const [page, setPage] = useState<number>(1);
    const [totalPages, setTotalPages] = useState<number | null>(null);
    const pageSize = 10;

    const fetchAttendanceDetails = useCallback(async (page: number, pageSize: number) => {
        setLoading(true);
        setError(null);
        try {
            const data = await getAttendanceByStudentBySubject_Parent(page, pageSize);

            setAttendanceDetails(data);

            // Nếu bạn chắc chắn API luôn trả về totalPages, có thể giữ dòng này.
            // Nếu không, nên kiểm tra trước:
            if (data && data.pagination.totalPages) {
                setTotalPages(data.pagination.totalPages);
            }

        } catch (error) {
            const errorMessage = error instanceof Error ? error.message : "Failed to fetch attendance details";
            setError(errorMessage);
        } finally {
            setLoading(false);
        }

    }, []);

    useEffect(() => {
        fetchAttendanceDetails(page, pageSize);
    }, [fetchAttendanceDetails, page, pageSize]);


    return {
        attendanceDetails,
        loading,
        error,
        page,
        setPage,
        totalPages,
    };
}