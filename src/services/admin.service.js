const prisma = require('../prisma');

// Books
const createBook = async (data) => prisma.book.create({ data });
const updateBook = async (id, data) => prisma.book.update({ where: { id }, data });

// Categories
const createCategory = async (data) => prisma.category.create({ data });
const updateCategory = async (id, data) => prisma.category.update({ where: { id }, data });
const deleteCategory = async (id) => prisma.category.delete({ where: { id } });

// Authors
const createAuthor = async (data) => prisma.author.create({ data });
const updateAuthor = async (id, data) => prisma.author.update({ where: { id }, data });
const deleteAuthor = async (id) => prisma.author.delete({ where: { id } });

// Publishers
const createPublisher = async (data) => prisma.publisher.create({ data });
const updatePublisher = async (id, data) => prisma.publisher.update({ where: { id }, data });
const deletePublisher = async (id) => prisma.publisher.delete({ where: { id } });

// Combos
const createCombo = async (data) => {
    const { title, price, isActive, imageUrls, bookIds } = data;
    
    // Leverage Prisma Nested Writes to generate Combo and Links atomically
    return prisma.combo.create({
        data: {
            title,
            price,
            isActive,
            imageUrls,
            comboItems: {
                create: bookIds.map(bookId => ({ bookId }))
            }
        },
        include: {
            comboItems: true
        }
    });
};

const deleteCombo = async (id) => prisma.combo.delete({ where: { id } });

// Coupons
const createCoupon = async (data) => prisma.coupon.create({ data });
const getCoupons = async () => prisma.coupon.findMany();
const deleteCoupon = async (id) => prisma.coupon.delete({ where: { id } });

// Notifications
const getAdminNotifications = async (limit = 50) => {
    return prisma.adminNotification.findMany({
        take: Number(limit),
        orderBy: { createdAt: 'desc' }
    });
};

const markNotificationAsRead = async (id) => {
    return prisma.adminNotification.update({
        where: { id },
        data: { isRead: true }
    });
};

const markAllNotificationsAsRead = async () => {
    return prisma.adminNotification.updateMany({
        where: { isRead: false },
        data: { isRead: true }
    });
};

module.exports = {
    createBook, updateBook,
    createCategory, updateCategory, deleteCategory,
    createAuthor, updateAuthor, deleteAuthor,
    createPublisher, updatePublisher, deletePublisher,
    createCombo, deleteCombo,
    createCoupon, getCoupons, deleteCoupon,
    getAdminNotifications, markNotificationAsRead, markAllNotificationsAsRead
};
