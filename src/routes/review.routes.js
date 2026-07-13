const express = require('express');
const router = express.Router();
const reviewController = require('../controllers/review.controller');
const validateRequest = require('../middlewares/validateRequest');
const { createReviewSchema } = require('../validations/review.validation');
const { isAuthenticated } = require('../middlewares/authMiddleware');

router.get('/books/:bookId', reviewController.getApprovedReviews);
router.post('/', isAuthenticated, validateRequest(createReviewSchema), reviewController.createReview);

module.exports = router;
