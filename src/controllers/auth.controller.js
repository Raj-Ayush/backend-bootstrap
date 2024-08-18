const httpStatus = require('http-status');
const AuthService = require('../services/auth.service');
const ApiError = require('../features/error');
const refreshTokenCookiesStore = require('../utils/cookie.util');

class AuthController {
    /**
     * Sign up a new user.
     * @param {Object} req - Express request object.
     * @param {Object} res - Express response object.
     * @param {Function} next - Express next middleware function.
     */
    async signup(req, res, next) {
        try {
            const {email, password, firstName, lastName, dob} = req.body;
            const {accessToken, refreshToken, sessionId} = await AuthService.signup({email, password, firstName, lastName, dob, deviceInfo: req.deviceInfo, ipAddress: req.ipAddress});
            refreshTokenCookiesStore(res, refreshToken);
            res.status(httpStatus.CREATED).json({message: 'User created successfully', accessToken, sessionId});
        } catch (err) {
            next(err);
        }
    }

    /**
     * Log in an existing user.
     * @param {Object} req - Express request object.
     * @param {Object} res - Express response object.
     * @param {Function} next - Express next middleware function.
     */
    async login(req, res, next) {
        try {
            const {email, password} = req.body;
            const {deviceInfo, ipAddress} = req; // Assume deviceInfo is captured in middleware
            const tokens = await AuthService.login(email, password, deviceInfo, ipAddress);
            refreshTokenCookiesStore(res, tokens.refreshToken);
            res.status(httpStatus.OK).json({message: 'Login successful', accessToken: tokens.accessToken, sessionId: tokens.sessionId});
        } catch (err) {
            next(err);
        }
    }

    /**
     * Refresh an access token.
     * @param {Object} req - Express request object.
     * @param {Object} res - Express response object.
     * @param {Function} next - Express next middleware function.
     */
    async refresh(req, res, next) {
        try {
            const {refreshToken} = req.cookies;
            if (!refreshToken) {
                throw new ApiError(httpStatus.UNAUTHORIZED, 'Refresh token not provided');
            }

            const {deviceInfo, ipAddress} = req; // Assume deviceInfo is captured in middleware
            const newAccessToken = await AuthService.refresh(refreshToken, deviceInfo, ipAddress);
            res.status(httpStatus.OK).json({accessToken: newAccessToken});
        } catch (err) {
            next(err);
        }
    }

    /**
     * Log out a user.
     * @param {Object} req - Express request object.
     * @param {Object} res - Express response object.
     * @param {Function} next - Express next middleware function.
     */
    async logout(req, res, next) {
        try {
            const userId = req.user.id; // Assume the user is authenticated and the ID is available in req.user
            await AuthService.logout(userId);
            res.clearCookie('refreshToken');
            res.status(httpStatus.OK).json({message: 'Logout successful'});
        } catch (err) {
            next(err);
        }
    }
}

module.exports = new AuthController();
