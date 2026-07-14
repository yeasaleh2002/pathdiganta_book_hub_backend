const express = require('express');
const router = express.Router();
const siteReviewController = require('../controllers/siteReview.controller');
const validateRequest = require('../middlewares/validateRequest');
const { createSiteReviewSchema } = require('../validations/siteReview.validation');
const { isAuthenticated } = require('../middlewares/authMiddleware');

// Public: get all approved site reviews (for testimonials section on homepage)
router.get('/', siteReviewController.getApprovedSiteReviews);

// Auth required: submit a site review
router.post('/', isAuthenticated, validateRequest(createSiteReviewSchema), siteReviewController.createSiteReview);

module.exports = router;
