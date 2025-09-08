const accountRepo = require('../repositories/account.repo');
const jwtUtils = require('../utils/jwt.utils');
const tokenRepo = require('../repositories/token.repo');
const redisService = require('../services/redis.service');

// POST /public/login
exports.login = async (req, res, next) => {
	try {
		const { username, password } = req.body;

		// Xác thực người dùng từ repo
		const account = await accountRepo.login(username, password);

		// Nếu xác thực thành công, tạo token
		const payload = {
			id: account.id,
			user_id: account.user_id,
			role: account.role
		};

		// Tạo access token và refresh token
		const { accessToken, refreshToken } = jwtUtils.generateTokens(payload);

		// Xóa refresh token cũ
		await tokenRepo.deleteTokenByUserId(account.user_id);

		// Lưu refresh token vào database
		const ipAddress = req.ip || req.connection.remoteAddress;
		await tokenRepo.saveToken(account.user_id, refreshToken, ipAddress);

		// Trả về token cho client
		res.json({
			message: "Login successful",
			access_token: accessToken,
			refresh_token: refreshToken
		});
	} catch (err) {
		res.status(401).json({ message: err.message });
	}
};

/**
 * Refresh token để lấy access token mới
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
exports.refreshToken = async (req, res) => {
	try {
		const { refresh_token } = req.body;

		if (!refresh_token) {
			return res.status(400).json({ message: 'Refresh token is required' });
		}

		// Xác thực refresh token
		const decoded = jwtUtils.verifyRefreshToken(refresh_token);

		if (!decoded) {
			return res.status(401).json({ message: 'Invalid or expired refresh token' });
		}

		// Kiểm tra xem token có tồn tại trong database không
		const tokenDoc = await tokenRepo.findToken(refresh_token);

		if (!tokenDoc) {
			return res.status(401).json({ message: 'Refresh token has been revoked' });
		}

		// Tạo access token mới
		const payload = {
			id: decoded.id,
			user_id: decoded.user_id,
			role: decoded.role
		};

		const { accessToken, refreshToken } = jwtUtils.generateTokens(payload);

		// Xóa refresh token cũ
		const result = await tokenRepo.deleteToken(refresh_token);
		if (!result) {
			return res.status(400).json({ message: 'Failed to delete old refresh token' });
		}

		// Lưu refresh token vào database
		const ipAddress = req.ip || req.connection.remoteAddress;
		await tokenRepo.saveToken(decoded.user_id, refreshToken, ipAddress);

		// Trả về access token mới
		res.json({
			access_token: accessToken,
			refresh_token: refreshToken
		});
	} catch (err) {
		res.status(500).json({ message: err.message });
	}
};

/**
 * Đăng xuất - thu hồi refresh token và blacklist access token
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
exports.logout = async (req, res) => {
	try {
		const { refresh_token } = req.body;
		
		if (!refresh_token) {
			return res.status(400).json({ message: 'Refresh token is required' });
		}
		
		// Xóa refresh token khỏi database
		await tokenRepo.deleteToken(refresh_token);
		
		// Blacklist access token hiện tại (nếu có)
		const authHeader = req.headers.authorization;
		if (authHeader && authHeader.startsWith('Bearer ')) {
			const accessToken = authHeader.split(' ')[1];
			
			// Giải mã token để lấy thời gian hết hạn
			const decoded = jwtUtils.decodeToken(accessToken);
			if (decoded && decoded.exp) {
				// Thêm access token vào Redis blacklist với thời gian hết hạn
				await redisService.addToBlacklist(accessToken, decoded.exp);
			}
		}
		
		res.json({ message: 'Logged out successfully' });
	} catch (error) {
		res.status(500).json({ message: error.message });
	}
};