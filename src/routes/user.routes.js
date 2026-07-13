const express = require('express');
const router = express.Router();
const userController = require('../controllers/user.controller');
const validateRequest = require('../middlewares/validateRequest');
const { updateUserSchema } = require('../validations/user.validation');
const { isAuthenticated } = require('../middlewares/authMiddleware');

router.get('/me', isAuthenticated, userController.getMe);
router.put('/me', isAuthenticated, validateRequest(updateUserSchema), userController.updateMe);

module.exports = router;
