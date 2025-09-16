const scheduleRepo = require("../repositories/schedule.repo");
const jwtUtils = require('../utils/jwt.utils');

exports.getSchedulesByUserId = async (req, res) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];
    const decoded = jwtUtils.verifyAccessToken(token);
    const { currentDate } = req.query;
    try {
        const result = await scheduleRepo.getSchedulesByUserId(decoded.user_id, currentDate);
        res.json(result);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};
