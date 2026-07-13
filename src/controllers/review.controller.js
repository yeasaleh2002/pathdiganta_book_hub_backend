const reviewService = require('../services/review.service');

const createReview = async (req, res, next) => {
    try {
        const review = await reviewService.createReview(req.user.id, req.body);
        res.status(201).json({ success: true, message: 'Review submitted successfully and is pending approval.', review });
    } catch (error) {
        next(error);
    }
};

const getApprovedReviews = async (req, res, next) => {
    try {
        const reviews = await reviewService.getApprovedReviews(req.params.bookId);
        res.status(200).json({ success: true, reviews });
    } catch (error) {
        next(error);
    }
};

const updateReviewStatus = async (req, res, next) => {
    try {
        const { isApproved } = req.body;
        const review = await reviewService.updateReviewStatus(req.params.id, isApproved);
        res.status(200).json({ success: true, review });
    } catch (error) {
        next(error);
    }
};

module.exports = { createReview, getApprovedReviews, updateReviewStatus };
