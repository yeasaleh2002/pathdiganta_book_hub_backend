const logger = require('../utils/logger.utils');

const errorHandler = (err, req, res, next) => {
    // Pipe stack traces and failure contexts safely into Winston's error.log
    logger.error(`${err.statusCode || 500} - ${err.message} - ${req.originalUrl} - ${req.method} - ${req.ip} - ${err.stack}`);

    let statusCode = err.statusCode || 500;
    let message = err.message || 'Internal Server Error';

    // Prisma exceptions formatter
    if (err.code === 'P2002') {
        statusCode = 409;
        message = `Duplicate field value entered`;
    } else if (err.code === 'P2025') {
        statusCode = 404;
        message = `Record not found`;
    }

    const isProduction = process.env.NODE_ENV === 'production';
    
    res.status(statusCode).json({
        success: false,
        message,
        // Never leak stacks to the client in production
        stack: isProduction ? undefined : err.stack
    });
};

module.exports = errorHandler;
