const sequelize = require("../config/mariadb.conf");
const initModels = require("../databases/mariadb/model/init-models");
const models = initModels(sequelize);
const jwtUtils = require('../utils/jwt.utils');

/**
 * Lưu refresh token vào database
 * @param {String} userId - ID người dùng
 * @param {String} token - Refresh token
 * @param {String} ipAddress - Địa chỉ IP của người dùng
 * @returns {Object} - Đối tượng token đã lưu
 */
const saveToken = async (userId, token, ipAddress = null) => {
    try {
        const refreshToken = await models.RefreshToken.create({
            user_id: userId,
            token,
            created_by_ip: ipAddress
        });

        return refreshToken;
    } catch (error) {
        throw error;
    }
};

/**
 * Tìm refresh token theo giá trị token
 * @param {String} token - Token cần tìm 
 * @returns {Object} - Token object hoặc null
 */
const findToken = async (token) => {
    try {
        return await models.RefreshToken.findOne({
            where: {
                token,
                revoked: false
            }
        });
    } catch (error) {
        throw error;
    }
};

/**
 * Vô hiệu hóa refresh token
 * @param {String} token - Token cần vô hiệu hóa
 * @returns {Boolean} - Kết quả vô hiệu hóa
 */
const revokeToken = async (token) => {
    try {
        const tokenDoc = await findToken(token);
        if (!tokenDoc) return false;

        tokenDoc.revoked = true;
        await tokenDoc.save();

        return true;
    } catch (error) {
        throw error;
    }
};

const deleteToken = async (token) => {
    try {
        const tokenDoc = await findToken(token);
        if (!tokenDoc) return false;

        await tokenDoc.destroy();
        return true;
    } catch (error) {
        throw error;
    }
};

const deleteTokenByUserId = async (userId) => {
    try {
        const result = await models.RefreshToken.destroy({
            where: {
                user_id: userId
            }
        });
        return result;
    } catch (error) {
        throw error;
    }
};

/**
 * Vô hiệu hóa tất cả token của một người dùng
 * @param {String} userId - User ID
 * @returns {Number} - Số lượng token bị vô hiệu hóa
 */
const revokeAllUserTokens = async (userId) => {
    try {
        const result = await models.RefreshToken.update(
            { revoked: true },
            { where: { user_id: userId, revoked: false } }
        );
        return result[0]; // Số lượng bản ghi đã cập nhật
    } catch (error) {
        throw error;
    }
};

module.exports = {
    saveToken,
    findToken,
    revokeToken,
    deleteToken,
    deleteTokenByUserId,
    revokeAllUserTokens
};
