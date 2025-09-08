const express = require('express');
const accountController = require('../controllers/account.controller');
const router = express.Router();

//GET /accounts?page=&pageSize=
router.get('/', accountController.getAllAccounts);

//GET /accounts/:id
router.get('/:id', accountController.getAccountById);

//POST /accounts
router.post('/', accountController.createAccount);

//PUT /accounts/:id => Chỉ admin mới được quyền sửa
router.put('/:id', accountController.updateAccount4Admin);

//DELETE /accounts/:id  => Chỉ đặt trạng thái INACTIVE
router.delete('/:id', accountController.deleteAccount);

//POST /accounts/reset-password/:id => Chỉ admin mới được quyền reset
router.post('/reset-password/:id', accountController.resetPassword4Admin);

//POST /accounts/change-password => Người dùng tự đổi mật khẩu
router.post('/change-password', accountController.changePassword);

module.exports = router;
