const catalogService = require('../services/catalog.service');

const getBooks = async (req, res, next) => {
    try {
        const result = await catalogService.getBooks(req.query);
        res.status(200).json({ success: true, ...result });
    } catch (error) {
        next(error);
    }
};

const searchBooks = async (req, res, next) => {
    try {
        const result = await catalogService.searchBooks(req.query);
        res.status(200).json({ success: true, ...result });
    } catch (error) {
        next(error);
    }
};

const getBookById = async (req, res, next) => {
    try {
        const book = await catalogService.getBookById(req.params.id);
        res.status(200).json({ success: true, book });
    } catch (error) {
        next(error);
    }
};

const getCategories = async (req, res, next) => {
    try {
        const categories = await catalogService.getCategories();
        res.status(200).json({ success: true, categories });
    } catch (error) {
        next(error);
    }
};

const getCombos = async (req, res, next) => {
    try {
        const combos = await catalogService.getCombos();
        res.status(200).json({ success: true, combos });
    } catch (error) {
        next(error);
    }
};

const getAuthors = async (req, res, next) => {
    try {
        const authors = await catalogService.getAuthors();
        res.status(200).json({ success: true, authors });
    } catch (error) {
        next(error);
    }
};

const getPublishers = async (req, res, next) => {
    try {
        const publishers = await catalogService.getPublishers();
        res.status(200).json({ success: true, publishers });
    } catch (error) {
        next(error);
    }
};

const getNewArrivals = async (req, res, next) => {
    try {
        const books = await catalogService.getNewArrivals();
        res.status(200).json({ success: true, books });
    } catch (error) {
        next(error);
    }
};

const getBestSellers = async (req, res, next) => {
    try {
        const books = await catalogService.getBestSellers();
        res.status(200).json({ success: true, books });
    } catch (error) {
        next(error);
    }
};

const getTopAuthors = async (req, res, next) => {
    try {
        const authors = await catalogService.getTopAuthors();
        res.status(200).json({ success: true, authors });
    } catch (error) {
        next(error);
    }
};

const getTopPublishers = async (req, res, next) => {
    try {
        const publishers = await catalogService.getTopPublishers();
        res.status(200).json({ success: true, publishers });
    } catch (error) {
        next(error);
    }
};

const getBooksByCategory = async (req, res, next) => {
    try {
        const result = await catalogService.getBooksByCategory(req.params.slug);
        res.status(200).json({ success: true, ...result });
    } catch (error) {
        next(error);
    }
};

const getLatestActiveCoupon = async (req, res, next) => {
    try {
        const coupon = await catalogService.getLatestActiveCoupon();
        if (!coupon) {
            return res.status(200).json({ success: true, message: 'No active coupon' });
        }
        res.status(200).json({ success: true, coupon });
    } catch (error) {
        next(error);
    }
};

module.exports = {
    getBooks,
    searchBooks,
    getBookById,
    getCategories,
    getCombos,
    getAuthors,
    getPublishers,
    getNewArrivals,
    getBestSellers,
    getTopAuthors,
    getTopPublishers,
    getBooksByCategory,
    getLatestActiveCoupon,
};
