const redisService = require('../services/redis.service');

/**
 * Rate limiting middleware cho OTP requests
 * Giới hạn 5 requests/15 phút cho mỗi IP
 */
const otpRateLimit = async (req, res, next) => {
    try {
        const ip = req.ip || req.connection.remoteAddress;
        const key = `otp_rate_limit:${ip}`;
        
        // Lấy số lượng requests hiện tại
        const currentRequests = await redisService.get(key);
        
        if (currentRequests === null) {
            // Nếu chưa có request nào, tạo mới với TTL 15 phút
            await redisService.setex(key, 900, 1); // 900 seconds = 15 minutes
            return next();
        }
        
        const requestCount = parseInt(currentRequests);
        
        if (requestCount >= 5) {
            // Lấy TTL để thông báo thời gian còn lại
            const ttl = await redisService.ttl(key);
            
            return res.status(429).json({
                success: false,
                message: `Quá nhiều yêu cầu gửi OTP. Vui lòng thử lại sau ${Math.ceil(ttl / 60)} phút`,
                retryAfter: ttl
            });
        }
        
        // Tăng số lượng requests
        await redisService.redis.incr(key);
        next();
        
    } catch (error) {
        console.error('Error in OTP rate limit middleware:', error);
        // Nếu có lỗi với Redis, vẫn cho phép request đi qua
        next();
    }
};

/**
 * Rate limiting middleware cho verify OTP requests
 * Giới hạn 10 attempts/5 phút cho mỗi email
 */
const verifyOtpRateLimit = async (req, res, next) => {
    try {
        const { email } = req.body;
        
        if (!email) {
            return next();
        }
        
        const key = `verify_otp_rate_limit:${email}`;
        
        // Lấy số lượng attempts hiện tại
        const currentAttempts = await redisService.get(key);
        
        if (currentAttempts === null) {
            // Nếu chưa có attempt nào, tạo mới với TTL 5 phút
            await redisService.setex(key, 300, 1); // 300 seconds = 5 minutes
            return next();
        }
        
        const attemptCount = parseInt(currentAttempts);
        
        if (attemptCount >= 10) {
            // Lấy TTL để thông báo thời gian còn lại
            const ttl = await redisService.ttl(key);
            
            return res.status(429).json({
                success: false,
                message: `Quá nhiều lần thử sai OTP. Vui lòng thử lại sau ${Math.ceil(ttl / 60)} phút`,
                retryAfter: ttl
            });
        }
        
        // Tăng số lượng attempts
        await redisService.redis.incr(key);
        next();
        
    } catch (error) {
        console.error('Error in verify OTP rate limit middleware:', error);
        // Nếu có lỗi với Redis, vẫn cho phép request đi qua
        next();
    }
};

module.exports = {
    otpRateLimit,
    verifyOtpRateLimit
};
