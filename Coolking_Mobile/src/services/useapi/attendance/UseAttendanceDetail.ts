import { useCallback, useState,useEffect } from "react";
import { getAttendanceByStudentBySubject } from "@/src/services/api/attendance/AttendanceApi";


type ItemAttendanceDetail = {
    subject_info: ItemSubjectInfo;
    statistics: ItemStatistics;
    attendance_details: Array<ItemAttendanceDetails>;
}
type ItemSubjectInfo = {
    faculty_name: string;
    subject_name: string;
    total_sessions: number;
}
type ItemStatistics = {
    absent: number;
    attendance_rate: string;
    late: number;
    present: number;
    total_sessions: number;
}
type ItemAttendanceDetails = {
    course_section_id: string;
    date: string;
    description: string;
    end_lesson: number;
    start_lesson: number;
    session:string;
    status: string;
}

export const useAttendanceDetail = (courseSectionId: string, subjectId: string) => {
    const [attendanceDetails, setAttendanceDetails] = useState<ItemAttendanceDetail | null>(null);
    const [loading, setLoading] = useState<boolean>(false);
    const [error, setError] = useState<string | null>(null);


    const fetchAttendanceDetails = useCallback(async () => {
        setLoading(true);
        try {
            const data = await getAttendanceByStudentBySubject(courseSectionId, subjectId);
            setAttendanceDetails(data);
        } catch (error) {
            setError("Error fetching attendance details");
        } finally {
            setLoading(false);
        }
    }, [courseSectionId, subjectId]);



    useEffect(() => {
        fetchAttendanceDetails();
    }, [courseSectionId, subjectId, fetchAttendanceDetails]);

    return {
        attendanceDetails,
        loading,
        error,
        fetchAttendanceDetails,
    };
}