const jwt = require('jsonwebtoken');
const jwtConfig = require('../config/jwt.conf');

/**
 * Generate JWT tokens
 * @param {Object} payload - User information to include in token
 * @returns {Object} - Access and refresh tokens
 */
const generateTokens = (payload) => {
  const accessToken = jwt.sign(payload, jwtConfig.accessToken.secret, {
    expiresIn: jwtConfig.accessToken.expiresIn
  });

  const refreshToken = jwt.sign(payload, jwtConfig.refreshToken.secret, {
    expiresIn: jwtConfig.refreshToken.expiresIn
  });

  return { accessToken, refreshToken };
};

/**
 * Verify access token
 * @param {String} token - JWT token to verify
 * @returns {Object} - Decoded token payload or null if invalid
 */
const verifyAccessToken = (token) => {
  try {
    return jwt.verify(token, jwtConfig.accessToken.secret);
  } catch (error) {
    return null;
  }
};

/**
 * Verify refresh token
 * @param {String} token - JWT token to verify
 * @returns {Object} - Decoded token payload or null if invalid
 */
const verifyRefreshToken = (token) => {
  try {
    return jwt.verify(token, jwtConfig.refreshToken.secret);
  } catch (error) {
    return null;
  }
};

/**
 * Decode JWT token without verification
 * @param {String} token - JWT token to decode
 * @returns {Object|null} - Decoded token payload or null if invalid format
 */
const decodeToken = (token) => {
  try {
    return jwt.decode(token);
  } catch (error) {
    return null;
  }
};

module.exports = {
  generateTokens,
  verifyAccessToken,
  verifyRefreshToken,
  decodeToken
};
