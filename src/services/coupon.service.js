const prisma = require('../prisma');

const getLatestActiveCoupon = async () => {
    return await prisma.coupon.findFirst({
        where: {
            validUntil: {
                gt: new Date()
            }
        },
        orderBy: {
            validUntil: 'desc'
        }
    });
};

const validateCoupon = async (code, subtotal) => {
    const coupon = await prisma.coupon.findUnique({
        where: { code: code.toUpperCase() }
    });

    if (!coupon) return { valid: false, message: 'Invalid coupon code' };
    if (new Date() > coupon.validUntil) return { valid: false, message: 'Coupon has expired' };
    if (coupon.minSpend && subtotal < Number(coupon.minSpend)) return { valid: false, message: `Minimum spend of ৳${coupon.minSpend} required` };

    let discount = 0;
    if (coupon.type === 'PERCENTAGE') {
        discount = subtotal * (Number(coupon.value) / 100);
    } else if (coupon.type === 'FIXED') {
        discount = Number(coupon.value);
    }

    return { valid: true, discount, coupon };
};

module.exports = { getLatestActiveCoupon, validateCoupon };
