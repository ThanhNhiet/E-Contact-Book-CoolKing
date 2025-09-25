const lecturerRepo = require('../repositories/lecturer.repo');
const jwtUtils = require('../utils/jwt.utils');

exports.getLecturerInfo = async (req, res) => {
    try {
        const authHeader = req.headers['authorization'];
        const token = authHeader && authHeader.split(' ')[1];
        const decoded = jwtUtils.verifyAccessToken(token);
        const lecturer = await lecturerRepo.getLecturerByLecturer_id(decoded.user_id);
        if (!lecturer) return res.status(404).json({ message: 'Giảng viên không tồn tại' });
        res.status(200).json(lecturer);
    } catch (error) {
        res.status(500).json({ message: error.message });
    };
};

exports.updateLecturerInfo = async (req, res) => {
    try {
        const authHeader = req.headers['authorization'];
        const token = authHeader && authHeader.split(' ')[1];
        const decoded = jwtUtils.verifyAccessToken(token);
        const updatedLecturer = await lecturerRepo.updateLecturer(decoded.user_id, req.body);
        if (!updatedLecturer) return res.status(404).json({ message: 'Giảng viên không tồn tại' });
        res.status(200).json({ message: 'Cập nhật thông tin giảng viên thành công' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

exports.uploadAvatar = async (req, res) => {
    try {
        const authHeader = req.headers['authorization'];
        const token = authHeader && authHeader.split(' ')[1];
        const decoded = jwtUtils.verifyAccessToken(token);
        if (!req.file) {
            return res.status(400).json({ message: 'Vui lòng chọn file ảnh' });
        }
        const updatedLecturer = await lecturerRepo.uploadAvatar(decoded.user_id, req.file);
        if (!updatedLecturer) return res.status(404).json({ message: 'Giảng viên không tồn tại' });
        res.status(200).json({ message: 'Cập nhật avatar thành công', avatar: updatedLecturer.avatar });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};