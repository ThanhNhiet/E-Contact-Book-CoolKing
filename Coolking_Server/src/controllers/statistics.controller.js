const statisticsRepo = require('../repositories/statistics.repo');
const jwtUtils = require('../utils/jwt.utils');

// GET /api/statistics/faculty-overview?faculty_id=&session_id=
exports.getFacultyOverviewStatistics = async (req, res) => {
    try {
        const authHeader = req.headers['authorization'];
        const token = authHeader && authHeader.split(' ')[1];
        const decoded = jwtUtils.verifyAccessToken(token);
        if (!decoded || decoded.role !== 'ADMIN') {
            return res.status(403).json({ error: 'Forbidden' });
        }
        const { faculty_id, session_id } = req.query;

        const statistics = await statisticsRepo.getFacultyStatisticsBySession(faculty_id, session_id);
        return res.status(200).json(statistics);
    } catch (error) {
        console.error('Error in getFacultyOverviewStatistics:', error);
        return res.status(500).json({ error: 'Internal Server Error' });
    }
};

// GET /api/statistics/lecturer-overview?lecturer_id=&session_id=
exports.getLecturerOverviewStatistics = async (req, res) => {
    try {
        const authHeader = req.headers['authorization'];
        const token = authHeader && authHeader.split(' ')[1];
        const decoded = jwtUtils.verifyAccessToken(token);
        if (!decoded || decoded.role !== 'ADMIN') {
            return res.status(403).json({ error: 'Forbidden' });
        }
        const { lecturer_id, session_id } = req.query;

        const statistics = await statisticsRepo.getLecturerStatisticsBySession(lecturer_id, session_id);
        return res.status(200).json(statistics);
    } catch (error) {
        console.error('Error in getLecturerOverviewStatistics:', error);
        return res.status(500).json({ error: 'Internal Server Error' });
    }
};

// GET /api/statistics/lecturers-overview?faculty_id=&session_id=
exports.getLecturersOverviewStatisticsByFaculty = async (req, res) => {
    try {
        const authHeader = req.headers['authorization'];
        const token = authHeader && authHeader.split(' ')[1];
        const decoded = jwtUtils.verifyAccessToken(token);
        if (!decoded || decoded.role !== 'ADMIN') {
            return res.status(403).json({ error: 'Forbidden' });
        }
        const { faculty_id, session_id } = req.query;
        const statistics = await statisticsRepo.getLecturersStatisticsByFaculty(faculty_id, session_id);
        return res.status(200).json(statistics);
    } catch (error) {
        console.error('Error in getLecturersOverviewStatisticsByFaculty:', error);
        return res.status(500).json({ error: 'Internal Server Error' });
    }
};

// GET /api/statistics/course-section-overview?course_section_id=&session_id=
exports.getCourseSectionOverviewStatistics = async (req, res) => {
    try {
        const authHeader = req.headers['authorization'];
        const token = authHeader && authHeader.split(' ')[1];
        const decoded = jwtUtils.verifyAccessToken(token);
        if (!decoded || decoded.role !== 'LECTURER' && decoded.role !== 'ADMIN') {
            return res.status(403).json({ error: 'Forbidden' });
        }

        const { course_section_id, session_id } = req.query;

        const statistics = await statisticsRepo.getCourseSectionStatisticsBySession(course_section_id, session_id);
        return res.status(200).json(statistics);

    } catch (error) {
        console.error('Error in getCourseSectionOverviewStatistics:', error);
        return res.status(500).json({ error: 'Internal Server Error' });
    }
};

// GET /api/statistics/courses-sections-overview?faculty_id=&session_id=
exports.getCourseSectionsOverviewStatisticsByFaculty = async (req, res) => {
    try {
        const authHeader = req.headers['authorization'];
        const token = authHeader && authHeader.split(' ')[1];
        const decoded = jwtUtils.verifyAccessToken(token);
        if (!decoded || decoded.role !== 'ADMIN') {
            return res.status(403).json({ error: 'Forbidden' });
        }
        const { faculty_id, session_id } = req.query;
        const statistics = await statisticsRepo.getCourseSectionsStatisticsByFaculty(faculty_id, session_id);
        return res.status(200).json(statistics);
    } catch (error) {
        console.error('Error in getCourseSectionsOverviewStatisticsByFaculty:', error);
        return res.status(500).json({ error: 'Internal Server Error' });
    }
};