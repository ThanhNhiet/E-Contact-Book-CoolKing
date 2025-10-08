const parentRepo = require('../repositories/parent.repo');
const jwtUtils = require('../utils/jwt.utils');

exports.getParentInfo = async (req, res) => {
    try {
        const authHeader = req.headers['authorization'];
        const token = authHeader && authHeader.split(' ')[1];
        const decoded = jwtUtils.verifyAccessToken(token);
        if (!decoded || decoded.role === 'ADMIN') {
            return res.status(403).json({ message: 'Forbidden' });
        }
        const parentId = req.params.id;
        const parent = await parentRepo.getParentByParent_id(parentId);
        if (!parent) {
            return res.status(404).json({ message: 'Parent not found' });
        }
        res.status(200).json(parent);
    } catch (error) {
        return res.status(500).json({ message: 'Internal server error' });
    }
};
exports.updateParentAvatar = async (req, res) => {
    try {
        const authHeader = req.headers['authorization'];
        const token = authHeader && authHeader.split(' ')[1];
        const decoded = jwtUtils.verifyAccessToken(token);

        if (!decoded || decoded.role === 'ADMIN') {
            return res.status(403).json({ message: 'Forbidden' });
        }

        const parentId = req.params.id;
        if (decoded.user_id !== parentId) {
            return res.status(403).json({ message: 'You can only update your own avatar' });
        }   
        const file = req.file;
        if (!file) {
            return res.status(400).json({ message: 'No file uploaded' });
        }

        const updatedParent = await parentRepo.updateParentAvatar(parentId, file);
        res.status(200).json(updatedParent);
    } catch (error) {
        return res.status(500).json({ message: 'Internal server error' });
    }
};