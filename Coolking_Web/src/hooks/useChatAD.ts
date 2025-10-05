import { useState, useCallback } from 'react';
import { chatServices } from '../services/chatServices';

export interface Chat {
    _id: string;
    type: 'group' | 'private';
    name: string;
    avatar: string;
    course_section_id?: string;
    createdAt: string;
    updatedAt: string;
    memberCount?: number;
}

export interface CourseSection {
    subjectName: string;
    className: string;
    course_section_id: string;
    facultyName: string;
    sessionName: string;
    lecturerName: string;
    start_lesson?: number;
    end_lesson?: number;
    createdAt: string;
    updatedAt: string;
}

export interface Student {
    student_id: string;
    name: string;
    dob: string;
    gender: string;
    phone: string;
    email: string;
    address: string;
    className: string;
    facultyName: string;
    majorName: string;
}

export interface Lecturer {
    lecturer_id: string;
    name: string;
    dob: string;
    gender: boolean;
    avatar: string | null;
    phone: string;
    email: string;
    address: string;
    faculty_id: string;
    homeroom_class_id: string | null;
    isDeleted: boolean;
    createdAt: string;
    updatedAt: string;
}

export const useChat = () => {
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string>('');
    const [chats, setChats] = useState<Chat[]>([]);
    const [courseSections, setCourseSections] = useState<CourseSection[]>([]);
    const [student, setStudent] = useState<Student | null>(null);
    const [lecturer, setLecturer] = useState<Lecturer | null>(null);
    const [total, setTotal] = useState(0);
    const [currentPage, setCurrentPage] = useState(1);
    const [pageSize, setPageSize] = useState(10);
    const [linkPrev, setLinkPrev] = useState<string | null>(null);
    const [linkNext, setLinkNext] = useState<string | null>(null);
    const [pages, setPages] = useState<number[]>([]);

    // Lấy danh sách chat
    const getChats = useCallback(async (page: number, pageSize: number) => {
        try {
            setLoading(true);
            setError('');
            const data = await chatServices.getAllChats(page, pageSize);
            setChats(data.chats || []);
            setTotal(data.total);
            setCurrentPage(page);
            setPageSize(pageSize);
            setLinkPrev(data.linkPrev);
            setLinkNext(data.linkNext);
            setPages(data.pages);
            return data;
        } catch (error) {
            setError('Failed to fetch chats');
        } finally {
            setLoading(false);
        }
    }, []);

    // Lấy danh sách course section chưa có chat
    const getNonChatCourseSections = useCallback(async (page: number, pageSize: number) => {
        try {
            setLoading(true);
            setError('');
            const data = await chatServices.getNonChatCourseSections(page, pageSize);
            setCourseSections(data.courseSections || []);
            setTotal(data.total);
            setCurrentPage(page);
            setPageSize(pageSize);
            setLinkPrev(data.linkPrev);
            setLinkNext(data.linkNext);
            setPages(data.pages);
            return data;
        } catch (error) {
            setError('Failed to fetch course sections');
        } finally {
            setLoading(false);
        }
    }, []);

    // Tìm kiếm chats theo từ khóa
    const searchChats = useCallback(async (keyword: string, page: number, pageSize: number) => {
        try {
            setLoading(true);
            setError('');
            const data = await chatServices.searchChats(keyword, page, pageSize);
            setChats(data.chats || []);
            setTotal(data.total);
            setCurrentPage(page);
            setPageSize(pageSize);
            setLinkPrev(data.linkPrev);
            setLinkNext(data.linkNext);
            setPages(data.pages);
            return data;
        } catch (error) {
            setError('Failed to search chats');
        } finally {
            setLoading(false);
        }
    }, []);

    // Tìm kiếm course section chưa có chat theo từ khóa
    const searchNonChatCourseSections = useCallback(async (keyword: string, page: number, pageSize: number) => {
        try {
            setLoading(true);
            setError('');
            const data = await chatServices.searchNonChatCourseSections(keyword, page, pageSize);
            setCourseSections(data.courseSections || []);
            setTotal(data.total);
            setCurrentPage(page);
            setPageSize(pageSize);
            setLinkPrev(data.linkPrev);
            setLinkNext(data.linkNext);
            setPages(data.pages);
            return data;
        } catch (error) {
            setError('Failed to search non-chat course sections');
        } finally {
            setLoading(false);
        }
    }, []);

    // Tạo nhóm chat
    const createGroupChat = useCallback(async (course_section_id: string, nameGroup: string) => {
        try {
            setLoading(true);
            const data = await chatServices.createGroupChat(course_section_id, nameGroup);
            return data;
        } catch (error) {
            setError('Failed to create group chat');
        } finally {
            setLoading(false);
        }
    }, []);

    // Update tên nhóm chat và (hoặc) thêm thành viên
    const addMembers2GroupChat = useCallback(async (chatID: string, name: string, students: string[], lecturers: string[]) => {
        try {
            setLoading(true);
            const data = await chatServices.AddMembers2GroupChat(chatID, name, students, lecturers);
            return data;
        } catch (error) {
            setError('Failed to add members to group chat');
        } finally {
            setLoading(false);
        }
    }, []);

    // Xoá chat
    const deleteChat = useCallback(async (chatID: string) => {
        try {
            setLoading(true);
            const data = await chatServices.deleteChat(chatID);
            return data;
        } catch (error) {
            setError('Failed to delete chat');
        } finally {
            setLoading(false);
        }
    }, []);

    // Xoá các cuộc trò chuyện của tài khoản không hoạt động
    const cleanupInactiveChats = useCallback(async () => {
        try {
            setLoading(true);
            const data = await chatServices.cleanupInactiveChats();
            return data;
        } catch (error) {
            setError('Failed to cleanup inactive chats');
        } finally {
            setLoading(false);
        }
    }, []);

    // Lấy thông tin sinh viên theo ID
    const getStudentInfo = useCallback(async (studentId: string) => {
        try {
            setLoading(true);
            const data = await chatServices.getStudentInfo(studentId);
            setStudent(data || null);
            return data;
        } catch (error) {
            setError('Failed to get student info');
        } finally {
            setLoading(false);
        }
    }, []);

    // Lấy thông tin giảng viên theo ID
    const getLecturerInfo = useCallback(async (lecturerId: string) => {
        try {
            setLoading(true);
            const data = await chatServices.getLecturerInfo(lecturerId);
            setLecturer(data || null);
            return data;
        } catch (error) {
            setError('Failed to get lecturer info');
        } finally {
            setLoading(false);
        }
    }, []);

    return {
        loading,
        error,
        chats,
        courseSections,
        total,
        currentPage,
        pageSize,
        linkPrev,
        linkNext,
        pages,
        student,
        lecturer,

        getChats,
        getNonChatCourseSections,
        searchChats,
        searchNonChatCourseSections,
        createGroupChat,
        addMembers2GroupChat,
        deleteChat,
        cleanupInactiveChats,
        getStudentInfo,
        getLecturerInfo
    };
};