import {getCourseSectionsByStudent } from "@/src/services/api/attendance/AttendanceApi";
import { set } from "date-fns";
import { useEffect,useState,useCallback } from "react";

type ItemCourseSectionType = {
    course_section_id: String;
    subjectName: String;
    subject_id: String;
    className: String;
    facultyName: String;
    sessionName: String;
    lecturerName: String;
    createdAt: String;
}


export const useAttendance = () => {

    const [courseSections, setCourseSections] = useState<ItemCourseSectionType[]>([]);
    const [loading, setLoading] = useState<boolean>(false);
    const [error, setError] = useState<string | null>(null);
    const [page, setPage] = useState<number>(1);
    const [pageSize, setPageSize] = useState<number>(10);
    const [totalPages, setTotalPages] = useState<any[]>([]);
    
   

    const fetchCourseSections = useCallback(async () => {
        setLoading(true);
        try {
            const data = await getCourseSectionsByStudent(page, pageSize);
            setCourseSections(data.courseSections);
            setTotalPages(data.pages);
        } catch (error) {
            setError("Error fetching course sections");
        } finally {
            setLoading(false);
        }
    }, [page, pageSize]);

    useEffect(() => {
        fetchCourseSections();
    }, [fetchCourseSections]);


    return {
        courseSections,
        loading,
        error,
        page,
        setPage,
        totalPages,
    };
}