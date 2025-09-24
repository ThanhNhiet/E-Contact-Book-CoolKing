const jwtUtils = require('../utils/jwt.utils');
const studentRepo = require('../repositories/student.repo');

exports.getStudentInfo = async (req, res) => {
    try {
         const authHeader = req.headers['authorization'];
                const token = authHeader && authHeader.split(' ')[1];
                const decoded = jwtUtils.verifyAccessToken(token);
                const student = await studentRepo.getStudentByStudent_id(decoded.user_id);
                if (!student) {
                    return res.status(404).json({ message: 'Học sinh không tồn tại' });
                }
                return res.status(200).json(student);
        } catch (error) {
           res.status(500).json({ message: error.message });
        }
}

exports.updateStudentInfo = async (req, res) => {
    try {
        const authHeader = req.headers['authorization'];
        const token = authHeader && authHeader.split(' ')[1];
        const decoded = jwtUtils.verifyAccessToken(token);
        const student = await studentRepo.getStudentByStudent_id(decoded.user_id);
        if (!student) {
            return res.status(404).json({ message: 'Học sinh không tồn tại' });
        }
        const updatedStudent = await studentRepo.updateStudentInfo(decoded.user_id, req.body);
        return res.status(200).json({ message: 'Cập nhật thông tin học sinh thành công' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
}