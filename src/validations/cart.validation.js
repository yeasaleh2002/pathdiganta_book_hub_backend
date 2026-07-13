const { z } = require('zod');

const addToCartSchema = z.object({
    body: z.object({
        bookId: z.string({ required_error: 'bookId is required' }).uuid('Invalid bookId'),
        quantity: z.number().int().min(1, 'Quantity must be at least 1').default(1),
    }),
});

const updateCartItemSchema = z.object({
    body: z.object({
        quantity: z.number().int().min(1, 'Quantity must be at least 1'),
    }),
});

module.exports = { addToCartSchema, updateCartItemSchema };
