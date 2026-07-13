const { z } = require('zod');

const registerSchema = z.object({
    body: z.object({
        name: z.string({ required_error: 'Name is required' }).min(2, 'Name must be at least 2 characters'),
        email: z.string({ required_error: 'Email is required' }).email('Invalid email format'),
        password: z.string({ required_error: 'Password is required' }).min(6, 'Password must be at least 6 characters'),
    }),
});

const verifyRegistrationSchema = z.object({
    body: z.object({
        email: z.string({ required_error: 'Email is required' }).email('Invalid email format'),
        otp: z.string({ required_error: 'OTP is required' }).length(6, 'OTP must be exactly 6 digits'),
    }),
});

const loginSchema = z.object({
    body: z.object({
        email: z.string({ required_error: 'Email is required' }).email('Invalid email format'),
        password: z.string({ required_error: 'Password is required' }).min(6, 'Password must be at least 6 characters'),
    }),
});

const googleAuthSchema = z.object({
    body: z.object({
        idToken: z.string({ required_error: 'Google ID token is required' }),
    }),
});

module.exports = {
    registerSchema,
    verifyRegistrationSchema,
    loginSchema,
    googleAuthSchema,
};
