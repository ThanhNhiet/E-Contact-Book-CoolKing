const jwtUtils = require('../utils/jwt.utils');
const tokenRepo = require('../repositories/token.repo');
const redisService = require('../services/redis.service');

/**
 * Kiểm tra và xác thực JWT token từ header Authorization
 * Middleware này sẽ xác thực access token và thêm thông tin người dùng vào req.user
 */
const authenticateJWT = async (req, res, next) => {
  try {
    // Kiểm tra header Authorization
    const authHeader = req.headers.authorization;
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ message: 'Authentication required' });
    }
    
    // Lấy token từ header
    const token = authHeader.split(' ')[1];
    
    // Kiểm tra xem token có trong Redis blacklist không
    const isBlacklisted = await redisService.isBlacklisted(token);
    if (isBlacklisted) {
      return res.status(401).json({ message: 'Token has been revoked' });
    }
    
    // Xác thực token
    const decoded = jwtUtils.verifyAccessToken(token);
    
    if (!decoded) {
      return res.status(401).json({ message: 'Invalid or expired token' });
    }
    
    // Thêm thông tin người dùng vào request để các middleware/controller tiếp theo sử dụng
    req.user = decoded;
    
    next();
  } catch (error) {
    return res.status(500).json({ message: 'Authentication error', error: error.message });
  }
};

module.exports = {
  authenticateJWT
};
