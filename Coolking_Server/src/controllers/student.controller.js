const studentRepo = require('../repositories/student.repo');
const jwtUtils = require('../utils/jwt.utils');

// GET /students/score-view/:course_section_id
exports.getStudentsByCourseSection = async (req, res) => {
    try {
        const authHeader = req.headers['authorization'];
        const token = authHeader && authHeader.split(' ')[1];
        const decoded = jwtUtils.verifyAccessToken(token);
        if (!decoded || (decoded.role !== 'ADMIN' && decoded.role !== 'LECTURER')) {
            return res.status(403).json({ message: 'Forbidden' });
        }
        const courseSectionId = req.params.course_section_id;
        const students = await studentRepo.getStudentsScoreByCourseSectionId4Lecturer(courseSectionId);
        res.status(200).json(students);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

// GET /students/info-view-le-ad/:student_id
exports.getStudentInfoViewByLecturer = async (req, res) => {
    try {
        const authHeader = req.headers['authorization'];
        const token = authHeader && authHeader.split(' ')[1];
        const decoded = jwtUtils.verifyAccessToken(token);
        if (!decoded || (decoded.role !== 'ADMIN' && decoded.role !== 'LECTURER')) {
            return res.status(403).json({ message: 'Forbidden' });
        }
        const studentId = req.params.student_id;
        const studentInfo = await studentRepo.getStudentInfoById4Lecturer(studentId);
        res.status(200).json(studentInfo);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};