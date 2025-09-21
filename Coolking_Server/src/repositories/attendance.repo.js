const sequelize = require("../config/mariadb.conf");
const { Op } = require("sequelize");
const initModels = require("../databases/mariadb/model/init-models");
const models = initModels(sequelize);
const datetimeFormatter = require("../utils/format/datetime-formatter");

/**
 * Lấy danh sách sinh viên bằng course_section_id
 * @param {string} course_section_id 
 * @returns {Array} Danh sách sinh viên
 */
const getStudentsByCourseSectionID = async (course_section_id) => {
    try {
        // Validate input
        if (!course_section_id) {
            throw new Error('course_section_id is required');
        }

        const students = await models.StudentCourseSection.findAll({
            where: {
                course_section_id: course_section_id
            },
            include: [
                {
                    model: models.Student,
                    as: 'student',
                    attributes: ['student_id', 'name', 'dob', 'gender']
                }
            ],
            attributes: []
        });

        return students.map(item => ({
            student_id: item.student.student_id,
            name: item.student.name,
            dob: item.student.dob,
            gender: item.student.gender
        }));

    } catch (error) {
        console.error('Error in getStudentsByCourseSectionID:', error);
        throw error;
    }
};

/**
 * Lấy danh sách các sinh viên điểm danh bằng attendance_id
 * @param {string} attendance_id 
 * @returns {Array} Danh sách điểm danh sinh viên
 */
const getAttendanceStudentListByAttendanceID = async (attendance_id) => {
    try {
        // Validate input
        if (!attendance_id) {
            throw new Error('attendance_id is required');
        }

        const attendanceStudents = await models.AttendanceStudent.findAll({
            where: {
                attendance_id: attendance_id
            },
            attributes: ['student_id', 'status', 'description', 'start_lesson', 'end_lesson', 'createdAt']
        });

        return attendanceStudents.map(item => ({
            student_id: item.student_id,
            status: item.status,
            description: item.description,
            start_lesson: item.start_lesson,
            end_lesson: item.end_lesson,
            createdAt: item.createdAt
        }));

    } catch (error) {
        console.error('Error in getAttendanceStudentListByAttendanceID:', error);
        throw error;
    }
};

/**
 * Lấy thông tin chi tiết lớp học phần bằng course_section_id
 * @param {string} course_section_id 
 * @returns {Object} Thông tin chi tiết lớp học phần
 */
const getCourseSectionDetailByID = async (course_section_id) => {
    try {
        // Validate input
        if (!course_section_id) {
            throw new Error('course_section_id is required');
        }

        const courseSectionDetail = await models.CourseSection.findOne({
            where: {
                id: course_section_id
            },
            include: [
                {
                    model: models.Subject,
                    as: 'subject',
                    attributes: ['name'],
                    include: [
                        {
                            model: models.Faculty,
                            as: 'faculty',
                            attributes: ['name']
                        }
                    ]
                },
                {
                    model: models.Clazz,
                    as: 'clazz',
                    attributes: ['name']
                },
                {
                    model: models.Session,
                    as: 'session',
                    attributes: ['name']
                },
                {
                    model: models.LecturerCourseSection,
                    as: 'lecturers_course_sections',
                    include: [
                        {
                            model: models.Lecturer,
                            as: 'lecturer',
                            attributes: ['name']
                        }
                    ]
                }
            ],
            attributes: ['id']
        });

        if (!courseSectionDetail) {
            throw new Error(`Course section not found with id: ${course_section_id}`);
        }

        // Lấy tên giảng viên đầu tiên (có thể có nhiều giảng viên)
        const lecturerName = courseSectionDetail.lecturers_course_sections?.[0]?.lecturer?.name || 'N/A';

        return {
            course_section_id: courseSectionDetail.id,
            subjectName: courseSectionDetail.subject?.name || 'N/A',
            className: courseSectionDetail.clazz?.name || 'N/A',
            facultyName: courseSectionDetail.subject?.faculty?.name || 'N/A',
            sessionName: courseSectionDetail.session?.name || 'N/A',
            lecturerName: lecturerName
        };

    } catch (error) {
        console.error('Error in getCourseSectionDetailByID:', error);
        throw error;
    }
};

/**
 * Merge kết quả và trả về dữ liệu điểm danh hoàn chỉnh
 * @param {string} course_section_id 
 * @param {string} attendance_id 
 * @returns {Object} Dữ liệu điểm danh hoàn chỉnh
 */
const getAttendanceDetailsByCourseSectionAndAttendanceID = async (course_section_id, attendance_id) => {
    try {
        // Validate input parameters
        if (!course_section_id) {
            throw new Error('course_section_id is required');
        }
        if (!attendance_id) {
            throw new Error('attendance_id is required');
        }

        // Lấy thông tin chi tiết lớp học phần
        const courseSectionDetail = await getCourseSectionDetailByID(course_section_id);

        // Lấy danh sách sinh viên trong lớp
        const allStudents = await getStudentsByCourseSectionID(course_section_id);

        // Lấy danh sách điểm danh của sinh viên
        const attendanceStudents = await getAttendanceStudentListByAttendanceID(attendance_id);

        // Tạo map để dễ dàng lookup thông tin điểm danh
        const attendanceMap = new Map();

        // Tạo map để lookup attendance data theo student_id cho từng nhóm
        const attendanceDataMap = new Map();

        attendanceStudents.forEach(attendance => {
            const dateKey = datetimeFormatter.formatDateVN(attendance.createdAt);
            const lessonKey = `${attendance.start_lesson}-${attendance.end_lesson}`;
            const key = `${dateKey}_${lessonKey}`;

            if (!attendanceMap.has(key)) {
                attendanceMap.set(key, {
                    date: dateKey,
                    start_lesson: attendance.start_lesson,
                    end_lesson: attendance.end_lesson
                });
            }

            // Lưu thông tin điểm danh vào map
            if (!attendanceDataMap.has(key)) {
                attendanceDataMap.set(key, new Map());
            }
            attendanceDataMap.get(key).set(attendance.student_id, {
                status: attendance.status,
                description: attendance.description
            });
        });

        // Tạo danh sách students đầy đủ cho mỗi nhóm attendance
        const attendances = Array.from(attendanceMap.values()).map(group => {
            const groupKey = `${group.date}_${group.start_lesson}-${group.end_lesson}`;
            const groupAttendanceData = attendanceDataMap.get(groupKey) || new Map();

            // Tạo danh sách đầy đủ tất cả sinh viên
            const students = allStudents.map(student => {
                const attendanceData = groupAttendanceData.get(student.student_id);

                return {
                    student_id: student.student_id,
                    name: student.name,
                    dob: student.dob,
                    gender: student.gender,
                    status: attendanceData ? attendanceData.status : "ABSENT",
                    description: attendanceData ? attendanceData.description : ""
                };
            });

            return {
                date: group.date,
                start_lesson: group.start_lesson,
                end_lesson: group.end_lesson,
                students: students
            };
        });

        return {
            subjectName: courseSectionDetail.subjectName,
            className: courseSectionDetail.className,
            course_section_id: courseSectionDetail.course_section_id,
            facultyName: courseSectionDetail.facultyName,
            sessionName: courseSectionDetail.sessionName,
            lecturerName: courseSectionDetail.lecturerName,
            attendance_id: attendance_id,
            attendances: attendances
        };

    } catch (error) {
        console.error('Error in getAttendanceDetailsByCourseSectionAndAttendanceID:', error);
        throw error;
    }
};

/**
 * Tạo mới nhiều bản ghi điểm danh 
 * @param {string} attendance_id
 * @param {object} attendanceData
 {
    "start_lesson": num,
    "end_lesson": num,
    "students": [
        {
            "student_id": "xxx",
            "status": "LATE",
            "description": ""
        },
        {
            "student_id": "xxx",
            "status": "PRESENT",
            "description": ""
        }
        ...
    ]
}
 * @returns {Object} success + message
 */
const createAttendanceRecord = async (attendance_id, attendanceData) => {
    const transaction = await sequelize.transaction();
    
    try {
        // Validate input
        if (!attendance_id) {
            throw new Error('attendance_id is required');
        }
        
        if (!attendanceData) {
            throw new Error('attendanceData is required');
        }
        
        const { start_lesson, end_lesson, students } = attendanceData;
        
        // Validate required fields
        if (start_lesson === undefined || end_lesson === undefined) {
            throw new Error('start_lesson and end_lesson are required');
        }
        
        if (!Array.isArray(students) || students.length === 0) {
            throw new Error('students array is required and cannot be empty');
        }
        
        // Validate lessons
        if (start_lesson < 1 || end_lesson < 1 || start_lesson > end_lesson) {
            throw new Error('Invalid lesson range. start_lesson and end_lesson must be >= 1 and start_lesson <= end_lesson');
        }
        
        // Kiểm tra attendance record có tồn tại không
        const existingAttendance = await models.Attendance.findByPk(attendance_id);
        if (!existingAttendance) {
            throw new Error(`Attendance record not found with id: ${attendance_id}`);
        }
        
        console.log(`Creating attendance records for ${students.length} students`);
        
        // Tạo array các attendance student records để bulk insert
        const attendanceStudentRecords = [];
        
        for (const studentData of students) {
            const { student_id, status, description = "" } = studentData;
            
            // Validate student data
            if (!student_id) {
                throw new Error('student_id is required for each student');
            }
            
            if (!status) {
                throw new Error(`status is required for student ${student_id}`);
            }
            
            // Validate status enum
            const { StatusAttendance } = require('../databases/mariadb/model/enums');
            if (!Object.values(StatusAttendance).includes(status)) {
                throw new Error(`Invalid status: ${status}. Must be one of: ${Object.values(StatusAttendance).join(', ')}`);
            }
            
            // Kiểm tra sinh viên có tồn tại không
            const existingStudent = await models.Student.findOne({
                where: { student_id: student_id }
            });
            
            if (!existingStudent) {
                throw new Error(`Student not found with id: ${student_id}`);
            }
            
            // Tạo record
            attendanceStudentRecords.push({
                attendance_id: attendance_id,
                student_id: student_id,
                status: status,
                description: description || "",
                start_lesson: start_lesson,
                end_lesson: end_lesson
            });
        }
        
        // Bulk insert các attendance student records
        const createdRecords = await models.AttendanceStudent.bulkCreate(
            attendanceStudentRecords,
            { 
                transaction,
                validate: true,
                returning: true
            }
        );
        
        await transaction.commit();
        
        return {
            success: true,
            message: `Dữ liệu điểm danh đã được lưu thành công cho ${createdRecords.length} sinh viên`
        };
        
    } catch (error) {
        await transaction.rollback();
        console.error('Error in createAttendanceRecord:', error);
        
        return {
            success: false,
            message: `Lỗi khi tạo dữ liệu điểm danh: ${error.message}`
        };
    }
};

/**
 * Cập nhật nhiều bản ghi điểm danh 
 * @param {string} attendance_id
 * @param {object} attendanceData
 {
    "start_lesson": num,
    "end_lesson": num,
    "students": [
        {
            "student_id": "xxx",
            "status": "LATE",
            "description": ""
        },
        {
            "student_id": "xxx",
            "status": "PRESENT",
            "description": ""
        }
        ...
    ]
}
 * @returns {Object} success + message
 */
const updateAttendanceRecord = async (attendance_id, attendanceData) => {
    const transaction = await sequelize.transaction();
    
    try {
        // Validate input
        if (!attendance_id) {
            throw new Error('attendance_id is required');
        }
        
        if (!attendanceData) {
            throw new Error('attendanceData is required');
        }
        
        const { start_lesson, end_lesson, students } = attendanceData;
        
        // Validate required fields
        if (start_lesson === undefined || end_lesson === undefined) {
            throw new Error('start_lesson and end_lesson are required');
        }
        
        if (!Array.isArray(students) || students.length === 0) {
            throw new Error('students array is required and cannot be empty');
        }
        
        // Validate lessons
        if (start_lesson < 1 || end_lesson < 1 || start_lesson > end_lesson) {
            throw new Error('Invalid lesson range. start_lesson and end_lesson must be >= 1 and start_lesson <= end_lesson');
        }
        
        // Kiểm tra attendance record có tồn tại không
        const existingAttendance = await models.Attendance.findByPk(attendance_id);
        if (!existingAttendance) {
            throw new Error(`Attendance record not found with id: ${attendance_id}`);
        }
        
        console.log(`Updating attendance records for ${students.length} students`);
        
        // Validate status enum and students exist
        const { StatusAttendance } = require('../databases/mariadb/model/enums');
        
        for (const studentData of students) {
            const { student_id, status } = studentData;
            
            // Validate student data
            if (!student_id) {
                throw new Error('student_id is required for each student');
            }
            
            if (!status) {
                throw new Error(`status is required for student ${student_id}`);
            }
            
            // Validate status enum
            if (!Object.values(StatusAttendance).includes(status)) {
                throw new Error(`Invalid status: ${status}. Must be one of: ${Object.values(StatusAttendance).join(', ')}`);
            }
            
            // Kiểm tra sinh viên có tồn tại không
            const existingStudent = await models.Student.findOne({
                where: { student_id: student_id }
            });
            
            if (!existingStudent) {
                throw new Error(`Student not found with id: ${student_id}`);
            }
        }
        
        // Xóa các record cũ với cùng attendance_id, start_lesson, end_lesson
        await models.AttendanceStudent.destroy({
            where: {
                attendance_id: attendance_id,
                start_lesson: start_lesson,
                end_lesson: end_lesson
            },
            transaction
        });
        
        // Tạo array các attendance student records để bulk insert
        const attendanceStudentRecords = students.map(studentData => {
            const { student_id, status, description = "" } = studentData;
            
            return {
                attendance_id: attendance_id,
                student_id: student_id,
                status: status,
                description: description || "",
                start_lesson: start_lesson,
                end_lesson: end_lesson
            };
        });
        
        // Bulk insert các attendance student records mới
        const updatedRecords = await models.AttendanceStudent.bulkCreate(
            attendanceStudentRecords,
            { 
                transaction,
                validate: true,
                returning: true
            }
        );
        
        await transaction.commit();
        
        console.log(`Successfully updated ${updatedRecords.length} attendance student records`);
        
        return {
            success: true,
            message: `Dữ liệu điểm danh đã được cập nhật thành công cho ${updatedRecords.length} sinh viên`
        };
        
    } catch (error) {
        await transaction.rollback();
        console.error('Error in updateAttendanceRecord:', error);
        
        return {
            success: false,
            message: `Lỗi khi cập nhật dữ liệu điểm danh: ${error.message}`
        };
    }
};



module.exports = {
    getStudentsByCourseSectionID,
    getAttendanceStudentListByAttendanceID,
    getCourseSectionDetailByID,
    getAttendanceDetailsByCourseSectionAndAttendanceID,
    createAttendanceRecord,
    updateAttendanceRecord
};