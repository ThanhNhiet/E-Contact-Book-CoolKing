const connectDB = require('../../config/mongodb.conf');
const models = require('./schemas');

/**
 * Initialize MongoDB connection and models
 * @returns {Object} MongoDB models
 */
const initMongoDB = async () => {
  // Connect to MongoDB
  await connectDB();
  
  console.log('✅ MongoDB models initialized');
  
  return models;
};

module.exports = initMongoDB;
