const express = require('express');
const authRoutes = require('./auth.routes');
const userRoutes = require('./user.routes');
const addressRoutes = require('./address.routes');
const cartRoutes = require('./cart.routes');
const catalogRoutes = require('./catalog.routes');
const adminRoutes = require('./admin.routes');
const orderRoutes = require('./order.routes');
const reviewRoutes = require('./review.routes');
const siteReviewRoutes = require('./siteReview.routes');

const router = express.Router();

router.use('/', catalogRoutes); // Root level mounting for /books, /categories
router.use('/auth', authRoutes);
router.use('/users', userRoutes);
router.use('/addresses', addressRoutes);
router.use('/cart', cartRoutes);
router.use('/orders', orderRoutes);
router.use('/reviews', reviewRoutes);
router.use('/site-reviews', siteReviewRoutes);
router.use('/admin', adminRoutes);

module.exports = router;
