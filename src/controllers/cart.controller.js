const cartService = require('../services/cart.service');

const getCart = async (req, res, next) => {
    try {
        const userId = req.user ? req.user.id : null;
        const sessionId = req.sessionId;
        const cart = await cartService.getActiveCart(userId, sessionId);
        res.status(200).json({ success: true, cart });
    } catch (error) {
        next(error);
    }
};

const addToCart = async (req, res, next) => {
    try {
        const userId = req.user ? req.user.id : null;
        const sessionId = req.sessionId;
        const { bookId, quantity } = req.body;
        
        const cart = await cartService.addToCart(userId, sessionId, bookId, quantity);
        res.status(200).json({ success: true, cart });
    } catch (error) {
        next(error);
    }
};

const updateCartItem = async (req, res, next) => {
    try {
        const userId = req.user ? req.user.id : null;
        const sessionId = req.sessionId;
        const { quantity } = req.body;
        
        const cart = await cartService.updateCartItem(userId, sessionId, req.params.itemId, quantity);
        res.status(200).json({ success: true, cart });
    } catch (error) {
        next(error);
    }
};

const removeCartItem = async (req, res, next) => {
    try {
        const userId = req.user ? req.user.id : null;
        const sessionId = req.sessionId;
        
        const result = await cartService.removeCartItem(userId, sessionId, req.params.itemId);
        res.status(200).json({ success: true, ...result });
    } catch (error) {
        next(error);
    }
};

module.exports = { getCart, addToCart, updateCartItem, removeCartItem };
