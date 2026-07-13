const prisma = require('../prisma');

const getDashboardStats = async () => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const firstDayOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);

    // Sales calculations using highly optimized Prisma aggregates
    const [todaysSales, monthlySales, totalRevenue, abandonedCarts] = await Promise.all([
        prisma.order.aggregate({
            _sum: { grandTotal: true },
            where: { createdAt: { gte: today }, paymentStatus: { not: 'FAILED' } }
        }),
        prisma.order.aggregate({
            _sum: { grandTotal: true },
            where: { createdAt: { gte: firstDayOfMonth }, paymentStatus: { not: 'FAILED' } }
        }),
        prisma.order.aggregate({
            _sum: { grandTotal: true },
            where: { paymentStatus: { not: 'FAILED' } }
        }),
        // Carts untouched for 24+ hours
        prisma.cart.count({
            where: { 
                status: 'ACTIVE',
                updatedAt: { lt: new Date(Date.now() - 24 * 60 * 60 * 1000) } 
            }
        })
    ]);

    return {
        todaysSales: todaysSales._sum.grandTotal || 0,
        monthlySales: monthlySales._sum.grandTotal || 0,
        totalRevenue: totalRevenue._sum.grandTotal || 0,
        abandonedCarts
    };
};

module.exports = { getDashboardStats };
