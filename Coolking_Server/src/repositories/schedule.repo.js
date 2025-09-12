const { Op, fn, col } = require("sequelize");
const sequelize = require("../config/mariadb.conf");
const { initModels } = require("../databases/mariadb/model/init-models");
const models = initModels(sequelize);
const datetimeFormatter = require("../utils/format/datetime-formatter");

// Map type sang tiếng Việt
const typeMap = {
    REGULAR: "Lịch học",
    MAKEUP: "Lịch bù",
    EXAM: "Lịch thi"
};

// Map status để ưu tiên
const statusOrder = { CANCELED: 1, SCHEDULED: 2, COMPLETED: 3 };
// Map type để ưu tiên
const typeOrder = { EXAM: 1, MAKEUP: 2, REGULAR: 3 };

const getSchedulesByUserId = async (user_id, currentDate, page = 1, pageSize = 10) => {
    try {
        // Parse currentDate dd/MM/yyyy -> Date
        const [d, m, y] = currentDate.split("/");
        const jsDate = new Date(`${y}-${m}-${d}`);

        // Lấy ngày đầu tuần (Thứ 2)
        const startOfWeek = new Date(jsDate);
        startOfWeek.setDate(jsDate.getDate() - jsDate.getDay() + 1);

        // Lấy ngày cuối tuần (Chủ nhật)
        const endOfWeek = new Date(startOfWeek);
        endOfWeek.setDate(startOfWeek.getDate() + 6);

        const { count, rows } = await models.Schedule.findAndCountAll({
            where: {
                user_id,
                [Op.or]: [
                    // Lịch định kỳ (REGULAR): trong khoảng start_date - end_date và khớp thứ
                    {
                        type: "REGULAR",
                        start_date: { [Op.lte]: endOfWeek },
                        end_date: { [Op.gte]: startOfWeek },
                    },
                    // Lịch bù hoặc thi: có date nằm trong tuần
                    {
                        type: { [Op.in]: ["MAKEUP", "EXAM"] },
                        date: { [Op.between]: [startOfWeek, endOfWeek] }
                    }
                ]
            },
            include: [
                {
                    model: models.CourseSection,
                    as: "course_section",
                    include: [
                        { model: models.Subject, as: "subject", attributes: ["name"] },
                        { model: models.Clazz, as: "clazz", attributes: ["name"] }
                    ]
                }
            ],
            attributes: [
                "id", "type", "status", "date", "day_of_week", "room", "start_lesson", "end_lesson"
            ],
            raw: false
        });

        // Sắp xếp theo ưu tiên status rồi đến type
        const sorted = rows.sort((a, b) => {
            const statusCmp = statusOrder[a.status] - statusOrder[b.status];
            if (statusCmp !== 0) return statusCmp;
            return typeOrder[a.type] - typeOrder[b.type];
        });

        // Phân trang
        const offset = (page - 1) * pageSize;
        const paged = sorted.slice(offset, offset + pageSize);

        const schedules = paged.map(s => {
            // Nếu là REGULAR → generate date từ day_of_week
            let realDate = s.date;
            if (s.type === "REGULAR" && s.day_of_week) {
                realDate = datetimeFormatter.getDateOfWeek(s.day_of_week, jsDate);
            }
            return {
                subjectName: s.course_section?.subject?.name || null,
                clazzName: s.course_section?.clazz?.name || null,
                type: typeMap[s.type],
                status: s.status,
                date: realDate ? datetimeFormatter.formatDateVN(realDate) : null,
                day_of_week: s.day_of_week || null,
                room: s.room,
                start_lesson: s.start_lesson,
                end_lesson: s.end_lesson
            };
        });


        const linkPrev = page > 1 ? `/api/schedules?user_id=${user_id}&page=${page - 1}&pageSize=${pageSize}` : null;
        const linkNext = offset + pageSize < count ? `/api/schedules?user_id=${user_id}&page=${page + 1}&pageSize=${pageSize}` : null;

        return { total: count, page, pageSize, schedules, linkPrev, linkNext };
    } catch (error) {
        throw error;
    }
};

module.exports = { getSchedulesByUserId };
