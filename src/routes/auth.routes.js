const express = require('express');
const router = express.Router();
const authController = require('../controllers/auth.controller');
const validateRequest = require('../middlewares/validateRequest');
const { registerSchema, verifyRegistrationSchema, loginSchema, googleAuthSchema } = require('../validations/auth.validation');
const { authLimiter } = require('../middlewares/rateLimiter');
const { isAuthenticated } = require('../middlewares/authMiddleware');

router.post('/register', authLimiter, validateRequest(registerSchema), authController.register);
router.post('/verify-registration', authLimiter, validateRequest(verifyRegistrationSchema), authController.verifyRegistration);
router.post('/login', authLimiter, validateRequest(loginSchema), authController.login);
router.post('/google', authLimiter, validateRequest(googleAuthSchema), authController.googleLogin);
router.post('/logout', isAuthenticated, authController.logout);

module.exports = router;
