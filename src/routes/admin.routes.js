const express = require('express');
const router = express.Router();
const adminController = require('../controllers/admin.controller');
const adminOrderController = require('../controllers/adminOrder.controller');
const analyticsController = require('../controllers/analytics.controller');
const reviewController = require('../controllers/review.controller');
const siteReviewController = require('../controllers/siteReview.controller');
const validateRequest = require('../middlewares/validateRequest');
const { isAuthenticated, isAdmin } = require('../middlewares/authMiddleware');
const { bookSchema, updateBookSchema, categorySchema, authorSchema, publisherSchema, comboSchema, couponSchema } = require('../validations/admin.validation');
const { updateOrderStatusSchema } = require('../validations/order.validation');
const { updateReviewStatusSchema } = require('../validations/review.validation');
const { updateSiteReviewStatusSchema } = require('../validations/siteReview.validation');

// Protect all admin routes securely
router.use(isAuthenticated, isAdmin);

// Books
router.post('/books', validateRequest(bookSchema), adminController.createBook);
router.put('/books/:id', validateRequest(updateBookSchema), adminController.updateBook);

// Categories
router.post('/categories', validateRequest(categorySchema), adminController.createCategory);
router.put('/categories/:id', validateRequest(categorySchema), adminController.updateCategory);
router.delete('/categories/:id', adminController.deleteCategory);

// Authors
router.post('/authors', validateRequest(authorSchema), adminController.createAuthor);
router.put('/authors/:id', validateRequest(authorSchema), adminController.updateAuthor);
router.delete('/authors/:id', adminController.deleteAuthor);

// Publishers
router.post('/publishers', validateRequest(publisherSchema), adminController.createPublisher);
router.put('/publishers/:id', validateRequest(publisherSchema), adminController.updatePublisher);
router.delete('/publishers/:id', adminController.deletePublisher);

// Combos
router.post('/combos', validateRequest(comboSchema), adminController.createCombo);
router.delete('/combos/:id', adminController.deleteCombo);

// Coupons
router.post('/coupons', validateRequest(couponSchema), adminController.createCoupon);
router.get('/coupons', adminController.getCoupons);
router.delete('/coupons/:id', adminController.deleteCoupon);

// Orders (Admin Management)
router.get('/orders', adminOrderController.getAdminOrders);
router.put('/orders/:id/status', validateRequest(updateOrderStatusSchema), adminOrderController.updateOrderStatus);

// Analytics
router.get('/analytics/dashboard', analyticsController.getDashboard);
router.get('/analytics/top-selling-books', analyticsController.getTopSellingBooks);

// Reviews (Admin Moderation — book reviews)
router.put('/reviews/:id/status', validateRequest(updateReviewStatusSchema), reviewController.updateReviewStatus);

// Site Reviews (Admin Moderation)
router.get('/site-reviews/pending', siteReviewController.getPendingSiteReviews);
router.put('/site-reviews/:id/status', validateRequest(updateSiteReviewStatusSchema), siteReviewController.updateSiteReviewStatus);

// Notifications
router.get('/notifications', adminController.getAdminNotifications);
router.put('/notifications/mark-all-read', adminController.markAllNotificationsAsRead);
router.put('/notifications/:id/read', adminController.markNotificationAsRead);

module.exports = router;
