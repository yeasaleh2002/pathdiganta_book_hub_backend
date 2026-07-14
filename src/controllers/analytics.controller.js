const analyticsService = require('../services/analytics.service');

const getDashboard = async (req, res, next) => {
    try {
        const stats = await analyticsService.getDashboardStats();
        res.status(200).json({ success: true, stats });
    } catch (error) {
        next(error);
    }
};
const getTopSellingBooks = async (req, res, next) => {
    try {
        const topBooks = await analyticsService.getTopSellingBooks();
        res.status(200).json({ success: true, topBooks });
    } catch (error) {
        next(error);
    }
};

module.exports = { getDashboard, getTopSellingBooks };
