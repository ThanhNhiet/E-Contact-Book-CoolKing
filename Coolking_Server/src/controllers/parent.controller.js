const parentRepo = require('../repositories/parent.repo');
const jwtUtils = require('../utils/jwt.utils');

exports.getParentInfo = async (req, res) => {
    try {
        const authHeader = req.headers['authorization'];
        const token = authHeader && authHeader.split(' ')[1];
        const decoded = jwtUtils.verifyAccessToken(token);
        if (!decoded || decoded.role !== 'ADMIN') {
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