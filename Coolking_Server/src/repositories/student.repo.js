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

            students.push({
                no: i + 1, // STT
                student_id: student.student_id,
                name: student.name,
                dob: datetimeFormatter.formatDateVN(student.dob),
                score: scoreData
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

module.exports = {
    getStudentsScoreByCourseSectionId4Lecturer,
    getStudentInfoById4Lecturer
};