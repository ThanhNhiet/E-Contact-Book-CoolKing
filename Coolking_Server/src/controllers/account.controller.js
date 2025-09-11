const accountRepo = require('../repositories/account.repo');
const tokenRepo = require('../repositories/token.repo');
const jwtUtils = require('../utils/jwt.utils');
const emailService = require("../services/email.service");

// GET /accounts
exports.getAllAccounts = async (req, res) => {
	try {
		const authHeader = req.headers['authorization'];
		const token = authHeader && authHeader.split(' ')[1];
		const decoded = jwtUtils.verifyAccessToken(token);
		if (!decoded || decoded.role !== 'ADMIN') {
			return res.status(403).json({ message: 'Forbidden' });
		}
		const accounts = await accountRepo.getAllAccounts_paging(req.query.page || 1, req.query.pagesize || 10);
		res.json(accounts);
	} catch (err) {
		res.status(500).json({ message: err.message });
	}
};

// GET /accounts/:id
exports.getAccountById = async (req, res) => {
	try {
		const authHeader = req.headers['authorization'];
		const token = authHeader && authHeader.split(' ')[1];
		const decoded = jwtUtils.verifyAccessToken(token);
		if (!decoded || decoded.role !== 'ADMIN') {
			return res.status(403).json({ message: 'Forbidden' });
		}
		const account = await accountRepo.getAccountByUserId(req.params.id);
		if (!account) return res.status(404).json({ message: 'Account not found' });
		res.status(200).json(account);
	} catch (err) {
		res.status(500).json({ message: err.message });
	}
};

// GET /accounts/search?keyword=&page=&pagesize=
exports.searchAccounts = async (req, res) => {
	try {
		const authHeader = req.headers['authorization'];
		const token = authHeader && authHeader.split(' ')[1];
		const decoded = jwtUtils.verifyAccessToken(token);
		if (!decoded || decoded.role !== 'ADMIN') {
			return res.status(403).json({ message: 'Forbidden' });
		}
		const { keyword, page, pagesize } = req.query;
		const accounts = await accountRepo.getAllAccounts_keyword(keyword || '', page || 1, pagesize || 10);
		res.json(accounts);
	} catch (err) {
		res.status(500).json({ message: err.message });
	}
};

// POST /accounts
exports.createAccount = async (req, res) => {
	try {
		const authHeader = req.headers['authorization'];
		const token = authHeader && authHeader.split(' ')[1];
		const decoded = jwtUtils.verifyAccessToken(token);
		if (!decoded || decoded.role !== 'ADMIN') {
			return res.status(403).json({ message: 'Forbidden' });
		}
		if (!req.body.password ||req.body.password.trim() === '') {
			req.body.password = '12345678';
		}
		await accountRepo.createAccount(req.body);
		res.status(201).json({ message: 'Account created successfully'});
	} catch (err) {
		res.status(500).json({ message: err.message });
	}
};

// PUT /accounts/:id
exports.updateAccount4Admin = async (req, res) => {
	try {
		const authHeader = req.headers['authorization'];
		const token = authHeader && authHeader.split(' ')[1];
		const decoded = jwtUtils.verifyAccessToken(token);
		if (!decoded || decoded.role !== 'ADMIN') {
			return res.status(403).json({ message: 'Forbidden' });
		}
		const updatedAccount = await accountRepo.updateAccount(req.params.id, req.body);
		if (!updatedAccount) return res.status(404).json({ message: 'Account not found' });
		res.status(200).json({ message: 'Account updated successfully' });
	} catch (err) {
		res.status(500).json({ message: err.message });
	}
};

// DELETE /accounts/:id
exports.deleteAccount = async (req, res) => {
	try {
		const authHeader = req.headers['authorization'];
		const token = authHeader && authHeader.split(' ')[1];
		const decoded = jwtUtils.verifyAccessToken(token);
		if (!decoded || decoded.role !== 'ADMIN') {
			return res.status(403).json({ message: 'Forbidden' });
		}
		const deletedAccount = await accountRepo.deleteAccount(req.params.id);
		if (!deletedAccount) return res.status(404).json({ message: 'Account not found' });
		// Xóa token liên quan (nếu có)
		await tokenRepo.deleteTokenByUserId(req.params.id);
		res.status(200).json({ message: 'Account deleted successfully' });
	} catch (err) {
		res.status(500).json({ message: err.message });
	}
};

// POST /accounts/reset-password/:id
exports.resetPassword4Admin = async (req, res) => {
	try {
		const authHeader = req.headers['authorization'];
		const token = authHeader && authHeader.split(' ')[1];
		const decoded = jwtUtils.verifyAccessToken(token);
		if (!decoded || decoded.role !== 'ADMIN') {
			return res.status(403).json({ message: 'Forbidden' });
		}
		const result = await accountRepo.resetPassword4Admin(req.params.id);
		res.status(200).json({ message: 'Reset password successfully', newPassword: result });
	} catch (err) {
		res.status(500).json({ message: err.message });
	}
};

// POST /accounts/change-password
exports.changePassword = async (req, res) => {
	try {
		const authHeader = req.headers['authorization'];
		const token = authHeader && authHeader.split(' ')[1];
		const decoded = jwtUtils.verifyAccessToken(token);
		const {oldPassword, newPassword } = req.body;
		await accountRepo.changePassword(decoded.user_id, oldPassword, newPassword);
		res.status(200).json({ message: 'Password changed successfully' });
	} catch (err) {
		res.status(500).json({ message: err.message });
	}
};

// POST /public/verify-otp
exports.verifyOTP = async (req, res) => {
	try {
		const { email, otp } = req.body;

		// Kiểm tra các trường bắt buộc
		if (!email || !otp) {
			return res.status(400).json({
				success: false,
				message: 'Email và OTP là bắt buộc'
			});
		}

		// Kiểm tra format email
		const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
		if (!emailRegex.test(email)) {
			return res.status(400).json({
				success: false,
				message: 'Email không hợp lệ'
			});
		}

		// Kiểm tra format OTP (6 số)
		const otpRegex = /^\d{6}$/;
		if (!otpRegex.test(otp)) {
			return res.status(400).json({
				success: false,
				message: 'OTP phải là 6 chữ số'
			});
		}

		const result = await emailService.verifyOTP(email, otp);

		if (result.success) {
			res.status(200).json({
				success: true,
				message: result.message,
				data: {
					email: email,
					verified: true,
					resetToken: result.resetToken
				}
			});
		} else {
			res.status(400).json({
				success: false,
				message: result.message
			});
		}

	} catch (error) {
		console.error('Error in verifyOTP controller:', error);
		res.status(500).json({
			success: false,
			message: error.message || 'Lỗi server khi xác thực OTP'
		});
	}
};

// POST /public/check-email/:email
exports.checkAccountByEmail = async (req, res) => {
	try {
		const { email } = req.params;

		// Kiểm tra email có được cung cấp không
		if (!email) {
			return res.status(400).json({
				success: false,
				message: 'Email là bắt buộc'
			});
		}

		// Kiểm tra format email
		const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
		if (!emailRegex.test(email)) {
			return res.status(400).json({
				success: false,
				message: 'Email không hợp lệ'
			});
		}

		const result = await accountRepo.checkAccountByEmail(email);

		if (result === 0) {
			return res.status(404).json({
				success: false,
				message: 'Không tìm thấy tài khoản với email này'
			});
		} else if (result === -1) {
			return res.status(500).json({
				success: false,
				message: 'Lỗi khi gửi OTP. Vui lòng thử lại sau'
			});
		} else {
			return res.status(200).json({
				success: true,
				message: 'Tìm thấy tài khoản. OTP đã được gửi đến email của bạn',
				data: {
					email: email,
					accountExists: true,
					otpSent: true
				}
			});
		}

	} catch (error) {
		console.error('Error in checkAccountByEmail controller:', error);
		res.status(500).json({
			success: false,
			message: error.message || 'Lỗi server khi kiểm tra email'
		});
	}
};

// POST /public/change-password-by-email
exports.changePasswordByEmail = async (req, res) => {
	try {
		const { email, resetToken, oldPassword, newPassword } = req.body;
		if (!email || !resetToken || !oldPassword || !newPassword) {
			return res.status(400).json({
				success: false,
				message: 'Email, resetToken, oldPassword và newPassword là bắt buộc'
			});
		}
		const result = await accountRepo.changePassword_ByEmail(email, resetToken, oldPassword, newPassword);
		if (result === 0) {
			return res.status(400).json({
				success: false,
				message: 'Token đặt lại không hợp lệ hoặc đã hết hạn'
			});
		} else {
			return res.status(200).json({
				success: true,
				message: 'Đổi mật khẩu thành công'
			});
		}
	} catch (error) {
		console.error('Error in changePasswordByEmail controller:', error);
		res.status(500).json({
			success: false,
			message: error.message || 'Lỗi server'
		});
	}
};