const express = require('express');
const router = express.Router();
const addressController = require('../controllers/address.controller');
const validateRequest = require('../middlewares/validateRequest');
const { createAddressSchema, updateAddressSchema } = require('../validations/user.validation');
const { isAuthenticated } = require('../middlewares/authMiddleware');

// All address routes require authentication
router.use(isAuthenticated);

router.get('/', addressController.getAddresses);
router.post('/', validateRequest(createAddressSchema), addressController.createAddress);
router.get('/:id', addressController.getAddressById);
router.put('/:id', validateRequest(updateAddressSchema), addressController.updateAddress);
router.delete('/:id', addressController.deleteAddress);

module.exports = router;
