const express = require('express');
const router = express.Router();
const cartController = require('../controllers/cart.controller');
const validateRequest = require('../middlewares/validateRequest');
const { addToCartSchema, updateCartItemSchema } = require('../validations/cart.validation');
const { optionalAuth } = require('../middlewares/guestOrAuth');

// Uses the new optionalAuth middleware to seamlessly merge Guest carts via x-session-id or User carts via JWT
router.use(optionalAuth);

router.get('/', cartController.getCart);
router.post('/add', validateRequest(addToCartSchema), cartController.addToCart);
router.put('/update/:itemId', validateRequest(updateCartItemSchema), cartController.updateCartItem);
router.delete('/remove/:itemId', cartController.removeCartItem);

module.exports = router;
