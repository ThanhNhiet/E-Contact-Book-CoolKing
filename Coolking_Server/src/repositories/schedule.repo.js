const { Op, fn, col } = require("sequelize");
const sequelize = require("../config/mariadb.conf");
const { initModels } = require("../databases/mariadb/model/init-models");
const models = initModels(sequelize);
const datetimeFormatter = require("../utils/format/datetime-formatter");

const getSchedulesByUserId = async (user_id, currentDate) => {
    try {
        // Parse currentDate từ dd-MM-yyyy
        const [day, month, year] = currentDate.split('-');
        const currentDateObj = new Date(year, month - 1, day);
        
        // Tính toán tuần hiện tại (từ Thứ 2 đến Chủ nhật)
        const currentDayOfWeek = currentDateObj.getDay(); // 0 = Sunday, 1 = Monday, ..., 6 = Saturday
        const mondayOffset = currentDayOfWeek === 0 ? -6 : 1 - currentDayOfWeek; // Tính offset đến thứ 2
        
        const weekStart = new Date(currentDateObj);
        weekStart.setDate(currentDateObj.getDate() + mondayOffset);
        weekStart.setHours(0, 0, 0, 0);
        
        const weekEnd = new Date(weekStart);
        weekEnd.setDate(weekStart.getDate() + 6);
        weekEnd.setHours(23, 59, 59, 999);

        // Tính toán URL cho tuần trước và tuần sau
        const prevWeek = new Date(weekStart);
        prevWeek.setDate(weekStart.getDate() - 7);
        const nextWeek = new Date(weekStart);
        nextWeek.setDate(weekStart.getDate() + 7);
        
        const prev = `/api/schedules/by-user?currentDate=${datetimeFormatter.formatDateVN(prevWeek)}`;
        const next = `/api/schedules/by-user?currentDate=${datetimeFormatter.formatDateVN(nextWeek)}`;

        // Lấy tất cả schedule của user trong khoảng thời gian của học phần
        const schedules = await models.Schedule.findAll({
            where: {
                user_id,
                [Op.and]: [
                    { start_date: { [Op.lte]: weekEnd } },
                    { end_date: { [Op.gte]: weekStart } }
                ]
            },
            include: [
                {
                    model: models.CourseSection,
                    as: 'course_section',
                    include: [
                        {
                            model: models.Clazz,
                            as: 'clazz',
                            attributes: ['name']
                        },
                        {
                            model: models.Subject,
                            as: 'subject',
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
                },
                {
                    model: models.ScheduleException,
                    as: 'schedule_exceptions',
                    where: {
                        original_date: {
                            [Op.between]: [weekStart, weekEnd]
                        }
                    },
                    required: false,
                    include: [
                        {
                            model: models.Lecturer,
                            as: 'new_lecturer',
                            attributes: ['name'],
                            required: false
                        }
                    ]
                }
            ]
        });

        const resultSchedules = [];

        for (const schedule of schedules) {
            const baseScheduleData = {
                subjectName: schedule.course_section?.subject?.name || 'N/A',
                clazzName: schedule.course_section?.clazz?.name || 'N/A',
                lecturerName: schedule.course_section?.lecturers_course_sections?.[0]?.lecturer?.name || 'N/A'
            };

            // Kiểm tra các exception trong tuần hiện tại
            const exceptionsInWeek = schedule.schedule_exceptions?.filter(exception => {
                const exceptionDate = new Date(exception.original_date);
                return exceptionDate >= weekStart && exceptionDate <= weekEnd;
            }) || [];

            if (exceptionsInWeek.length > 0) {
                // Xử lý từng exception
                for (const exception of exceptionsInWeek) {
                    const exceptionDate = new Date(exception.original_date);
                    const exceptionDayOfWeek = datetimeFormatter.getDateOfWeek(exceptionDate);

                    if (exception.exception_type === 'CANCELED') {
                        // Lịch bị hủy
                        resultSchedules.push({
                            ...baseScheduleData,
                            type: schedule.isExam ? 'EXAM' : 'REGULAR',
                            status: 'CANCELED',
                            date: datetimeFormatter.formatDateVN(exceptionDate),
                            day_of_week: exceptionDayOfWeek,
                            room: schedule.room,
                            start_lesson: schedule.start_lesson,
                            end_lesson: schedule.end_lesson,
                            lecturerName: baseScheduleData.lecturerName
                        });
                    } else if (exception.exception_type === 'MAKEUP') {
                        // Lịch học bù
                        if (exception.new_date) {
                            const makeupDate = new Date(exception.new_date);
                            const makeupDayOfWeek = datetimeFormatter.getDateOfWeek(makeupDate);
                            
                            resultSchedules.push({
                                ...baseScheduleData,
                                type: 'MAKEUP',
                                status: 'SCHEDULED',
                                date: datetimeFormatter.formatDateVN(makeupDate),
                                day_of_week: makeupDayOfWeek,
                                room: exception.new_room || schedule.room,
                                start_lesson: exception.new_start_lesson || schedule.start_lesson,
                                end_lesson: exception.new_end_lesson || schedule.end_lesson,
                                lecturerName: exception.new_lecturer?.name || baseScheduleData.lecturerName
                            });
                        }
                        
                        // Thêm lịch gốc bị hủy
                        resultSchedules.push({
                            ...baseScheduleData,
                            type: schedule.isExam ? 'EXAM' : 'REGULAR',
                            status: 'CANCELED',
                            date: datetimeFormatter.formatDateVN(exceptionDate),
                            day_of_week: exceptionDayOfWeek,
                            room: schedule.room,
                            start_lesson: schedule.start_lesson,
                            end_lesson: schedule.end_lesson,
                            lecturerName: baseScheduleData.lecturerName
                        });
                    } else if (exception.exception_type === 'ROOM_CHANGED') {
                        // Đổi phòng
                        resultSchedules.push({
                            ...baseScheduleData,
                            type: schedule.isExam ? 'EXAM' : 'REGULAR',
                            status: 'ROOM_CHANGED',
                            date: datetimeFormatter.formatDateVN(exceptionDate),
                            day_of_week: exceptionDayOfWeek,
                            room: exception.new_room || schedule.room,
                            start_lesson: schedule.start_lesson,
                            end_lesson: schedule.end_lesson,
                            lecturerName: baseScheduleData.lecturerName
                        });
                    } else if (exception.exception_type === 'LECTURER_CHANGED') {
                        // Đổi giảng viên
                        resultSchedules.push({
                            ...baseScheduleData,
                            type: schedule.isExam ? 'EXAM' : 'REGULAR',
                            status: 'LECTURER_CHANGED',
                            date: datetimeFormatter.formatDateVN(exceptionDate),
                            day_of_week: exceptionDayOfWeek,
                            room: schedule.room,
                            start_lesson: schedule.start_lesson,
                            end_lesson: schedule.end_lesson,
                            lecturerName: exception.new_lecturer?.name || baseScheduleData.lecturerName
                        });
                    }
                }
            } else {
                // Không có exception, xử lý lịch bình thường
                if (schedule.isExam && schedule.date) {
                    // Lịch thi
                    const examDate = new Date(schedule.date);
                    if (examDate >= weekStart && examDate <= weekEnd) {
                        resultSchedules.push({
                            ...baseScheduleData,
                            type: 'EXAM',
                            status: schedule.isCompleted ? 'COMPLETED' : 'SCHEDULED',
                            date: datetimeFormatter.formatDateVN(examDate),
                            day_of_week: datetimeFormatter.getDateOfWeek(examDate),
                            room: schedule.room,
                            start_lesson: schedule.start_lesson,
                            end_lesson: schedule.end_lesson,
                            lecturerName: baseScheduleData.lecturerName
                        });
                    }
                } else if (!schedule.isExam && schedule.day_of_week) {
                    // Lịch thường theo ngày trong tuần
                    for (let i = 0; i < 7; i++) {
                        const scheduleDate = new Date(weekStart);
                        scheduleDate.setDate(weekStart.getDate() + i);
                        
                        const scheduleDayOfWeek = scheduleDate.getDay();
                        const adjustedDayOfWeek = scheduleDayOfWeek === 0 ? 7 : scheduleDayOfWeek; // Convert Sunday từ 0 thành 7
                        
                        if (adjustedDayOfWeek === schedule.day_of_week) {
                            resultSchedules.push({
                                ...baseScheduleData,
                                type: 'REGULAR',
                                status: schedule.isCompleted ? 'COMPLETED' : 'SCHEDULED',
                                date: datetimeFormatter.formatDateVN(scheduleDate),
                                day_of_week: adjustedDayOfWeek,
                                room: schedule.room,
                                start_lesson: schedule.start_lesson,
                                end_lesson: schedule.end_lesson,
                                lecturerName: baseScheduleData.lecturerName
                            });
                        }
                    }
                }
            }
        }

        // Sắp xếp theo day_of_week tăng dần
        resultSchedules.sort((a, b) => {
            if (a.day_of_week !== b.day_of_week) {
                return a.day_of_week - b.day_of_week;
            }
            // Nếu cùng ngày, sắp xếp theo tiết học
            return a.start_lesson - b.start_lesson;
        });

        return {
            schedules: resultSchedules,
            prev,
            next,
            weekInfo: {
                weekStart: datetimeFormatter.formatDateVN(weekStart),
                weekEnd: datetimeFormatter.formatDateVN(weekEnd),
                currentDate: currentDate
            }
        };

    } catch (error) {
        console.error('Error in getSchedulesByUserId:', error);
        throw error;
    }
};

module.exports = { getSchedulesByUserId };
