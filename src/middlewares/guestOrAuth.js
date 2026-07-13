const { verifyToken } = require('../utils/jwt.utils');
const prisma = require('../prisma');

const optionalAuth = async (req, res, next) => {
    try {
        let token;
        
        if (req.cookies && req.cookies.token) {
            token = req.cookies.token;
        } else if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
            token = req.headers.authorization.split(' ')[1];
        }

        if (token) {
            const decoded = verifyToken(token);
            const user = await prisma.user.findUnique({
                where: { id: decoded.id },
                select: { id: true, role: true, isBlacklisted: true }
            });
            if (user && !user.isBlacklisted) {
                req.user = user;
            }
        }
        
        req.sessionId = req.headers['x-session-id'] || null;

        if (!req.user && !req.sessionId) {
            return res.status(400).json({ 
                success: false, 
                message: 'Must provide either an auth token or an x-session-id header for guest access.' 
            });
        }

        next();
    } catch (error) {
        // Fallback for invalid tokens in guest mode
        req.sessionId = req.headers['x-session-id'] || null;
        if (!req.sessionId) {
            return res.status(401).json({ success: false, message: 'Invalid token and no session ID provided.' });
        }
        next();
    }
};

module.exports = { optionalAuth };
