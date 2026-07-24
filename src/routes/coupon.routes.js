const express = require('express');
const { getLatestCoupon, validateCoupon } = require('../controllers/coupon.controller');

const router = express.Router();

router.get('/latest', getLatestCoupon);
router.post('/validate', validateCoupon);

module.exports = router;
