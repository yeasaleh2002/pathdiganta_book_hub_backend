const prisma = require('../prisma');

const getActiveCart = async (userId, sessionId) => {
    const where = userId ? { userId, status: 'ACTIVE' } : { sessionId, status: 'ACTIVE', userId: null };
    
    let cart = await prisma.cart.findFirst({
        where,
        include: {
            cartItems: {
                include: {
                    book: {
                        select: { id: true, title: true, price: true, discountPercent: true, stock: true, imageUrls: true }
                    }
                }
            }
        }
    });

    if (!cart) {
        cart = await prisma.cart.create({
            data: { userId, sessionId, status: 'ACTIVE' },
            include: { cartItems: true }
        });
    } else {
        // Touch cart timestamp to prevent/extend abandonment limit
        cart = await prisma.cart.update({
            where: { id: cart.id },
            data: { status: 'ACTIVE' },
            include: {
                cartItems: {
                    include: { book: { select: { id: true, title: true, price: true, discountPercent: true, stock: true, imageUrls: true } } }
                }
            }
        });
    }

    return cart;
};

const addToCart = async (userId, sessionId, bookId, quantity) => {
    const cart = await getActiveCart(userId, sessionId);
    
    const book = await prisma.book.findUnique({ where: { id: bookId } });
    if (!book || !book.isActive) throw { statusCode: 404, message: 'Book not found or is currently inactive.' };
    if (book.stock < quantity) throw { statusCode: 400, message: 'Not enough stock available.' };

    const existingItem = await prisma.cartItem.findFirst({
        where: { cartId: cart.id, bookId }
    });

    if (existingItem) {
        await prisma.cartItem.update({
            where: { id: existingItem.id },
            data: { quantity: existingItem.quantity + quantity }
        });
    } else {
        await prisma.cartItem.create({
            data: { cartId: cart.id, bookId, quantity }
        });
    }

    // Touch the cart
    await prisma.cart.update({ where: { id: cart.id }, data: { status: 'ACTIVE' } });
    
    return getActiveCart(userId, sessionId);
};

const updateCartItem = async (userId, sessionId, cartItemId, quantity) => {
    const cart = await getActiveCart(userId, sessionId);
    
    const cartItem = await prisma.cartItem.findFirst({
        where: { id: cartItemId, cartId: cart.id }
    });

    if (!cartItem) throw { statusCode: 404, message: 'Item not found in your cart.' };

    await prisma.cartItem.update({
        where: { id: cartItemId },
        data: { quantity }
    });

    await prisma.cart.update({ where: { id: cart.id }, data: { status: 'ACTIVE' } });

    return getActiveCart(userId, sessionId);
};

const removeCartItem = async (userId, sessionId, cartItemId) => {
    const cart = await getActiveCart(userId, sessionId);
    
    const cartItem = await prisma.cartItem.findFirst({
        where: { id: cartItemId, cartId: cart.id }
    });

    if (!cartItem) throw { statusCode: 404, message: 'Item not found in your cart.' };

    await prisma.cartItem.delete({ where: { id: cartItemId } });
    
    await prisma.cart.update({ where: { id: cart.id }, data: { status: 'ACTIVE' } });

    return { message: 'Item removed from cart successfully.' };
};

module.exports = { getActiveCart, addToCart, updateCartItem, removeCartItem };
