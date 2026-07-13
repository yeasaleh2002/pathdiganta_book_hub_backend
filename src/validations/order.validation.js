const { z } = require('zod');

const checkoutSchema = z.object({
    body: z.object({
        addressId: z.string().uuid(),
        couponCode: z.string().optional(),
        pointsUsed: z.number().int().min(0).default(0),
        paymentMethod: z.enum(['COD', 'BKASH', 'NAGAD', 'CARD'])
    }),
});

const updateOrderStatusSchema = z.object({
    body: z.object({
        status: z.enum(['NEW', 'CONFIRMED', 'PACKED', 'SHIPPED', 'DELIVERED', 'CANCELLED', 'RETURNED']),
        trackingLink: z.string().url().optional()
    })
});

module.exports = { checkoutSchema, updateOrderStatusSchema };
