const sequelize = require("../config/mariadb.conf");
const initModels = require("../databases/mariadb/model/init-models");
const models = initModels(sequelize);
const datetimeFormatter = require("../utils/format/datetime-formatter");

/**
 *  Lấy danh sách sinh viên + điểm số bằng course_section_id - dùng cho giảng viên
 * @param {string} course_section_id 
 * @returns {Object}
 */
const getStudentsScoreByCourseSectionId4Lecturer = async (course_section_id) => {
    try {
        // Validate input
        if (!course_section_id) {
            throw new Error('course_section_id is required');
        }

        // Lấy thông tin lớp học phần: course_section_id, subjectName, className, sessionName, facultyName, lecturerName 
        const courseSectionDetail = await models.CourseSection.findOne({
            where: { id: course_section_id },
            attributes: ['id'],
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
            ]
        });

        if (!courseSectionDetail) {
            throw new Error(`Course section not found with id: ${course_section_id}`);
        }

        // Lấy danh sách student_id từ Student_CourseSection
        const studentCourseSections = await models.StudentCourseSection.findAll({
            where: { course_section_id: course_section_id },
            attributes: ['student_id'],
            order: [['createdAt', 'ASC']] // Sắp xếp theo thời gian đăng ký
        });

        if (studentCourseSections.length === 0) {
            // Nếu không có sinh viên nào trong lớp, vẫn trả về thông tin lớp
            return {
                course_section_id: courseSectionDetail.id,
                subjectName: courseSectionDetail.subject?.name || 'N/A',
                className: courseSectionDetail.clazz?.name || 'N/A',
                sessionName: courseSectionDetail.session?.name || 'N/A',
                facultyName: courseSectionDetail.subject?.faculty?.name || 'N/A',
                lecturerName: courseSectionDetail.lecturers_course_sections?.[0]?.lecturer?.name || 'N/A',
                students: []
            };
        }

        // Lấy thông tin từng sinh viên và điểm số
        const students = [];
        
        for (let i = 0; i < studentCourseSections.length; i++) {
            const studentId = studentCourseSections[i].student_id;
            
            // Lấy thông tin sinh viên từ Student bằng student_id
            const student = await models.Student.findOne({
                where: { student_id: studentId },
                attributes: ['student_id', 'name', 'dob']
            });

            if (!student) {
                console.warn(`Student not found with id: ${studentId}`);
                continue;
            }

            // Lấy thông tin điểm từ Score theo từng student_id và course_section_id
            const score = await models.Score.findOne({
                where: { 
                    student_id: studentId, 
                    course_section_id: course_section_id 
                },
                attributes: [
                    'theo_regular1', 'theo_regular2', 'theo_regular3',
                    'pra_regular1', 'pra_regular2', 'pra_regular3',
                    'mid', 'final', 'avr'
                ]
            });

            // Tạo object điểm số (nếu không có điểm thì để null)
            const scoreData = score ? {
                theo_regular1: score.theo_regular1,
                theo_regular2: score.theo_regular2,
                theo_regular3: score.theo_regular3,
                pra_regular1: score.pra_regular1,
                pra_regular2: score.pra_regular2,
                pra_regular3: score.pra_regular3,
                mid: score.mid,
                final: score.final,
                avr: score.avr
            } : {
                theo_regular1: null,
                theo_regular2: null,
                theo_regular3: null,
                pra_regular1: null,
                pra_regular2: null,
                pra_regular3: null,
                mid: null,
                final: null,
                avr: null
            };

            // Tính toán initial_evaluate
            let initial_evaluate = 'ok';
            
            if (score) {
                // Tính điểm trung bình của regular (cả theo và pra)
                const regularScores = [
                    score.theo_regular1, score.theo_regular2, score.theo_regular3,
                    score.pra_regular1, score.pra_regular2, score.pra_regular3
                ].filter(s => s !== null && s !== undefined);
                
                let regularAverage = null;
                if (regularScores.length > 0) {
                    regularAverage = regularScores.reduce((sum, s) => sum + s, 0) / regularScores.length;
                }
                
                // Kiểm tra các điều kiện danger
                if ((regularAverage !== null && regularAverage < 1) || 
                    (score.mid !== null && score.mid < 4) ||
                    (score.final !== null && score.final < 3) ||
                    (score.final !== null && score.final < 4)) {
                    initial_evaluate = 'danger';
                }
            }

            students.push({
                no: i + 1, // STT
                student_id: student.student_id,
                name: student.name,
                dob: datetimeFormatter.formatDateVN(student.dob),
                score: scoreData,
                initial_evaluate: initial_evaluate
            });
        }

        // Trả về kết quả hoàn chỉnh
        return {
            course_section_id: courseSectionDetail.id,
            subjectName: courseSectionDetail.subject?.name || 'N/A',
            className: courseSectionDetail.clazz?.name || 'N/A',
            sessionName: courseSectionDetail.session?.name || 'N/A',
            facultyName: courseSectionDetail.subject?.faculty?.name || 'N/A',
            lecturerName: courseSectionDetail.lecturers_course_sections?.[0]?.lecturer?.name || 'N/A',
            students: students
        };

    } catch (error) {
        console.error('Error in getStudentsByCourseSectionId4Lecturer:', error);
        throw error;
    }
};

/**
 *  Lấy thông tin sinh viên bằng student_id - dùng cho giảng viên
 * @param {string} student_id 
 * @returns {Object}
 */
const getStudentInfoById4Lecturer = async (student_id) => {
    try {
        const student = await models.Student.findOne({
            attributes: {
                exclude: ['id', 'isDeleted', 'clazz_id', 'major_id', 'createdAt', 'updatedAt']
            },
            where: { student_id, isDeleted: false },
            include: [
                {
                    model: models.Clazz,
                    as: 'clazz',
                    attributes: ['name'],
                    required: false,
                    include: [
                        {
                            model: models.Faculty,
                            as: 'faculty',
                            attributes: ['name'],
                            required: false
                        }
                    ]
                },
                {
                    model: models.Major,
                    as: 'major',
                    attributes: ['name'],
                    required: false
                }
            ]
        });

        if (!student) throw new Error("Student not found");

        const genderStudent = student.gender == "1" ? "Nam" : "Nữ";

        //Lấy thông tin liên lạc của phụ huynh từ bảng Parent theo student_id (sử dụng student_id string)
        const parent = await models.Parent.findOne({
            attributes: ['parent_id', 'name', 'gender', 'phone', 'email'],
            where: { student_id: student.student_id }
        });

        let genderParent = null;
        if (parent){
            genderParent = parent.gender == "1" ? "Nam" : "Nữ";
        }

        return {
            student_id: student.student_id,
            name: student.name,
            dob: datetimeFormatter.formatDateVN(student.dob),
            gender: genderStudent,
            avatar: student.avatar,
            phone: student.phone,
            email: student.email,
            address: student.address,
            className: student.clazz ? student.clazz.name : null,
            facultyName: student.clazz && student.clazz.faculty ? student.clazz.faculty.name : null,
            majorName: student.major ? student.major.name : null,
            parent: {
                parent_id: parent?.parent_id || null,
                name: parent?.name || null,
                gender: genderParent,
                phone: parent?.phone || null,
                email: parent?.email || null
            }
        };
    } catch (error) {
        throw error;
    }
};

const getStudentByStudent_id = async (student_id) => {
    try {
        const result = await models.Student.findOne({
            attributes: {
                exclude: ['id', 'isDeleted']
            },
            where: { student_id, isDeleted: false },
            include: [
                {
                    model: models.Clazz,
                    as: 'clazz',
                    attributes: ['name','id'],
                    required: false
                },
                {
                    model: models.Major,
                    as: 'major', 
                    attributes: ['name', 'major_id'],
                    required: false
                }
            ]
        });
        if (!result) throw new Error("Student not found");

        const gender = result.gender === "1" ? "Nam" : "Nữ";
        return{
            student_id: result.student_id,
            name: result.name,
            dob: datetimeFormatter.formatDateVN(result.dob),
            gender,
            avatar: result.avatar,
            phone: result.phone,
            email: result.email,
            address: result.address,
            clazzName: result.clazz ? result.clazz.name : null,
            clazzId: result.clazz ? result.clazz.id : null,
            majorName: result.major ? result.major.name : null,
            majorId: result.major ? result.major.major_id : null,
            createdAt: datetimeFormatter.formatDateTimeVN(result.createdAt),
            updatedAt: datetimeFormatter.formatDateTimeVN(result.updatedAt),
        }
        
    } catch (error) {
        console.error("Error in getStudentByStudent_id:", error);
        throw error;
    }
}

const updateStudentInfo = async (student_id, updateData) => {
    try {
        const student = await models.Student.findOne({ where: { student_id } });
        if (!student) throw new Error("Student not found");
        updateData.dob = datetimeFormatter.convertddMMyyyy2yyyyMMdd(updateData.dob);
        updateData.updatedAt = new Date();
        return await student.update(updateData);
    } catch (error) {
        console.error("Error in updateStudentInfo:", error);
        throw error;
    }
}

/**
 * Lấy lịch học của sinh viên bao gồm cả exception (thay đổi lịch)
 * @param {string} student_id - Mã sinh viên (VD: SV2100001)
 * @returns {Object} - Thông tin lịch học chi tiết
 */
const getStudentScheduleWithExceptions = async (student_id) => {
    try {
        // Validate input
        if (!student_id) {
            throw new Error('student_id is required');
        }

        // Sử dụng raw query để thực hiện complex join
        const results = await sequelize.query(`
            SELECT  
                ST.student_id,
                ST.name AS student_name,
                cl.name AS class_name,
                su.name AS subject_name,
                se.name AS session_name,
                se.years AS academic_year,
                le2.name AS original_lecturer,
                COALESCE(le1.name, le2.name) AS current_lecturer,
                SH.start_lesson,
                SH.end_lesson,
                SH.day_of_week,
                SH.date AS exam_date,
                COALESCE(shex.new_room, SH.room) AS current_room,
                shex.exception_type,
                shex.original_date,
                shex.new_date,
                shex.new_start_lesson,
                shex.new_end_lesson,
                CASE 
                    WHEN shex.id IS NOT NULL THEN 'Có thay đổi'
                    ELSE 'Lịch bình thường'
                END AS schedule_status,
                SH.id AS schedule_id,
                co_se.id AS course_section_id
            FROM students AS ST 
            JOIN schedules AS SH ON ST.student_id = SH.user_id 
            LEFT JOIN schedule_exceptions AS shex ON SH.id = shex.schedule_id
            LEFT JOIN lecturers AS le1 ON le1.lecturer_id = shex.new_lecturer_id 
                AND shex.exception_type = 'LECTURER_CHANGED'
            JOIN course_sections AS co_se ON co_se.id = SH.course_section_id
            JOIN clazz AS cl ON cl.id = co_se.clazz_id
            JOIN subjects AS su ON su.subject_id = co_se.subject_id
            JOIN sessions AS se ON se.id = co_se.session_id
            JOIN lecturers_coursesections AS le_co ON le_co.course_section_id = co_se.id
            JOIN lecturers AS le2 ON le2.lecturer_id = le_co.lecturer_id
            WHERE SH.isExam = 0 
              AND SH.isCompleted = 0 
              AND SH.user_id = :student_id
            ORDER BY SH.day_of_week, SH.start_lesson
        `, {
            replacements: { student_id },
            type: sequelize.QueryTypes.SELECT
        });


        if (!results || results.length === 0) {
            return {
                student_id: student_id,
                message: "Không tìm thấy lịch học cho sinh viên này",
                schedules: []
            };
        }

        // Format lại dữ liệu để dễ sử dụng
        const formattedSchedules = results.map(schedule => ({
            schedule_id: schedule.schedule_id,
            course_section_id: schedule.course_section_id,
            student_info: {
                student_id: schedule.student_id,
                student_name: schedule.student_name,
                class_name: schedule.class_name
            },
            subject_info: {
                subject_name: schedule.subject_name,
                session_name: schedule.session_name,
                academic_year: schedule.academic_year
            },
            schedule_info: {
                day_of_week: schedule.day_of_week,
                start_lesson: schedule.start_lesson,
                end_lesson: schedule.end_lesson,
                exam_date: schedule.exam_date,
                room: schedule.current_room,
                status: schedule.schedule_status
            },
            lecturer_info: {
                original_lecturer: schedule.original_lecturer,
                current_lecturer: schedule.current_lecturer
            },
            exception_info: schedule.exception_type ? {
                exception_type: schedule.exception_type,
                original_date: schedule.original_date,
                new_date: schedule.new_date,
                new_start_lesson: schedule.new_start_lesson,
                new_end_lesson: schedule.new_end_lesson
            } : null
        }));

        // Thống kê
        const stats = {
            total_schedules: formattedSchedules.length,
            normal_schedules: formattedSchedules.filter(s => s.schedule_info.status === 'Lịch bình thường').length,
            exception_schedules: formattedSchedules.filter(s => s.schedule_info.status === 'Có thay đổi').length,
            exception_types: [...new Set(formattedSchedules
                .filter(s => s.exception_info)
                .map(s => s.exception_info.exception_type)
            )]
        };

        return {
            student_id: student_id,
            student_name: results[0].student_name,
            statistics: stats,
            schedules: formattedSchedules
        };

    } catch (error) {
        console.error("Error in getStudentScheduleWithExceptions:", error);
        throw error;
    }
}




/**
 * Lấy lịch học đơn giản của sinh viên (không bao gồm exception)
 * @param {string} student_id - Mã sinh viên
 * @returns {Object} - Lịch học cơ bản
 */
const getStudentBasicSchedule = async (student_id) => {
    try {
        if (!student_id) {
            throw new Error('student_id is required');
        }

        const results = await sequelize.query(`
            SELECT  
                ST.student_id,
                ST.name AS student_name,
                cl.name AS class_name,
                su.name AS subject_name,
                se.name AS session_name,
                se.years AS academic_year,
                le.name AS lecturer_name,
                SH.start_lesson,
                SH.end_lesson,
                SH.day_of_week,
                SH.date AS schedule_date,
                SH.room,
                SH.id AS schedule_id,
                co_se.id AS course_section_id
            FROM students AS ST 
            JOIN schedules AS SH ON ST.student_id = SH.user_id 
            JOIN course_sections AS co_se ON co_se.id = SH.course_section_id
            JOIN clazz AS cl ON cl.id = co_se.clazz_id
            JOIN subjects AS su ON su.subject_id = co_se.subject_id
            JOIN sessions AS se ON se.id = co_se.session_id
            JOIN lecturers_coursesections AS le_co ON le_co.course_section_id = co_se.id
            JOIN lecturers AS le ON le.lecturer_id = le_co.lecturer_id
            WHERE SH.isExam = 0 
              AND SH.isCompleted = 0 
              AND SH.user_id = :student_id
            ORDER BY SH.day_of_week, SH.start_lesson
        `, {
            replacements: { student_id },
            type: sequelize.QueryTypes.SELECT
        });

        return {
            student_id,
            total_schedules: results.length,
            schedules: results
        };

    } catch (error) {
        console.error("Error in getStudentBasicSchedule:", error);
        throw error;
    }
}

/**
 * Lấy lịch thi của sinh viên
 * @param {string} student_id - Mã sinh viên
 * @returns {Object} - Lịch thi
 */
const getStudentExamSchedule = async (student_id) => {
    try {
        if (!student_id) {
            throw new Error('student_id is required');
        }

        const results = await sequelize.query(`
            SELECT  
                ST.student_id,
                ST.name AS student_name,
                cl.name AS class_name,
                su.name AS subject_name,
                se.name AS session_name,
                se.years AS academic_year,
                le.name AS lecturer_name,
                SH.start_lesson,
                SH.end_lesson,
                SH.date AS exam_date,
                SH.room,
                SH.id AS schedule_id,
                co_se.id AS course_section_id
            FROM students AS ST 
            JOIN schedules AS SH ON ST.student_id = SH.user_id 
            JOIN course_sections AS co_se ON co_se.id = SH.course_section_id
            JOIN clazz AS cl ON cl.id = co_se.clazz_id
            JOIN subjects AS su ON su.subject_id = co_se.subject_id
            JOIN sessions AS se ON se.id = co_se.session_id
            JOIN lecturers_coursesections AS le_co ON le_co.course_section_id = co_se.id
            JOIN lecturers AS le ON le.lecturer_id = le_co.lecturer_id
            WHERE SH.isExam = 1 
              AND SH.user_id = :student_id
            ORDER BY SH.date, SH.start_lesson
        `, {
            replacements: { student_id },
            type: sequelize.QueryTypes.SELECT
        });

        return {
            student_id,
            total_exams: results.length,
            exams: results
        };

    } catch (error) {
        console.error("Error in getStudentExamSchedule:", error);
        throw error;
    }
}


module.exports = {
    getStudentsScoreByCourseSectionId4Lecturer,
    getStudentInfoById4Lecturer,
    getStudentByStudent_id,
    updateStudentInfo,
    getStudentScheduleWithExceptions,
    getStudentBasicSchedule,
    getStudentExamSchedule
};