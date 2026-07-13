require('dotenv').config();
const app = require('./app');

const PORT = process.env.PORT || 5000;

const server = app.listen(PORT, () => {
    console.log(`Server listening on port ${PORT} in ${process.env.NODE_ENV || 'development'} mode`);
});

const logger = require('./utils/logger.utils');

process.on('uncaughtException', (err) => {
    logger.error(`UNCAUGHT EXCEPTION: ${err.message} - ${err.stack}`);
    process.exit(1);
});

// Handle unhandled promise rejections
process.on('unhandledRejection', (err) => {
    logger.error(`UNHANDLED REJECTION: ${err.message} - ${err.stack}`);
    // Close server & exit process gracefully
    server.close(() => process.exit(1));
});
