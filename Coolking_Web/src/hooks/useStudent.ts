import { useState, useCallback } from 'react';
import { studentServices } from '../services/studentServices';

// Example response from getStudentsByCourseSection
// {
//     "course_section_id": "405e3df6-93a7-11f0-a902-088fc3521198",
//     "subjectName": "Điện toán đám mây",
//     "className": "DHCNTT17B",
//     "sessionName": "HK1",
//     "facultyName": "Khoa Công nghệ thông tin",
//     "lecturerName": "Tran Thi J",
//     "students": [
//         {
//             "no": 1,
//             "student_id": "SV2100101",
//             "name": "Sinh Vien 101",
//             "dob": "12-04-2003",
//             "score": {
//                 "theo_regular1": 8.3,
//                 "theo_regular2": 9.2,
//                 "theo_regular3": 6.4,
//                 "pra_regular1": 9.3,
//                 "pra_regular2": 7.4,
//                 "pra_regular3": 9,
//                 "mid": 7.6,
//                 "final": 6.3,
//                 "avr": 7.18
//             },
//             "initial_evaluate": "ok"
//         },
//         {
//             "no": 2,
//             "student_id": "SV2100102",
//             "name": "Sinh Vien 102",
//             "dob": "13-04-2003",
//             "score": {
//                 "theo_regular1": 8.4,
//                 "theo_regular2": 9.9,
//                 "theo_regular3": 9.6,
//                 "pra_regular1": 8,
//                 "pra_regular2": 6.3,
//                 "pra_regular3": 7.7,
//                 "mid": 9.6,
//                 "final": 9.6,
//                 "avr": 9.12
//             },
//             "initial_evaluate": "ok"
//         },
//         ...

// Response from getStudentInfo
// {
//     "student_id": "SV2100101",
//     "name": "Sinh Vien 101",
//     "dob": "12-04-2003",
//     "gender": "Nam",
//     "avatar": null,
//     "phone": "0907000101",
//     "email": "sv2100101@stu.edu.vn",
//     "address": "Can Tho",
//     "className": "DHCNTT17B",
//     "facultyName": "Khoa Công nghệ thông tin",
//     "majorName": "Kỹ thuật phần mềm",
//     "parent": {
//         "parent_id": "PA00101",
//         "name": "Phu huynh 101",
//         "gender": "Nam",
//         "phone": "0915000101",
//         "email": "pa00101@stu.edu.vn"
//     }
// }

export interface courseSectionWithStudents {
    course_section_id: string;
    subjectName: string;
    className: string;
    sessionName: string;
    facultyName: string;
    lecturerName: string;
    students: StudentWithScore[];
}

export interface StudentWithScore {
    no: number;
    student_id: string;
    name: string;
    dob: string;
    score: Score;
    initial_evaluate: string;
}

export interface Score {
    theo_regular1: number | null;
    theo_regular2: number | null;
    theo_regular3: number | null;
    pra_regular1: number | null;
    pra_regular2: number | null;
    pra_regular3: number | null;
    mid: number | null;
    final: number | null;
    avr: number | null;
}

export const useStudent = () => {
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string>('');
    const [courseSectionData, setCourseSectionData] = useState<courseSectionWithStudents | null>(null);
    const [studentInfo, setStudentInfo] = useState<any>(null);

    const fetchStudentsByCourseSection = useCallback(async (course_section_id: string) => {
        setLoading(true);
        setError('');
        try {
            const data = await studentServices.getStudentsByCourseSection(course_section_id);
            setCourseSectionData(data);
        } catch (err: any) {
            setError(err.message || 'Failed to fetch course sections');
        } finally {
            setLoading(false);
        }
    }, []);

    const fetchStudentInfo = useCallback(async (student_id: string) => {
        setLoading(true);
        setError('');
        try {
            const data = await studentServices.getStudentInfo(student_id);
            setStudentInfo(data);
        } catch (err: any) {
            setError(err.message || 'Failed to fetch student info');
        } finally {
            setLoading(false);
        }
    }, []);

    return {
        loading,
        error,
        courseSectionData,
        // students: courseSectionData?.students || [], // Tiện ích để lấy nhanh danh sách sinh viên
        studentInfo,
        fetchStudentsByCourseSection,
        fetchStudentInfo,
    };
};
