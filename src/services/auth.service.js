const httpStatus = require('http-status');
const jwt = require('jsonwebtoken');
const User = require('../models/user.model');
const Session = require('../models/session.model');
const {ApiError} = require('../features/error'); // Correct import
const logger = require('../features/logger');
const config = require('../../config/config');
const {v4: uuidv4} = require('uuid');

const {hashPassword, comparePassword} = require('../utils/security.util');
const {generateAccessToken, generateRefreshToken} = require('../utils/jwt.util');

class AuthService {
    async signup({email, password, firstName, lastName, dob, deviceInfo, ipAddress}) {
        try {
            const existingUser = await User.findOne({where: {email}});
            if (existingUser) {
                throw new ApiError(httpStatus.CONFLICT, 'Email already in use');
            }

            const hashedPassword = await hashPassword(password);
            const user = await User.create({email, password: hashedPassword, firstName, lastName, dob});
            logger.info(`User created with email: ${email}`);

            const refreshToken = generateRefreshToken(user);

            // Create a session ID and save the session
            const sessionId = uuidv4(); // Create a unique session ID
            const sessionDuration = config.session.maxDuration || 3600; // In seconds, default to 1 hour
            const expiresAt = new Date(Date.now() + (sessionDuration * 1000));

            await Session.create({
                id: sessionId, // Save the session ID
                userId: user.id,
                deviceInfo,
                ipAddress,
                isActive: true,
                expiresAt,
            });

            // Include sessionId in the JWT payload
            const accessTokenWithSession = generateAccessToken({...user.toJSON(), sessionId});

            user.refreshToken = refreshToken;
            await user.save();

            return {accessToken: accessTokenWithSession, refreshToken, sessionId};
        } catch (err) {
            logger.error('Error during user signup:', err.message);
            throw new ApiError(httpStatus.INTERNAL_SERVER_ERROR, err.message);
        }
    }

    async login(email, password, deviceInfo, ipAddress) {
        try {
            const user = await User.findOne({where: {email}});
            if (!user) {
                throw new ApiError(httpStatus.UNAUTHORIZED, 'Invalid email or password');
            }

            if (!user.isActive) {
                throw new ApiError(httpStatus.UNAUTHORIZED, 'Account is inactive');
            }

            const isPasswordValid = await comparePassword(password, user.password);
            if (!isPasswordValid) {
                throw new ApiError(httpStatus.UNAUTHORIZED, 'Invalid email or password');
            }

            const activeSessions = await Session.count({where: {userId: user.id, isActive: true}});
            const maxDevices = config.session.maxDevices || 3;

            if (activeSessions >= maxDevices) {
                throw new ApiError(httpStatus.FORBIDDEN, 'Maximum number of devices logged in');
            }

            const sessionId = uuidv4();
            const sessionDuration = config.session.maxDuration || 3600;
            const expiresAt = new Date(Date.now() + (sessionDuration * 1000));

            await Session.create({
                id: sessionId,
                userId: user.id,
                deviceInfo,
                ipAddress,
                isActive: true,
                expiresAt,
            });

            const accessTokenWithSession = generateAccessToken({...user.toJSON(), sessionId});
            const refreshToken = generateRefreshToken({...user.toJSON(), sessionId});

            user.refreshToken = refreshToken;
            await user.save();

            return {accessToken: accessTokenWithSession, refreshToken, sessionId};
        } catch (err) {
            logger.error('Error during user login:', err);
            throw new ApiError(httpStatus.INTERNAL_SERVER_ERROR, 'Failed to log in');
        }
    }

    async refresh(refreshToken, deviceInfo, ipAddress) {
        try {
            const decoded = jwt.verify(refreshToken, config.authentication.refresh_token_secret_key);
            const user = await User.findOne({where: {id: decoded.id, refreshToken, isActive: true}});
            if (!user) {
                throw new ApiError(httpStatus.UNAUTHORIZED, 'Invalid refresh token');
            }

            // Verify if the session is still active
            const session = await Session.findOne({where: {id: decoded.sessionId, isActive: true}});
            if (!session) {
                throw new ApiError(httpStatus.UNAUTHORIZED, 'Session expired or invalid');
            }

            const accessTokenWithSession = generateAccessToken({...user.toJSON(), sessionId: decoded.sessionId});

            logger.info(`User refreshed token from IP: ${ipAddress}, Device: ${deviceInfo}`);

            return {accessToken: accessTokenWithSession};
        } catch (err) {
            if (err instanceof jwt.TokenExpiredError) {
                logger.warn('Refresh token expired:', err.message);
                throw new ApiError(httpStatus.UNAUTHORIZED, 'Refresh token expired');
            } else if (err instanceof jwt.JsonWebTokenError) {
                logger.warn('Invalid refresh token:', err.message);
                throw new ApiError(httpStatus.UNAUTHORIZED, 'Invalid refresh token');
            }

            logger.error('Error during token refresh:', err.message);
            throw new ApiError(httpStatus.INTERNAL_SERVER_ERROR, 'Failed to refresh token');
        }
    }

    async logout(userId) {
        try {
            const user = await User.findByPk(userId);
            if (!user) {
                throw new ApiError(httpStatus.NOT_FOUND, 'User not found');
            }

            user.refreshToken = null;
            await user.save();

            await Session.update({isActive: false}, {where: {userId}});
            logger.info(`User with ID ${userId} logged out successfully`);
        } catch (err) {
            logger.error('Error during user logout:', err.message);
            throw new ApiError(httpStatus.INTERNAL_SERVER_ERROR, 'Failed to log out');
        }
    }
}

module.exports = new AuthService();
