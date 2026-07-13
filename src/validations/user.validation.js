const { z } = require('zod');

const updateUserSchema = z.object({
    body: z.object({
        name: z.string().min(2, 'Name must be at least 2 characters').optional(),
        phone: z.string().optional(),
    }),
});

const createAddressSchema = z.object({
    body: z.object({
        type: z.string().optional(),
        street: z.string().min(3, 'Street is required'),
        city: z.string().min(2, 'City is required'),
        phoneAlternate: z.string().optional(),
        isDefault: z.boolean().optional(),
    }),
});

const updateAddressSchema = z.object({
    body: z.object({
        type: z.string().optional(),
        street: z.string().min(3).optional(),
        city: z.string().min(2).optional(),
        phoneAlternate: z.string().optional(),
        isDefault: z.boolean().optional(),
    }),
});

module.exports = { updateUserSchema, createAddressSchema, updateAddressSchema };
