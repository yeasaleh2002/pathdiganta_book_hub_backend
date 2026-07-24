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

module.exports = { getLatestActiveCoupon };
