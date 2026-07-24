const prisma = require('../prisma');
const { generateInvoice } = require('../utils/invoice.utils');

const generateOrderNumber = () => {
    return 'ORD-' + Date.now().toString(36).toUpperCase() + Math.random().toString(36).substring(2, 6).toUpperCase();
};

const checkout = async (userId, data) => {
    const { shippingAddress, couponCode, pointsUsed = 0, paymentMethod, items } = data;

    // Prisma Interactive Transaction logic to ensure race condition immunity.
    return await prisma.$transaction(async (tx) => {
        const user = await tx.user.findUnique({ where: { id: userId } });
        if (pointsUsed > user.loyaltyPoints) {
            throw { statusCode: 400, message: 'Insufficient loyalty points' };
        }

        if (!items || items.length === 0) {
            throw { statusCode: 400, message: 'Order items are empty' };
        }

        let subtotal = 0;
        const processedItems = [];

        for (const item of items) {
            const bookRecord = await tx.book.findUnique({ where: { id: item.book } });
            if (!bookRecord) {
                throw { statusCode: 404, message: `Book not found` };
            }
            if (!bookRecord.isActive) {
                throw { statusCode: 400, message: `Book ${bookRecord.title} is currently unavailable` };
            }
            if (bookRecord.stock < item.quantity) {
                throw { statusCode: 400, message: `Insufficient stock for ${bookRecord.title}` };
            }

            // Deduct Stock atomically
            await tx.book.update({
                where: { id: bookRecord.id },
                data: { stock: { decrement: item.quantity } }
            });

            const finalPrice = Number(bookRecord.price) * (1 - (bookRecord.discountPercent / 100));
            subtotal += finalPrice * item.quantity;
            
            processedItems.push({
                bookId: bookRecord.id,
                quantity: item.quantity,
                unitPrice: finalPrice
            });
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
                addressId: shippingAddress,
                subtotal,
                pointsUsed,
                couponId: coupon ? coupon.id : null,
                grandTotal,
                paymentMethod,
                paymentStatus: paymentMethod === 'COD' ? 'PENDING' : 'PENDING_GATEWAY',
                orderStatus: 'NEW',
                orderItems: {
                    create: processedItems
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

        await tx.adminNotification.create({
            data: {
                title: 'New Order Placed',
                message: `${user.name} has placed a new order (${order.orderNumber}) for ৳${grandTotal}.`,
                link: `/admin/orders`, // The frontend admin orders page
            }
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
    const existingOrder = await prisma.order.findUnique({
        where: { id: orderId },
        select: { orderStatus: true, grandTotal: true, userId: true }
    });

    if (!existingOrder) throw { statusCode: 404, message: 'Order not found' };

    const order = await prisma.order.update({
        where: { id: orderId },
        data: { 
            orderStatus: status,
            ...(trackingLink && { trackingLink })
        },
        include: { user: { select: { email: true, name: true } } }
    });

    // If transitioning to DELIVERED, award loyalty points (60 points per 1000 spend)
    if (existingOrder.orderStatus !== 'DELIVERED' && status === 'DELIVERED') {
        const pointsToAdd = Math.ceil((Number(existingOrder.grandTotal) / 1000) * 60);
        if (pointsToAdd > 0) {
            await prisma.user.update({
                where: { id: existingOrder.userId },
                data: { loyaltyPoints: { increment: pointsToAdd } }
            });
            console.log(`Awarded ${pointsToAdd} loyalty points to user ${existingOrder.userId} for order ${order.orderNumber}`);
        }
    }
    
    console.log(`--- MOCK ORDER NOTIFICATION ---`);
    console.log(`To: ${order.user.email}`);
    console.log(`Your order ${order.orderNumber} is now ${status}!`);
    if (trackingLink) console.log(`Track it here: ${trackingLink}`);
    console.log(`-------------------------------`);

    return order;
};

module.exports = { checkout, getMyOrders, getOrderById, getAdminOrders, updateOrderStatus };
