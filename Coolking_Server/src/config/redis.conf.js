// Configuration file for Redis
require('dotenv').config();

const redisConfig = {
  host: process.env.REDIS_HOST || 'localhost',
  port: process.env.REDIS_PORT || 6379,
  password: process.env.REDIS_PASSWORD || '',
  keyPrefix: 'econtact:' // Tiền tố cho các key trong Redis
};

module.exports = redisConfig;
