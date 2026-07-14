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

    // Active orders calculation
    const activeOrders = await prisma.order.count({
        where: {
            orderStatus: {
                notIn: ['DELIVERED', 'CANCELLED', 'RETURNED']
            }
        }
    });

    return {
        todaysSales: todaysSales._sum.grandTotal || 0,
        monthlySales: monthlySales._sum.grandTotal || 0,
        totalRevenue: totalRevenue._sum.grandTotal || 0,
        abandonedCarts,
        uniqueVisitors: 12405, // Mocked as requested
        conversionRate: 3.8,   // Mocked as requested
        cartAbandonmentRate: 64.2, // Mocked as requested
        activeOrders
    };
};

const getTopSellingBooks = async () => {
    // Group by bookId and sum quantity from order items
    const topItems = await prisma.orderItem.groupBy({
        by: ['bookId'],
        _sum: {
            quantity: true
        },
        where: {
            bookId: { not: null }
        },
        orderBy: {
            _sum: {
                quantity: 'desc'
            }
        },
        take: 10
    });

    const bookIds = topItems.map(item => item.bookId);

    // Fetch the actual book details
    const books = await prisma.book.findMany({
        where: {
            id: { in: bookIds }
        },
        select: {
            id: true,
            title: true,
            price: true,
            imageUrls: true
        }
    });

    // Map the quantities back and sort
    const topBooks = books.map(book => {
        const item = topItems.find(i => i.bookId === book.id);
        return {
            ...book,
            totalSold: item._sum.quantity
        };
    }).sort((a, b) => b.totalSold - a.totalSold);

    return topBooks;
};

module.exports = { getDashboardStats, getTopSellingBooks };
