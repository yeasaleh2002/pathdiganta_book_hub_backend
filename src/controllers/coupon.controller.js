const couponService = require('../services/coupon.service');

const getLatestCoupon = async (req, res, next) => {
    try {
        const coupon = await couponService.getLatestActiveCoupon();
        if (coupon) {
            res.status(200).json({ success: true, coupon });
        } else {
            res.status(200).json({ success: true, message: "No active coupon" });
        }
    } catch (error) {
        next(error);
    }
};

const validateCoupon = async (req, res, next) => {
    try {
        const { code, subtotal } = req.body;
        if (!code || !subtotal) {
            return res.status(400).json({ success: false, message: "Code and subtotal are required" });
        }
        
        const result = await couponService.validateCoupon(code, Number(subtotal));
        
        if (result.valid) {
            res.status(200).json({ success: true, discount: result.discount, coupon: result.coupon });
        } else {
            res.status(400).json({ success: false, message: result.message });
        }
    } catch (error) {
        next(error);
    }
};

module.exports = { getLatestCoupon, validateCoupon };
