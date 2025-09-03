const express = require('express');
const accountController = require('../controllers/account.controller');
const router = express.Router();

//GET /accounts?page=&pageSize=
router.get('/', accountController.getAllAccounts);
router.get('/:id', accountController.getAccountById);
router.post('/', accountController.createAccount);
router.put('/:id', accountController.updateAccount);
router.delete('/:id', accountController.deleteAccount);
router.post('/change-password', accountController.changePassword);

module.exports = router;
