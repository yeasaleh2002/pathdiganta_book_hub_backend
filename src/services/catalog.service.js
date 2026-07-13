const prisma = require('../prisma');

const getBooks = async (filters) => {
    const { page = 1, limit = 20, categoryId, authorId, publisherId, sortBy } = filters;
    const skip = (Number(page) - 1) * Number(limit);
    const take = Math.min(Number(limit), 100);

    const where = { isActive: true };
    if (categoryId) where.categoryId = categoryId;
    if (authorId) where.authorId = authorId;
    if (publisherId) where.publisherId = publisherId;

    let orderBy = { createdAt: 'desc' }; // Default newest
    if (sortBy === 'price_asc') orderBy = { price: 'asc' };
    else if (sortBy === 'price_desc') orderBy = { price: 'desc' };
    else if (sortBy === 'title_asc') orderBy = { title: 'asc' };

    // Run count and query in parallel for max performance
    const [books, total] = await Promise.all([
        prisma.book.findMany({
            where,
            include: {
                category: { select: { id: true, name: true, slug: true } },
                author: { select: { id: true, name: true } },
                publisher: { select: { id: true, name: true } },
            },
            skip,
            take,
            orderBy,
        }),
        prisma.book.count({ where }),
    ]);

    return {
        books,
        meta: {
            total,
            page: Number(page),
            limit: take,
            totalPages: Math.ceil(total / take),
        }
    };
};

const searchBooks = async (q) => {
    return prisma.book.findMany({
        where: {
            isActive: true,
            title: {
                contains: q,
                mode: 'insensitive', // Case-insensitive autocomplete
            }
        },
        select: {
            id: true,
            title: true,
            price: true,
            imageUrls: true,
            author: { select: { name: true } }
        },
        take: 10,
    });
};

const getBookById = async (id) => {
    const book = await prisma.book.findUnique({
        where: { id },
        include: {
            category: true,
            author: true,
            publisher: true,
            comboItems: {
                include: {
                    combo: true
                }
            },
            reviews: {
                where: { isApproved: true },
                include: { user: { select: { name: true } } },
                take: 10,
                orderBy: { rating: 'desc' }
            }
        }
    });

    if (!book || !book.isActive) {
        throw { statusCode: 404, message: 'Book not found' };
    }

    return book;
};

const getCategories = async () => {
    return prisma.category.findMany({
        orderBy: { name: 'asc' }
    });
};

const getCombos = async () => {
    return prisma.combo.findMany({
        where: { isActive: true },
        include: {
            comboItems: { 
                include: { book: { select: { id: true, title: true, price: true, imageUrls: true } } } 
            }
        }
    });
};

module.exports = { getBooks, searchBooks, getBookById, getCategories, getCombos };
