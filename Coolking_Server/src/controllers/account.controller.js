const accountRepo = require('../repositories/account.repo');
const tokenRepo = require('../repositories/token.repo');

// GET /accounts
exports.getAllAccounts = async (req, res) => {
	try {
		const accounts = await accountRepo.getAllAccounts_paging(req.query.page || 1, req.query.pagesize || 10);
		res.json(accounts);
	} catch (err) {
		res.status(500).json({ message: err.message });
	}
};

// GET /accounts/:id
exports.getAccountById = async (req, res) => {
	try {
		const account = await accountRepo.getAccountByUserId(req.params.id);
		if (!account) return res.status(404).json({ message: 'Account not found' });
		res.status(200).json(account);
	} catch (err) {
		res.status(500).json({ message: err.message });
	}
};

// POST /accounts
exports.createAccount = async (req, res) => {
	try {
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
exports.updateAccount = async (req, res) => {
	try {
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
		const deletedAccount = await accountRepo.deleteAccount(req.params.id);
		if (!deletedAccount) return res.status(404).json({ message: 'Account not found' });
		// Xóa token liên quan (nếu có)
		await tokenRepo.deleteTokenByUserId(req.params.id);
		res.status(200).json({ message: 'Account deleted successfully' });
	} catch (err) {
		res.status(500).json({ message: err.message });
	}
};

// POST /accounts/change-password
exports.changePassword = async (req, res) => {
	try {
		const { user_id, oldPassword, newPassword } = req.body;
		await accountRepo.changePassword(user_id, oldPassword, newPassword);
		res.status(200).json({ message: 'Password changed successfully' });
	} catch (err) {
		res.status(500).json({ message: err.message });
	}
};
