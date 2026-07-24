const adminService = require('../services/admin.service');

// Books
const createBook = async (req, res, next) => {
    try {
        const book = await adminService.createBook(req.body);
        res.status(201).json({ success: true, book });
    } catch (error) {
        next(error);
    }
};
const updateBook = async (req, res, next) => {
    try {
        const book = await adminService.updateBook(req.params.id, req.body);
        res.status(200).json({ success: true, book });
    } catch (error) {
        next(error);
    }
};

// Categories
const createCategory = async (req, res, next) => {
    try {
        const category = await adminService.createCategory(req.body);
        res.status(201).json({ success: true, category });
    } catch (error) {
        next(error);
    }
};
const updateCategory = async (req, res, next) => {
    try {
        const category = await adminService.updateCategory(req.params.id, req.body);
        res.status(200).json({ success: true, category });
    } catch (error) {
        next(error);
    }
};
const deleteCategory = async (req, res, next) => {
    try {
        await adminService.deleteCategory(req.params.id);
        res.status(200).json({ success: true, message: 'Category deleted' });
    } catch (error) {
        next(error);
    }
};

// Authors
const createAuthor = async (req, res, next) => {
    try {
        const author = await adminService.createAuthor(req.body);
        res.status(201).json({ success: true, author });
    } catch (error) {
        next(error);
    }
};
const updateAuthor = async (req, res, next) => {
    try {
        const author = await adminService.updateAuthor(req.params.id, req.body);
        res.status(200).json({ success: true, author });
    } catch (error) {
        next(error);
    }
};
const deleteAuthor = async (req, res, next) => {
    try {
        await adminService.deleteAuthor(req.params.id);
        res.status(200).json({ success: true, message: 'Author deleted' });
    } catch (error) {
        next(error);
    }
};

// Publishers
const createPublisher = async (req, res, next) => {
    try {
        const publisher = await adminService.createPublisher(req.body);
        res.status(201).json({ success: true, publisher });
    } catch (error) {
        next(error);
    }
};
const updatePublisher = async (req, res, next) => {
    try {
        const publisher = await adminService.updatePublisher(req.params.id, req.body);
        res.status(200).json({ success: true, publisher });
    } catch (error) {
        next(error);
    }
};
const deletePublisher = async (req, res, next) => {
    try {
        await adminService.deletePublisher(req.params.id);
        res.status(200).json({ success: true, message: 'Publisher deleted' });
    } catch (error) {
        next(error);
    }
};

// Combos
const createCombo = async (req, res, next) => {
    try {
        const combo = await adminService.createCombo(req.body);
        res.status(201).json({ success: true, combo });
    } catch (error) {
        next(error);
    }
};

const deleteCombo = async (req, res, next) => {
    try {
        await adminService.deleteCombo(req.params.id);
        res.status(200).json({ success: true, message: 'Combo deleted' });
    } catch (error) {
        next(error);
    }
};

// Coupons
const createCoupon = async (req, res, next) => {
    try {
        const coupon = await adminService.createCoupon(req.body);
        res.status(201).json({ success: true, coupon });
    } catch (error) {
        next(error);
    }
};

const getCoupons = async (req, res, next) => {
    try {
        const coupons = await adminService.getCoupons();
        res.status(200).json({ success: true, coupons });
    } catch (error) {
        next(error);
    }
};

const deleteCoupon = async (req, res, next) => {
    try {
        await adminService.deleteCoupon(req.params.id);
        res.status(200).json({ success: true, message: 'Coupon deleted' });
    } catch (error) {
        next(error);
    }
};

// Notifications
const getAdminNotifications = async (req, res, next) => {
    try {
        const limit = req.query.limit || 50;
        const notifications = await adminService.getAdminNotifications(limit);
        res.status(200).json({ success: true, notifications });
    } catch (error) {
        next(error);
    }
};

const markNotificationAsRead = async (req, res, next) => {
    try {
        const notification = await adminService.markNotificationAsRead(req.params.id);
        res.status(200).json({ success: true, notification });
    } catch (error) {
        next(error);
    }
};

const markAllNotificationsAsRead = async (req, res, next) => {
    try {
        await adminService.markAllNotificationsAsRead();
        res.status(200).json({ success: true, message: 'All notifications marked as read' });
    } catch (error) {
        next(error);
    }
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
