const rateLimit = require('express-rate-limit');
const config = require('../../config/config');

const limiter = rateLimit({
    windowMs: config.authentication.rate_limiting_window_min * 60 * 1000, // 15 minutes
    max: config.authentication.rate_limiting_max, // Limit each IP to 100 requests per `window` (here, per 15 minutes)
    message: 'Too many requests from this IP, please try again after 15 minutes.',
});

module.exports = limiter;
