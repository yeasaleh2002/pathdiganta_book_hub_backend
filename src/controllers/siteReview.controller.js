const siteReviewService = require('../services/siteReview.service');

const createSiteReview = async (req, res, next) => {
    try {
        const review = await siteReviewService.createSiteReview(req.user.id, req.body);
        res.status(201).json({
            success: true,
            message: 'Thank you for your review! It will appear publicly after approval.',
            review,
        });
    } catch (error) {
        next(error);
    }
};

const getApprovedSiteReviews = async (req, res, next) => {
    try {
        const reviews = await siteReviewService.getApprovedSiteReviews();
        res.status(200).json({ success: true, reviews });
    } catch (error) {
        next(error);
    }
};

const getPendingSiteReviews = async (req, res, next) => {
    try {
        const reviews = await siteReviewService.getPendingSiteReviews();
        res.status(200).json({ success: true, reviews });
    } catch (error) {
        next(error);
    }
};

const updateSiteReviewStatus = async (req, res, next) => {
    try {
        const { isApproved } = req.body;
        const review = await siteReviewService.updateSiteReviewStatus(req.params.id, isApproved);
        res.status(200).json({ success: true, review });
    } catch (error) {
        next(error);
    }
};

module.exports = {
    createSiteReview,
    getApprovedSiteReviews,
    getPendingSiteReviews,
    updateSiteReviewStatus,
};
