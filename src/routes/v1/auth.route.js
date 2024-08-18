/* eslint-disable new-cap */

const express = require('express');
const router = express.Router();
const limiter = require('../../middlewares/rateLimiter.middleware');
const captureDeviceInfo = require('../../middlewares/device.middleware');
const authenticate = require('../../middlewares/auth.middleware');
const AuthController = require('../../controllers/auth.controller');

router.post('/signup', limiter, AuthController.signup);
router.post('/login', limiter, captureDeviceInfo, AuthController.login);
router.post('/refresh', captureDeviceInfo, AuthController.refresh);
router.post('/logout', authenticate, AuthController.logout);

module.exports = router;
