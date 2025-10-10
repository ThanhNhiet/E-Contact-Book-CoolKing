import { useState, useCallback } from 'react';
import { courseSectionServices } from '../services/courseSectionServices';

//getCourseSectionsByLecturer
// {
//     "total": 23,
//     "page": 1,
//     "pageSize": 10,
//     "courseSections": [
//         {
//             "course_section_id": "224e8917-a4f0-11f0-9bfa-601895530606",
//             "subjectName": "Cấu trúc dữ liệu & Giải thuật",
//             "className": "DHCNTT17C",
//             "facultyName": "Khoa Công nghệ thông tin",
//             "sessionName": "HK1 2025-2026",
//             "createdAt": "09-10-2025"
//         },
//         {
//             "course_section_id": "224e896d-a4f0-11f0-9bfa-601895530606",
//             "subjectName": "Cơ sở dữ liệu",
//             "className": "DHCNTT17A",
//             "facultyName": "Khoa Công nghệ thông tin",
//             "sessionName": "HK1 2025-2026",
//             "createdAt": "09-10-2025"
//         },
//         ...
//      ],
//     "linkPrev": null,
//     "linkNext": "/api/coursesections/lecturer?page=2&pagesize=10",
//     "pages": [
//         1,
//         2,
//         3
//     ]
// }
export interface courseSection {
    course_section_id: string;
    subjectName: string;
    className: string;
    facultyName: string;
    sessionName: string;
    createdAt: string;
}

export const useCourseSection = () => {
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string>('');
    const [courseSections, setCourseSections] = useState<courseSection[]>([]);
    const [total, setTotal] = useState(0);
    const [page, setPage] = useState(1);
    const [pageSize, setPageSize] = useState(10);
    const [pages, setPages] = useState<number[]>([]);
    const [linkPrev, setLinkPrev] = useState<string | null>(null);
    const [linkNext, setLinkNext] = useState<string | null>(null);
    const [totalPages, setTotalPages] = useState(0);

    const fetchCourseSectionsByLecturer = useCallback(async (page: number, pageSize: number) => {
        setLoading(true);
        setError('');
        try {
            const data = await courseSectionServices.getCourseSectionsByLecturer(page, pageSize);
            setCourseSections(data.courseSections);
            setTotal(data.total); 
            setPage(data.page);
            setPageSize(data.pageSize);
            setPages(data.pages);
            setLinkPrev(data.linkPrev);
            setLinkNext(data.linkNext);
            setTotalPages(data.totalPages);
        } catch (err: any) {
            setError(err.message || 'Failed to fetch course sections');
        } finally {
            setLoading(false);
        }
    }, []);

    const searchCourseSectionsByKeyword = useCallback(async (keyword: string, page: number, pageSize: number) => {
        setLoading(true);
        setError('');
        try {
            const data = await courseSectionServices.searchCourseSectionsByKeyword(keyword, page, pageSize);
            setCourseSections(data.courseSections);
            setTotal(data.total);
            setPage(data.page);
            setPageSize(data.pageSize);
            setPages(data.pages);
            setLinkPrev(data.linkPrev);
            setLinkNext(data.linkNext);
            setTotalPages(data.totalPages);
        } catch (err: any) {
            setError(err.message || 'Failed to search course sections');
        } finally {
            setLoading(false);
        }
    }, []);

    const filterCourseSectionsByLecturer = useCallback(async (session: string, faculty: string, page: number, pageSize: number) => {
        setLoading(true);
        setError('');
        try {
            const data = await courseSectionServices.filterCourseSectionsByLecturer(session, faculty, page, pageSize);
            setCourseSections(data.courseSections);
            setTotal(data.total);
            setPage(data.page);
            setPageSize(data.pageSize);
            setPages(data.pages);
            setLinkPrev(data.linkPrev);
            setLinkNext(data.linkNext);
            setTotalPages(data.totalPages);
        } catch (err: any) {
            setError(err.message || 'Failed to filter course sections');
        } finally {
            setLoading(false);
        }
    }, []);

    return {
        loading,
        error,
        courseSections,
        total,
        page,
        pageSize,
        pages,
        linkPrev,
        linkNext,
        totalPages,
        fetchCourseSectionsByLecturer,
        searchCourseSectionsByKeyword,
        filterCourseSectionsByLecturer
    };
}
