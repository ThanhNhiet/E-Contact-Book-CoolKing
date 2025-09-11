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

/**
 * Set giá trị với thời gian hết hạn
 * @param {String} key - Key
 * @param {Number} seconds - Thời gian hết hạn (giây)
 * @param {String} value - Giá trị
 */
const setex = async (key, seconds, value) => {
  try {
    return await redis.setex(key, seconds, value);
  } catch (error) {
    console.error('Redis error when setting key with expiration:', error);
    throw error;
  }
};

/**
 * Lấy giá trị theo key
 * @param {String} key - Key
 * @returns {String|null} - Giá trị hoặc null nếu không tồn tại
 */
const get = async (key) => {
  try {
    return await redis.get(key);
  } catch (error) {
    console.error('Redis error when getting key:', error);
    throw error;
  }
};

/**
 * Xóa key
 * @param {String} key - Key cần xóa
 * @returns {Number} - Số key đã xóa
 */
const del = async (key) => {
  try {
    return await redis.del(key);
  } catch (error) {
    console.error('Redis error when deleting key:', error);
    throw error;
  }
};

/**
 * Kiểm tra key có tồn tại hay không
 * @param {String} key - Key cần kiểm tra
 * @returns {Number} - 1 nếu tồn tại, 0 nếu không
 */
const exists = async (key) => {
  try {
    return await redis.exists(key);
  } catch (error) {
    console.error('Redis error when checking key existence:', error);
    throw error;
  }
};

/**
 * Lấy thời gian còn lại của key (TTL)
 * @param {String} key - Key cần kiểm tra
 * @returns {Number} - TTL tính bằng giây, -1 nếu không có TTL, -2 nếu key không tồn tại
 */
const ttl = async (key) => {
  try {
    return await redis.ttl(key);
  } catch (error) {
    console.error('Redis error when getting TTL:', error);
    throw error;
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
  getAllBlacklistedTokens,
  setex,
  get,
  del,
  exists,
  ttl
};
