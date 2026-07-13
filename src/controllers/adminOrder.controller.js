const orderService = require('../services/order.service');

const getAdminOrders = async (req, res, next) => {
    try {
        const { page, limit } = req.query;
        const result = await orderService.getAdminOrders(page, limit);
        res.status(200).json({ success: true, ...result });
    } catch (error) {
        next(error);
    }
};

const updateOrderStatus = async (req, res, next) => {
    try {
        const { status, trackingLink } = req.body;
        const order = await orderService.updateOrderStatus(req.params.id, status, trackingLink);
        res.status(200).json({ success: true, order });
    } catch (error) {
        next(error);
    }
};

module.exports = { getAdminOrders, updateOrderStatus };
