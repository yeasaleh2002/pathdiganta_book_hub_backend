const { z } = require('zod');

const checkoutSchema = z.object({
    body: z.object({
        shippingAddress: z.string().uuid(),
        couponCode: z.string().optional(),
        pointsUsed: z.number().int().min(0).default(0),
        paymentMethod: z.enum(['COD', 'BKASH', 'NAGAD', 'CARD']),
        items: z.array(z.object({
            book: z.string().uuid(),
            quantity: z.number().int().min(1)
        })).min(1, 'Order must contain at least one item')
    }),
});

const updateOrderStatusSchema = z.object({
    body: z.object({
        status: z.preprocess(
            (val) => (typeof val === 'string' ? val.toUpperCase() : val),
            z.enum(['NEW', 'CONFIRMED', 'PACKED', 'SHIPPED', 'DELIVERED', 'CANCELLED', 'RETURNED'])
        ),
        trackingLink: z.string().url().optional()
    })
});

module.exports = { checkoutSchema, updateOrderStatusSchema };
