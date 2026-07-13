const prisma = require('../prisma');
const bcrypt = require('bcryptjs');
const { generateToken } = require('../utils/jwt.utils');
const { sendEmail } = require('../utils/email.utils');
const { OAuth2Client } = require('google-auth-library');

const googleClient = new OAuth2Client(process.env.GOOGLE_CLIENT_ID || 'mock_client_id');

const register = async (name, email, password) => {
    // Check if user already exists
    let user = await prisma.user.findUnique({ where: { email } });

    if (user) {
        if (user.isVerified) {
            throw { statusCode: 400, message: 'Email is already registered and verified. Please login.' };
        }
        // If unverified, we just update their name/password and resend OTP
        const hashedPassword = await bcrypt.hash(password, 10);
        user = await prisma.user.update({
            where: { email },
            data: { name, password: hashedPassword }
        });
    } else {
        const hashedPassword = await bcrypt.hash(password, 10);
        user = await prisma.user.create({
            data: {
                name,
                email,
                password: hashedPassword,
                isVerified: false,
                role: 'CUSTOMER'
            }
        });
    }

    // Generate a secure 6 digit OTP
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10 mins

    await prisma.otpCode.upsert({
        where: { email },
        update: { otp, expiresAt },
        create: { email, otp, expiresAt }
    });

    await sendEmail(
        email,
        'Pathdigonto Book Hub - Verify your email',
        `<h1>Welcome ${name}!</h1><p>Your OTP to verify your registration is <b>${otp}</b></p><p>It is valid for 10 minutes.</p>`
    );

    // Explicitly hide password
    user.password = undefined;

    return { message: 'Registration successful. Please check your email for the OTP.', user };
};

const verifyRegistration = async (email, otp) => {
    const otpRecord = await prisma.otpCode.findUnique({ where: { email } });

    if (!otpRecord) {
        throw { statusCode: 400, message: 'No OTP found. Please register or request a new one.' };
    }

    if (new Date() > otpRecord.expiresAt) {
        await prisma.otpCode.delete({ where: { email } });
        throw { statusCode: 400, message: 'OTP has expired. Please request a new one.' };
    }

    if (otpRecord.otp !== otp) {
        throw { statusCode: 400, message: 'Invalid OTP.' };
    }

    // Mark user as verified
    const user = await prisma.user.update({
        where: { email },
        data: { isVerified: true }
    });

    if (user.isBlacklisted) {
        throw { statusCode: 403, message: 'Your account has been blacklisted.' };
    }

    // Delete OTP record securely
    await prisma.otpCode.delete({ where: { email } });

    // Login user automatically after verification
    const token = generateToken({ id: user.id, role: user.role });
    user.password = undefined; // Don't return hash

    return { message: 'Email verified successfully.', user, token };
};

const login = async (email, password) => {
    const user = await prisma.user.findUnique({ where: { email } });

    if (!user) {
        throw { statusCode: 401, message: 'Invalid email or password' };
    }

    if (!user.isVerified && !user.googleId) {
        throw { statusCode: 403, message: 'Please verify your email first.' };
    }

    if (user.isBlacklisted) {
        throw { statusCode: 403, message: 'Your account has been blacklisted.' };
    }

    if (!user.password) {
        throw { statusCode: 401, message: 'Please login with Google to access this account.' };
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
        throw { statusCode: 401, message: 'Invalid email or password' };
    }

    const token = generateToken({ id: user.id, role: user.role });
    user.password = undefined; // Hide hash

    return { user, token };
};

const verifyGoogleSSO = async (idToken) => {
    let payload;
    
    // In dev mode without a real token, mock payload.
    if (process.env.NODE_ENV === 'development' && idToken.startsWith('mock_')) {
        payload = {
            email: 'test@gmail.com',
            name: 'Google Test User',
            sub: 'mock_google_id_123'
        };
    } else {
        const ticket = await googleClient.verifyIdToken({
            idToken,
            audience: process.env.GOOGLE_CLIENT_ID,
        });
        payload = ticket.getPayload();
    }
    
    const { email, name, sub: googleId } = payload;

    let user = await prisma.user.findUnique({ where: { email } });
    
    if (!user) {
        user = await prisma.user.create({
            data: {
                email,
                name,
                googleId,
                role: 'CUSTOMER',
                isVerified: true // Google accounts are inherently verified
            },
        });
    } else if (!user.googleId) {
        user = await prisma.user.update({
            where: { email },
            data: { googleId, isVerified: true }, // Ensure verified if logging in via Google
        });
    }

    if (user.isBlacklisted) {
        throw { statusCode: 403, message: 'Your account has been blacklisted.' };
    }

    const token = generateToken({ id: user.id, role: user.role });
    user.password = undefined; // Hide hash if it existed

    return { user, token };
};

module.exports = {
    register,
    verifyRegistration,
    login,
    verifyGoogleSSO,
};
