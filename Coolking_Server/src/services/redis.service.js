const Redis = require('ioredis');
const redisConfig = require('../config/redis.conf');

// Khởi tạo kết nối Redis
const redis = new Redis(redisConfig);

// Prefix cho blacklisted tokens
const TOKEN_BLACKLIST_PREFIX = 'token:blacklist:';

/**
 * Thêm token vào blacklist
 * @param {String} token - JWT token cần vô hiệu hóa
 * @param {Number} exp - Thời gian hết hạn của token (Unix timestamp)
 */
const addToBlacklist = async (token, exp) => {
  try {
    const now = Math.floor(Date.now() / 1000);
    const ttl = exp - now; // Thời gian còn lại tính bằng giây
    
    if (ttl > 0) {
      // Lưu token vào Redis với thời gian tự động hết hạn
      // Giá trị '1' chỉ là flag, quan trọng là key tồn tại
      await redis.set(`${TOKEN_BLACKLIST_PREFIX}${token}`, 1, 'EX', ttl);
    }
    return true;
  } catch (error) {
    console.error('Redis error when adding to blacklist:', error);
    return false;
  }
};

/**
 * Kiểm tra token có trong blacklist hay không
 * @param {String} token - JWT token cần kiểm tra
 * @returns {Boolean} - True nếu token trong blacklist, False nếu không
 */
const isBlacklisted = async (token) => {
  try {
    const result = await redis.exists(`${TOKEN_BLACKLIST_PREFIX}${token}`);
    return result === 1;
  } catch (error) {
    console.error('Redis error when checking blacklist:', error);
    return false; // Nếu có lỗi, vẫn cho phép token (để tránh block người dùng)
  }
};

/**
 * Xóa token khỏi blacklist
 * @param {String} token - JWT token cần xóa
 * @returns {Boolean} - True nếu xóa thành công, False nếu không
 */
const removeFromBlacklist = async (token) => {
  try {
    const result = await redis.del(`${TOKEN_BLACKLIST_PREFIX}${token}`);
    return result === 1;
  } catch (error) {
    console.error('Redis error when removing from blacklist:', error);
    return false;
  }
};

/**
 * Lấy tất cả token trong blacklist (chỉ dùng cho debug)
 * @returns {Array} - Danh sách các token trong blacklist
 */
const getAllBlacklistedTokens = async () => {
  try {
    const keys = await redis.keys(`${TOKEN_BLACKLIST_PREFIX}*`);
    return keys.map(key => key.replace(TOKEN_BLACKLIST_PREFIX, ''));
  } catch (error) {
    console.error('Redis error when getting all blacklisted tokens:', error);
    return [];
  }
};

// Kiểm tra kết nối Redis khi khởi động
redis.on('connect', () => {
  console.log('✅ Connected to Redis server');
});

redis.on('error', (err) => {
  console.error('❌ Redis connection error:', err);
});

module.exports = {
  redis,
  addToBlacklist,
  isBlacklisted,
  removeFromBlacklist,
  getAllBlacklistedTokens
};
