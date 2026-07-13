const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const compression = require('compression');
const cookieParser = require('cookie-parser');
const rateLimit = require('express-rate-limit');
const morgan = require('morgan');
const logger = require('./utils/logger.utils');
const routes = require('./routes');
const errorHandler = require('./middlewares/errorHandler');

const app = express();

app.use(helmet());
app.use(cors({ origin: process.env.CLIENT_URL, credentials: true }));
app.use(compression());
app.use(express.json({ limit: '1mb' }));
app.use(express.urlencoded({ extended: true, limit: '1mb' }));
app.use(cookieParser());

// HTTP Traffic Logging directed into Winston streams
app.use(morgan('combined', { stream: { write: message => logger.info(message.trim()) } }));

const globalLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 1000, // Generous browsing limit per IP (prevents complete shutdown from single bot)
    message: 'Too many requests from this IP, please try again later.'
});
app.use('/api', globalLimiter);

app.use('/api/v1', routes);

app.use(errorHandler);

module.exports = app;
