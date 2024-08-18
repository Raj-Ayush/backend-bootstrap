/* eslint-disable new-cap */
const express = require('express');
const authRouter = require('./auth.route');
const usersRouter = require('./users.route');

const router = express.Router();

router.use('/auth', authRouter);
router.use('/users', usersRouter);

module.exports = router;
