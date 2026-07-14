const { z } = require('zod');

const bookSchema = z.object({
    body: z.object({
        title: z.string().min(2, 'Title is required'),
        categoryId: z.string().uuid(),
        authorId: z.string().uuid(),
        publisherId: z.string().uuid(),
        description: z.string().optional(),
        insidePreview: z.string().url().optional().or(z.literal('')),
        isbn: z.string().min(10, 'ISBN is required'),
        pages: z.number().int().optional(),
        edition: z.string().optional(),
        language: z.string().optional(),
        weight: z.number().optional(),
        price: z.number().min(0, 'Price must be positive'),
        discountPercent: z.number().int().min(0).max(100).default(0),
        stock: z.number().int().min(0).default(0),
        deliveryTime: z.string().optional(),
        isActive: z.boolean().default(true),
        imageUrls: z.array(z.string().url()).min(1, 'At least one image is required'),
    }),
});

const updateBookSchema = z.object({
    body: bookSchema.shape.body.partial(),
});

const categorySchema = z.object({
    body: z.object({
        name: z.string().min(2),
        slug: z.string().min(2),
    }),
});

const authorSchema = z.object({
    body: z.object({
        name: z.string().min(2),
        bio: z.string().optional(),
    }),
});

const publisherSchema = z.object({
    body: z.object({
        name: z.string().min(2),
        details: z.string().optional(),
    }),
});

const comboSchema = z.object({
    body: z.object({
        title: z.string().min(2),
        price: z.number().min(0),
        isActive: z.boolean().default(true),
        imageUrls: z.array(z.string().url()).default([]),
        bookIds: z.array(z.string().uuid()).min(2, 'A combo needs at least 2 books'),
    }),
});

const couponSchema = z.object({
    body: z.object({
        code: z.string().min(2, 'Code is required'),
        type: z.enum(['PERCENTAGE', 'FIXED', 'FREE_DELIVERY']),
        value: z.number().min(0, 'Value must be positive'),
        minSpend: z.number().min(0).optional(),
        validUntil: z.string().datetime()
    }),
});

module.exports = {
    bookSchema,
    updateBookSchema,
    categorySchema,
    authorSchema,
    publisherSchema,
    comboSchema,
    couponSchema,
};
