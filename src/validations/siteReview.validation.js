const { z } = require('zod');

const createSiteReviewSchema = z.object({
    body: z.object({
        rating: z.number().int().min(1, 'Rating must be at least 1').max(5, 'Rating cannot exceed 5'),
        reviewText: z.string().min(10, 'Review must be at least 10 characters').max(1000, 'Review cannot exceed 1000 characters').optional(),
    }),
});

const updateSiteReviewStatusSchema = z.object({
    body: z.object({
        isApproved: z.boolean(),
    }),
});

module.exports = { createSiteReviewSchema, updateSiteReviewStatusSchema };
