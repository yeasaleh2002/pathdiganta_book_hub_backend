const addressService = require('../services/address.service');

const getAddresses = async (req, res, next) => {
    try {
        const addresses = await addressService.getAddresses(req.user.id);
        res.status(200).json({ success: true, addresses });
    } catch (error) {
        next(error);
    }
};

const getAddressById = async (req, res, next) => {
    try {
        const address = await addressService.getAddressById(req.user.id, req.params.id);
        res.status(200).json({ success: true, address });
    } catch (error) {
        next(error);
    }
};

const createAddress = async (req, res, next) => {
    try {
        const address = await addressService.createAddress(req.user.id, req.body);
        res.status(201).json({ success: true, address });
    } catch (error) {
        next(error);
    }
};

const updateAddress = async (req, res, next) => {
    try {
        const address = await addressService.updateAddress(req.user.id, req.params.id, req.body);
        res.status(200).json({ success: true, address });
    } catch (error) {
        next(error);
    }
};

const deleteAddress = async (req, res, next) => {
    try {
        await addressService.deleteAddress(req.user.id, req.params.id);
        res.status(200).json({ success: true, message: 'Address deleted successfully' });
    } catch (error) {
        next(error);
    }
};

module.exports = { getAddresses, getAddressById, createAddress, updateAddress, deleteAddress };
