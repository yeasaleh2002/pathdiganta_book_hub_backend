const { z } = require('zod');

const createReviewSchema = z.object({
    body: z.object({
        bookId: z.string().uuid(),
        rating: z.number().int().min(1).max(5),
        reviewText: z.string().optional(),
    }),
});

const updateReviewStatusSchema = z.object({
    body: z.object({
        isApproved: z.boolean(),
    }),
});

module.exports = { createReviewSchema, updateReviewStatusSchema };
