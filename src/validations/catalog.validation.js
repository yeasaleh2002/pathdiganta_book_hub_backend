const { z } = require('zod');

const getBooksQuerySchema = z.object({
    query: z.object({
        page: z.string().regex(/^\d+$/).optional(),
        limit: z.string().regex(/^\d+$/).optional(),
        categoryId: z.string().uuid().optional(),
        authorId: z.string().uuid().optional(),
        publisherId: z.string().uuid().optional(),
        sortBy: z.enum(['price_asc', 'price_desc', 'newest', 'title_asc']).optional(),
    }),
});

const searchBooksQuerySchema = z.object({
    query: z.object({
        q: z.string().optional(),
        page: z.string().regex(/^\d+$/).optional(),
        limit: z.string().regex(/^\d+$/).optional(),
        categoryId: z.string().uuid().optional(),
        authorId: z.string().uuid().optional(),
        publisherId: z.string().uuid().optional(),
        sortBy: z.enum(['price_asc', 'price_desc', 'newest', 'title_asc']).optional(),
    }),
});

module.exports = { getBooksQuerySchema, searchBooksQuerySchema };
