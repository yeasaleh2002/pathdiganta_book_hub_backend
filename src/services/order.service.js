const prisma = require('../prisma');
const { generateInvoice } = require('../utils/invoice.utils');

const generateOrderNumber = () => {
    return 'ORD-' + Date.now().toString(36).toUpperCase() + Math.random().toString(36).substring(2, 6).toUpperCase();
};

const checkout = async (userId, data) => {
    const { addressId, couponCode, pointsUsed = 0, paymentMethod } = data;

    // Prisma Interactive Transaction logic to ensure race condition immunity.
    return await prisma.$transaction(async (tx) => {
        const user = await tx.user.findUnique({ where: { id: userId } });
        if (pointsUsed > user.loyaltyPoints) {
            throw { statusCode: 400, message: 'Insufficient loyalty points' };
        }

        const cart = await tx.cart.findFirst({
            where: { userId, status: 'ACTIVE' },
            include: { cartItems: { include: { book: true } } }
        });

        if (!cart || cart.cartItems.length === 0) {
            throw { statusCode: 400, message: 'Cart is empty or invalid' };
        }

        let subtotal = 0;
        for (const item of cart.cartItems) {
            if (!item.book.isActive) {
                throw { statusCode: 400, message: `Book ${item.book.title} is currently unavailable` };
            }
            if (item.book.stock < item.quantity) {
                throw { statusCode: 400, message: `Insufficient stock for ${item.book.title}` };
            }

            // Deduct Stock atomically
            await tx.book.update({
                where: { id: item.book.id },
                data: { stock: { decrement: item.quantity } }
            });

            const finalPrice = item.book.price * (1 - (item.book.discountPercent / 100));
            subtotal += finalPrice * item.quantity;
        }

        let coupon = null;
        let discount = 0;
        if (couponCode) {
            coupon = await tx.coupon.findUnique({ where: { code: couponCode } });
            if (!coupon) throw { statusCode: 400, message: 'Invalid coupon code' };
            if (new Date() > coupon.validUntil) throw { statusCode: 400, message: 'Coupon expired' };
            if (coupon.minSpend && subtotal < Number(coupon.minSpend)) {
                throw { statusCode: 400, message: `Minimum spend of ${coupon.minSpend} required` };
            }

            if (coupon.type === 'PERCENTAGE') {
                discount = subtotal * (Number(coupon.value) / 100);
            } else if (coupon.type === 'FIXED') {
                discount = Number(coupon.value);
            }
        }
        
        let grandTotal = subtotal - discount - pointsUsed;
        if (grandTotal < 0) grandTotal = 0;

        const order = await tx.order.create({
            data: {
                orderNumber: generateOrderNumber(),
                userId,
                addressId,
                subtotal,
                pointsUsed,
                couponId: coupon ? coupon.id : null,
                grandTotal,
                paymentMethod,
                paymentStatus: paymentMethod === 'COD' ? 'PENDING' : 'PENDING_GATEWAY',
                orderStatus: 'NEW',
                orderItems: {
                    create: cart.cartItems.map(item => ({
                        bookId: item.bookId,
                        quantity: item.quantity,
                        unitPrice: item.book.price * (1 - (item.book.discountPercent / 100)),
                    }))
                }
            },
            include: { orderItems: true }
        });

        if (pointsUsed > 0) {
            await tx.user.update({
                where: { id: userId },
                data: { loyaltyPoints: { decrement: pointsUsed } }
            });
        }

        await tx.cart.update({
            where: { id: cart.id },
            data: { status: 'CONVERTED' }
        });

        return order;
    });
};

const getMyOrders = async (userId) => {
    return prisma.order.findMany({
        where: { userId },
        include: { orderItems: { include: { book: { select: { title: true, imageUrls: true } } } } },
        orderBy: { createdAt: 'desc' }
    });
};

const getOrderById = async (userId, orderId) => {
    const order = await prisma.order.findFirst({
        where: { id: orderId, userId },
        include: { 
            orderItems: { include: { book: { select: { title: true, isbn: true } } } },
            address: true,
            user: { select: { name: true, email: true, phone: true } }
        }
    });

    if (!order) throw { statusCode: 404, message: 'Order not found' };

    const invoiceText = generateInvoice(order);
    return { order, invoiceText };
};

const getAdminOrders = async (page = 1, limit = 20) => {
    const takeLimit = Math.min(Number(limit), 100);
    const skip = (Number(page) - 1) * takeLimit;
    
    const [orders, total] = await Promise.all([
        prisma.order.findMany({
            skip,
            take: takeLimit,
            orderBy: { createdAt: 'desc' },
            include: { user: { select: { name: true, email: true } } }
        }),
        prisma.order.count()
    ]);
    
    return { orders, meta: { total, page: Number(page), totalPages: Math.ceil(total / takeLimit) } };
};

const updateOrderStatus = async (orderId, status, trackingLink) => {
    const order = await prisma.order.update({
        where: { id: orderId },
        data: { 
            orderStatus: status,
            ...(trackingLink && { trackingLink })
        },
        include: { user: { select: { email: true, name: true } } }
    });
    
    console.log(`--- MOCK ORDER NOTIFICATION ---`);
    console.log(`To: ${order.user.email}`);
    console.log(`Your order ${order.orderNumber} is now ${status}!`);
    if (trackingLink) console.log(`Track it here: ${trackingLink}`);
    console.log(`-------------------------------`);

    return order;
};

module.exports = { checkout, getMyOrders, getOrderById, getAdminOrders, updateOrderStatus };
