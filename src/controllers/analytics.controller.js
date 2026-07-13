const analyticsService = require('../services/analytics.service');

const getDashboard = async (req, res, next) => {
    try {
        const stats = await analyticsService.getDashboardStats();
        res.status(200).json({ success: true, stats });
    } catch (error) {
        next(error);
    }
};

module.exports = { getDashboard };
