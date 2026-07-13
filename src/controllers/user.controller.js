const userService = require('../services/user.service');

const getMe = async (req, res, next) => {
    try {
        const user = await userService.getProfile(req.user.id);
        res.status(200).json({ success: true, user });
    } catch (error) {
        next(error);
    }
};

const updateMe = async (req, res, next) => {
    try {
        const user = await userService.updateProfile(req.user.id, req.body);
        res.status(200).json({ success: true, user });
    } catch (error) {
        next(error);
    }
};

module.exports = { getMe, updateMe };
