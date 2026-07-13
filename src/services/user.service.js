const prisma = require('../prisma');

const getProfile = async (userId) => {
    return prisma.user.findUnique({
        where: { id: userId },
        select: { id: true, name: true, email: true, phone: true, role: true, loyaltyPoints: true, createdAt: true }
    });
};

const updateProfile = async (userId, data) => {
    return prisma.user.update({
        where: { id: userId },
        data,
        select: { id: true, name: true, phone: true, loyaltyPoints: true }
    });
};

module.exports = { getProfile, updateProfile };
