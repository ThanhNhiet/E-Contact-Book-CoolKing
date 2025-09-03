const express = require('express');
const accountRoute = require('./account.route');
const authRoute = require('./auth.route');

const router = express.Router();

router.use('/accounts', accountRoute);
router.use('/public', authRoute);

module.exports = router;
