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
        const books = await catalogService.searchBooks(req.query.q);
        res.status(200).json({ success: true, books });
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

module.exports = { getBooks, searchBooks, getBookById, getCategories, getCombos };
