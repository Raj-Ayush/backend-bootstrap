const jwt = require('jsonwebtoken');
const config = require('../../config/config');

/**
 * Generate an access token for a user.
 * @param {Object} user - The user object.
 * @returns {string} - The generated access token.
 */

const generateAccessToken = user => jwt.sign({id: user.id, email: user.email, sessionId: user.sessionId}, config.authentication.jwt_token_secret_key, {
    expiresIn: config.authentication.jwt_token_expiration,
});

/**
 * Generate a refresh token for a user.
 * @param {Object} user - The user object.
 * @returns {string} - The generated refresh token.
 */

const generateRefreshToken = user => jwt.sign({id: user.id, email: user.email, sessionId: user.sessionId}, config.authentication.refresh_token_secret_key, {
    expiresIn: config.authentication.refresh_token_expiration,
});

const verifyToken = (token, secret) => jwt.verify(token, secret);

module.exports = {
    generateAccessToken,
    generateRefreshToken,
    verifyToken,
};
