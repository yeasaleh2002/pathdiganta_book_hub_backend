const { verifyToken } = require('../utils/jwt.utils');
const prisma = require('../prisma');

const isAuthenticated = async (req, res, next) => {
    try {
        let token;
        
        if (req.cookies && req.cookies.token) {
            token = req.cookies.token;
        } else if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
            token = req.headers.authorization.split(' ')[1];
        }

        if (!token) {
            return res.status(401).json({ success: false, message: 'Not authenticated. Please log in.' });
        }

        const decoded = verifyToken(token);
        const user = await prisma.user.findUnique({
            where: { id: decoded.id },
            select: { id: true, role: true, isBlacklisted: true, email: true, name: true }
        });

        if (!user) {
            return res.status(401).json({ success: false, message: 'The user belonging to this token no longer exists.' });
        }
        
        if (user.isBlacklisted) {
            return res.status(403).json({ success: false, message: 'Your account has been blacklisted.' });
        }

        req.user = user;
        next();
    } catch (error) {
        return res.status(401).json({ success: false, message: 'Invalid or expired token. Please log in again.' });
    }
};

const isAdmin = (req, res, next) => {
    if (req.user && req.user.role === 'ADMIN') {
        next();
    } else {
        res.status(403).json({ success: false, message: 'Forbidden: Admin access required.' });
    }
};

module.exports = {
    isAuthenticated,
    isAdmin,
};
