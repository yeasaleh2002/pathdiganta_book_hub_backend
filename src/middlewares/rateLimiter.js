const rateLimit = require('express-rate-limit');

const globalLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 1000, // Limit each IP to 1000 requests per windowMs
    message: { success: false, message: 'Too many requests from this IP, please try again after 15 minutes' },
    standardHeaders: true,
    legacyHeaders: false,
});

const authLimiter = rateLimit({
    windowMs: 60 * 60 * 1000, // 1 hour
    max: 20, // Limit each IP to 20 auth requests per hour
    message: { success: false, message: 'Too many authentication attempts, please try again after an hour' },
    standardHeaders: true,
    legacyHeaders: false,
});

module.exports = {
    globalLimiter,
    authLimiter,
};
