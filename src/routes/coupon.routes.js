const express = require('express');
const { getLatestCoupon } = require('../controllers/coupon.controller');

const router = express.Router();

router.get('/latest', getLatestCoupon);

module.exports = router;
