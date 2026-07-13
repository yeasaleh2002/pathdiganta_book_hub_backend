const prisma = require('../prisma');

const createReview = async (userId, data) => {
    const { bookId, rating, reviewText } = data;

    // Strict constraint: Verify user actually purchased and received the book
    const orderWithBook = await prisma.order.findFirst({
        where: {
            userId,
            orderStatus: 'DELIVERED',
            orderItems: {
                some: { bookId }
            }
        }
    });

    if (!orderWithBook) {
        throw { statusCode: 403, message: 'You can only review books you have purchased and successfully received.' };
    }

    const existingReview = await prisma.review.findFirst({
        where: { userId, bookId, orderId: orderWithBook.id }
    });

    if (existingReview) {
        throw { statusCode: 400, message: 'You have already reviewed this book for this order.' };
    }

    return prisma.review.create({
        data: {
            userId,
            bookId,
            orderId: orderWithBook.id,
            rating,
            reviewText,
            isApproved: false // Reviews require admin moderation to appear publicly
        }
    });
};

const getApprovedReviews = async (bookId) => {
    return prisma.review.findMany({
        where: { bookId, isApproved: true },
        include: { user: { select: { name: true } } },
        orderBy: { rating: 'desc' } // Best reviews first or newest first
    });
};

const updateReviewStatus = async (reviewId, isApproved) => {
    return prisma.review.update({
        where: { id: reviewId },
        data: { isApproved }
    });
};

module.exports = { createReview, getApprovedReviews, updateReviewStatus };
