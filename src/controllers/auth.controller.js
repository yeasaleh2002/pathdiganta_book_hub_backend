const authService = require('../services/auth.service');

const register = async (req, res, next) => {
    try {
        const { name, email, password } = req.body;
        const result = await authService.register(name, email, password);
        res.status(201).json({ success: true, ...result });
    } catch (error) {
        next(error);
    }
};

const verifyRegistration = async (req, res, next) => {
    try {
        const { email, otp } = req.body;
        const { message, user, token } = await authService.verifyRegistration(email, otp);
        
        // Login immediately
        res.cookie('token', token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'strict',
            maxAge: 7 * 24 * 60 * 60 * 1000,
        });

        res.status(200).json({ success: true, message, user, token });
    } catch (error) {
        next(error);
    }
};

const login = async (req, res, next) => {
    try {
        const { email, password } = req.body;
        const { user, token } = await authService.login(email, password);
        
        res.cookie('token', token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'strict',
            maxAge: 7 * 24 * 60 * 60 * 1000,
        });

        res.status(200).json({ success: true, user, token });
    } catch (error) {
        next(error);
    }
};

const googleLogin = async (req, res, next) => {
    try {
        const { idToken } = req.body;
        const { user, token } = await authService.verifyGoogleSSO(idToken);
        
        res.cookie('token', token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'strict',
            maxAge: 7 * 24 * 60 * 60 * 1000,
        });

        res.status(200).json({ success: true, user, token });
    } catch (error) {
        next(error);
    }
};

const logout = async (req, res, next) => {
    try {
        res.clearCookie('token');
        res.status(200).json({ success: true, message: 'Logged out successfully' });
    } catch (error) {
        next(error);
    }
};

module.exports = {
    register,
    verifyRegistration,
    login,
    googleLogin,
    logout,
};
