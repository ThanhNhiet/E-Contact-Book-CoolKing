const accountRepo = require('../repositories/account.repo');
const tokenRepo = require('../repositories/token.repo');
const jwtUtils = require('../utils/jwt.utils');

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
