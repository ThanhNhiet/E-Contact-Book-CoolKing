const attendanceRepo = require('../repositories/attendance.repo');
const jwtUtils = require('../utils/jwt.utils');

// GET /attendances/students?course_section_id=&attendance_id=
exports.getAttendanceDetailsByCourseSectionAndAttendanceID = async (req, res) => {
    try {
        const authHeader = req.headers['authorization'];
        const token = authHeader && authHeader.split(' ')[1];
        const decoded = jwtUtils.verifyAccessToken(token);
        if (!decoded || decoded.role !== 'LECTURER') {
            return res.status(403).json({ message: 'Forbidden' });
        }

        const { course_section_id, attendance_id } = req.query;
        if (!course_section_id) {
            return res.status(400).json({ 
                success: false,
                message: 'Mã học phần (course_section_id) là bắt buộc' 
            });
        }

        if (!attendance_id) {
            return res.status(400).json({ 
                success: false,
                message: 'Mã điểm danh (attendance_id) là bắt buộc' 
            });
        }

        const attendanceDetails = await attendanceRepo.getAttendanceDetailsByCourseSectionAndAttendanceID(course_section_id, attendance_id);
        return res.status(200).json(attendanceDetails);

    } catch (error) {
        console.error('Error in getAttendanceDetailsByCourseSectionAndAttendanceID:', error);
        return res.status(500).json({ 
            success: false,
            message: 'Internal Server Error',
            error: error.message 
        });
    }
};

// POST /attendances/students/:attendance_id
exports.createOrUpdateAttendanceStudents = async (req, res) => {
    try {
        const authHeader = req.headers['authorization'];
        const token = authHeader && authHeader.split(' ')[1];
        const decoded = jwtUtils.verifyAccessToken(token);
        if (!decoded || decoded.role !== 'LECTURER') {
            return res.status(403).json({ message: 'Forbidden' });
        }
        const { attendance_id } = req.params;
        if (!attendance_id) {
            return res.status(400).json({ 
                success: false,
                message: 'Mã điểm danh (attendance_id) là bắt buộc' 
            });
        }
        const attendanceData = req.body;
        if (!attendanceData || !Array.isArray(attendanceData.students) || attendanceData.students.length === 0) {
            return res.status(400).json({ 
                success: false,
                message: 'Dữ liệu điểm danh (students) là bắt buộc và phải là một mảng không rỗng' 
            });
        }
        const result = await attendanceRepo.createAttendanceRecord(attendance_id, attendanceData);
        if (result.success) {
            return res.status(200).json(result);
        } else {
            return res.status(400).json({
                success: false,
                message: result.message
            });
        }
    } catch (error) {
        console.error('Error in createOrUpdateAttendanceStudents:', error);
        return res.status(500).json({
            success: false,
            message: 'Internal Server Error',
            error: error.message
        });
    }
};

// PUT /attendances/students/:attendance_id
exports.updateAttendanceStudents = async (req, res) => {
    try {
        const authHeader = req.headers['authorization'];
        const token = authHeader && authHeader.split(' ')[1];
        const decoded = jwtUtils.verifyAccessToken(token);
        if (!decoded || decoded.role !== 'LECTURER') {
            return res.status(403).json({ message: 'Forbidden' });
        }
        const { attendance_id } = req.params;
        if (!attendance_id) {
            return res.status(400).json({
                success: false,
                message: 'Mã điểm danh (attendance_id) là bắt buộc'
            });
        }
        const attendanceData = req.body;
        if (!attendanceData || !Array.isArray(attendanceData.students) || attendanceData.students.length === 0) {
            return res.status(400).json({
                success: false,
                message: 'Dữ liệu điểm danh (students) là bắt buộc và phải là một mảng không rỗng'
            });
        }
        const result = await attendanceRepo.updateAttendanceRecord(attendance_id, attendanceData);
        if (result.success) {
            return res.status(200).json(result);
        } else {
            return res.status(400).json({
                success: false,
                message: result.message
            });
        }
    } catch (error) {
        console.error('Error in updateAttendanceStudents:', error);
        return res.status(500).json({
            success: false,
            message: 'Internal Server Error',
            error: error.message
        });
    }
};
