const express = require('express');
const router = express.Router();
const orderController = require('../controllers/order.controller');
const validateRequest = require('../middlewares/validateRequest');
const { checkoutSchema } = require('../validations/order.validation');
const { isAuthenticated } = require('../middlewares/authMiddleware');

router.use(isAuthenticated);

router.post('/checkout', validateRequest(checkoutSchema), orderController.checkout);
router.get('/my-orders', orderController.getMyOrders);
router.get('/:id', orderController.getOrderById);

module.exports = router;
