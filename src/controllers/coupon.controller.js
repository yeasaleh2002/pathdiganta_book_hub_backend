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

module.exports = { getLatestCoupon };
