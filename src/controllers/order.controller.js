const orderService = require('../services/order.service');

const checkout = async (req, res, next) => {
    try {
        const order = await orderService.checkout(req.user.id, req.body);
        res.status(201).json({ success: true, order });
    } catch (error) {
        next(error);
    }
};

const getMyOrders = async (req, res, next) => {
    try {
        const orders = await orderService.getMyOrders(req.user.id);
        res.status(200).json({ success: true, orders });
    } catch (error) {
        next(error);
    }
};

const getOrderById = async (req, res, next) => {
    try {
        const result = await orderService.getOrderById(req.user.id, req.params.id);
        res.status(200).json({ success: true, ...result });
    } catch (error) {
        next(error);
    }
};

module.exports = { checkout, getMyOrders, getOrderById };
