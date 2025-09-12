const scheduleRepo = require("../repositories/schedule.repo");

exports.getSchedulesByUserId = async (req, res) => {
    const { user_id } = req.params;
    const { currentDate, page, pageSize } = req.query;
    try {
        const result = await scheduleRepo.getSchedulesByUserId(user_id, currentDate, page, pageSize);
        res.json(result);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};
