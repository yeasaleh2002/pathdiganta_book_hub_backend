const prisma = require('../prisma');

const getAddresses = async (userId) => {
    return prisma.address.findMany({ where: { userId } });
};

const getAddressById = async (userId, id) => {
    const address = await prisma.address.findFirst({ where: { id, userId } });
    if (!address) throw { statusCode: 404, message: 'Address not found or you are unauthorized to access it.' };
    return address;
};

const createAddress = async (userId, data) => {
    if (data.isDefault) {
        await prisma.address.updateMany({
            where: { userId, isDefault: true },
            data: { isDefault: false },
        });
    }
    return prisma.address.create({
        data: { ...data, userId }
    });
};

const updateAddress = async (userId, id, data) => {
    await getAddressById(userId, id); // Enforce existence and ownership
    
    if (data.isDefault) {
        await prisma.address.updateMany({
            where: { userId, isDefault: true },
            data: { isDefault: false },
        });
    }

    return prisma.address.update({
        where: { id },
        data
    });
};

const deleteAddress = async (userId, id) => {
    await getAddressById(userId, id); // Enforce ownership
    return prisma.address.delete({ where: { id } });
};

module.exports = { getAddresses, getAddressById, createAddress, updateAddress, deleteAddress };
