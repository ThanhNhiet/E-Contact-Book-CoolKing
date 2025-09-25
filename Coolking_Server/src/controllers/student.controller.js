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
// GET /students/info-student/:student_id
exports.getStudentInfo = async (req, res) => {
    try {
        const authHeader = req.headers['authorization'];
        const token = authHeader && authHeader.split(' ')[1];
        const decoded = jwtUtils.verifyAccessToken(token);
        const student = await studentRepo.getStudentByStudent_id(decoded.user_id);
        if (!student) return res.status(404).json({ message: 'Sinh viên không tồn tại' });
        res.status(200).json(student);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};
// PUT /student/update-info
exports.updateStudentInfo = async (req, res) => {
    try {   
        const authHeader = req.headers['authorization'];
        const token = authHeader && authHeader.split(' ')[1];
        const decoded = jwtUtils.verifyAccessToken(token);
        const updatedStudent = await studentRepo.updateStudentInfo(decoded.user_id, req.body);
        if (!updatedStudent) return res.status(404).json({ message: 'Sinh viên không tồn tại' });
        res.status(200).json({ message: 'Cập nhật thông tin sinh viên thành công' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// GET /students/schedule/:student_id - Lịch học với exceptions (cho admin/lecturer)
exports.getStudentScheduleWithExceptions = async (req, res) => {
    try {
        const authHeader = req.headers['authorization'];
        const token = authHeader && authHeader.split(' ')[1];
        const decoded = jwtUtils.verifyAccessToken(token);
        
        if (!decoded || (decoded.role !== 'ADMIN' && decoded.role !== 'LECTURER')) {
            return res.status(403).json({ message: 'Forbidden' });
        }
        
        const studentId = req.params.student_id;
        const schedule = await studentRepo.getStudentScheduleWithExceptions(studentId);
        res.status(200).json(schedule);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// GET /students/my-schedule - Lịch học của chính sinh viên
exports.getMyScheduleWithExceptions = async (req, res) => {
    try {
        const authHeader = req.headers['authorization'];
        const token = authHeader && authHeader.split(' ')[1];
        const decoded = jwtUtils.verifyAccessToken(token);
        
        if (!decoded || decoded.role !== 'STUDENT') {
            return res.status(403).json({ message: 'Forbidden' });
        }
        
        const schedule = await studentRepo.getStudentScheduleWithExceptions(decoded.user_id);
        res.status(200).json(schedule);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// GET /students/basic-schedule/:student_id - Lịch học đơn giản
exports.getStudentBasicSchedule = async (req, res) => {
    try {
        const authHeader = req.headers['authorization'];
        const token = authHeader && authHeader.split(' ')[1];
        const decoded = jwtUtils.verifyAccessToken(token);
        
        if (!decoded || (decoded.role !== 'ADMIN' && decoded.role !== 'LECTURER')) {
            return res.status(403).json({ message: 'Forbidden' });
        }
        
        const studentId = req.params.student_id;
        const schedule = await studentRepo.getStudentBasicSchedule(studentId);
        res.status(200).json(schedule);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// GET /students/my-basic-schedule - Lịch học đơn giản của chính sinh viên
exports.getMyBasicSchedule = async (req, res) => {
    try {
        const authHeader = req.headers['authorization'];
        const token = authHeader && authHeader.split(' ')[1];
        const decoded = jwtUtils.verifyAccessToken(token);
        
        if (!decoded || decoded.role !== 'STUDENT') {
            return res.status(403).json({ message: 'Forbidden' });
        }
        
        const schedule = await studentRepo.getStudentBasicSchedule(decoded.user_id);
        res.status(200).json(schedule);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// GET /students/exam-schedule/:student_id - Lịch thi
exports.getStudentExamSchedule = async (req, res) => {
    try {
        const authHeader = req.headers['authorization'];
        const token = authHeader && authHeader.split(' ')[1];
        const decoded = jwtUtils.verifyAccessToken(token);
        
        if (!decoded || (decoded.role !== 'ADMIN' && decoded.role !== 'LECTURER')) {
            return res.status(403).json({ message: 'Forbidden' });
        }
        
        const studentId = req.params.student_id;
        const examSchedule = await studentRepo.getStudentExamSchedule(studentId);
        res.status(200).json(examSchedule);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// GET /students/my-exam-schedule - Lịch thi của chính sinh viên
exports.getMyExamSchedule = async (req, res) => {
    try {
        const authHeader = req.headers['authorization'];
        const token = authHeader && authHeader.split(' ')[1];
        const decoded = jwtUtils.verifyAccessToken(token);
        
        if (!decoded || decoded.role !== 'STUDENT') {
            return res.status(403).json({ message: 'Forbidden' });
        }
        
        const examSchedule = await studentRepo.getStudentExamSchedule(decoded.user_id);
        res.status(200).json(examSchedule);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};