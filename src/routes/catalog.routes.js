const express = require('express');
const router = express.Router();
const catalogController = require('../controllers/catalog.controller');
const validateRequest = require('../middlewares/validateRequest');
const { getBooksQuerySchema, searchBooksQuerySchema } = require('../validations/catalog.validation');

// --- Books ---
// Static routes MUST come before parameterized /:id route
router.get('/books/new-arrivals', catalogController.getNewArrivals);
router.get('/books/best-sellers', catalogController.getBestSellers);
router.get('/books/search', validateRequest(searchBooksQuerySchema), catalogController.searchBooks);
router.get('/books', validateRequest(getBooksQuerySchema), catalogController.getBooks);
router.get('/books/:id', catalogController.getBookById);

// --- Authors ---
// /top must come before any /:id routes if added in future
router.get('/authors/top', catalogController.getTopAuthors);
router.get('/authors', catalogController.getAuthors);

// --- Publishers ---
router.get('/publishers/top', catalogController.getTopPublishers);
router.get('/publishers', catalogController.getPublishers);

// --- Categories ---
router.get('/categories', catalogController.getCategories);
router.get('/categories/:slug/books', catalogController.getBooksByCategory);

// --- Combos ---
router.get('/combos', catalogController.getCombos);

module.exports = router;
