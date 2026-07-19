const { z } = require('zod');

const updateUserSchema = z.object({
    body: z.object({
        name: z.string().min(2, 'Name must be at least 2 characters').optional(),
        phone: z.string().optional(),
    }),
});

const createAddressSchema = z.object({
    body: z.object({
        title: z.string().optional(),
        phone: z.string().min(10, 'Phone number is required'),
        addressLine: z.string().min(3, 'Address line is required'),
        isInsideDhaka: z.boolean().default(true),
        district: z.string().optional(),
        thana: z.string().optional(),
        isDefault: z.boolean().optional(),
    }).refine((data) => {
        if (!data.isInsideDhaka) {
            return !!data.district && !!data.thana;
        }
        return true;
    }, {
        message: "District and Thana are required when outside Dhaka",
        path: ["district"], // Attach error to district
    }),
});

const updateAddressSchema = z.object({
    body: z.object({
        title: z.string().optional(),
        phone: z.string().min(10).optional(),
        addressLine: z.string().min(3).optional(),
        isInsideDhaka: z.boolean().optional(),
        district: z.string().optional(),
        thana: z.string().optional(),
        isDefault: z.boolean().optional(),
    }).refine((data) => {
        if (data.isInsideDhaka === false) {
            return !!data.district && !!data.thana;
        }
        return true;
    }, {
        message: "District and Thana are required when outside Dhaka",
        path: ["district"],
    }),
});

module.exports = { updateUserSchema, createAddressSchema, updateAddressSchema };
