const prisma = require('../prisma');

/**
 * Submit a site review. Any authenticated user can review the site.
 * Reviews require admin approval before appearing publicly.
 */
const createSiteReview = async (userId, data) => {
    const { rating, reviewText } = data;

    // Prevent duplicate site reviews from the same user
    const existing = await prisma.siteReview.findFirst({ where: { userId } });
    if (existing) {
        throw { statusCode: 400, message: 'You have already submitted a site review. Thank you for your feedback!' };
    }

    let pointsAwarded = 500;
    if (rating === 5) pointsAwarded = 1500;
    else if (rating === 4) pointsAwarded = 1000;

    return prisma.$transaction(async (tx) => {
        const review = await tx.siteReview.create({
            data: {
                userId,
                rating,
                reviewText,
                isApproved: false, // Pending admin moderation
            },
            include: {
                user: { select: { name: true } },
            },
        });

        await tx.user.update({
            where: { id: userId },
            data: { loyaltyPoints: { increment: pointsAwarded } }
        });

        return review;
    });
};

/**
 * Public: return all approved site reviews, newest first.
 */
const getApprovedSiteReviews = async () => {
    return prisma.siteReview.findMany({
        where: { isApproved: true },
        include: { user: { select: { name: true } } },
        orderBy: { createdAt: 'desc' },
    });
};

/**
 * Admin: list all pending (unapproved) site reviews.
 */
const getPendingSiteReviews = async () => {
    return prisma.siteReview.findMany({
        where: { isApproved: false },
        include: { user: { select: { id: true, name: true, email: true } } },
        orderBy: { createdAt: 'asc' },
    });
};

/**
 * Admin: approve or reject a site review by ID.
 */
const updateSiteReviewStatus = async (reviewId, isApproved) => {
    const review = await prisma.siteReview.findUnique({ where: { id: reviewId } });
    if (!review) {
        throw { statusCode: 404, message: 'Site review not found' };
    }
    return prisma.siteReview.update({
        where: { id: reviewId },
        data: { isApproved },
    });
};

module.exports = {
    createSiteReview,
    getApprovedSiteReviews,
    getPendingSiteReviews,
    updateSiteReviewStatus,
};
