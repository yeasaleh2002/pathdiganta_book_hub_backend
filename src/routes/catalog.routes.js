const express = require('express');
const router = express.Router();
const catalogController = require('../controllers/catalog.controller');
const validateRequest = require('../middlewares/validateRequest');
const { getBooksQuerySchema, searchBooksQuerySchema } = require('../validations/catalog.validation');

router.get('/books', validateRequest(getBooksQuerySchema), catalogController.getBooks);
router.get('/books/search', validateRequest(searchBooksQuerySchema), catalogController.searchBooks);
router.get('/books/:id', catalogController.getBookById);

router.get('/categories', catalogController.getCategories);
router.get('/combos', catalogController.getCombos);

module.exports = router;
