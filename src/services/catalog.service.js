const prisma = require('../prisma');

const getBooks = async (filters) => {
    const { page = 1, limit = 20, categoryId, authorId, publisherId, sortBy } = filters;
    const skip = (Number(page) - 1) * Number(limit);
    const take = Math.min(Number(limit), 100);

    const where = { isActive: true };
    if (categoryId) where.categoryId = categoryId;
    if (authorId) where.authorId = authorId;
    if (publisherId) where.publisherId = publisherId;

    let orderBy = undefined;
    if (sortBy === 'price_asc') orderBy = { price: 'asc' };
    else if (sortBy === 'price_desc') orderBy = { price: 'desc' };
    else if (sortBy === 'title_asc') orderBy = { title: 'asc' };
    else if (sortBy === 'newest') orderBy = { createdAt: 'desc' };

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

const searchBooks = async (filters) => {
    const { q, page = 1, limit = 20, categoryId, authorId, publisherId, sortBy } = filters;
    const skip = (Number(page) - 1) * Number(limit);
    const take = Math.min(Number(limit), 100);

    const where = { 
        isActive: true,
    };
    if (q) {
        where.title = {
            contains: q,
            mode: 'insensitive',
        };
    }
    if (categoryId) where.categoryId = categoryId;
    if (authorId) where.authorId = authorId;
    if (publisherId) where.publisherId = publisherId;

    let orderBy = undefined;
    if (sortBy === 'price_asc') orderBy = { price: 'asc' };
    else if (sortBy === 'price_desc') orderBy = { price: 'desc' };
    else if (sortBy === 'title_asc') orderBy = { title: 'asc' };
    else if (sortBy === 'newest') orderBy = { createdAt: 'desc' };

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

const getAuthors = async () => {
    return prisma.author.findMany({
        orderBy: { name: 'asc' }
    });
};

const getPublishers = async () => {
    return prisma.publisher.findMany({
        orderBy: { name: 'asc' }
    });
};

const getBooksByCategory = async (slug) => {
    const category = await prisma.category.findUnique({
        where: { slug },
    });

    if (!category) {
        throw { statusCode: 404, message: 'Category not found' };
    }

    const books = await prisma.book.findMany({
        where: { isActive: true, categoryId: category.id },
        include: {
            author: { select: { id: true, name: true } },
            publisher: { select: { id: true, name: true } },
        },
        orderBy: { createdAt: 'desc' },
    });

    return { category, books };
};

const getNewArrivals = async () => {
    return prisma.book.findMany({
        where: { isActive: true },
        include: {
            category: { select: { id: true, name: true, slug: true } },
            author: { select: { id: true, name: true } },
            publisher: { select: { id: true, name: true } },
        },
        orderBy: { createdAt: 'desc' },
        take: 10,
    });
};

const getBestSellers = async () => {
    // Aggregate total units sold per book from completed order items
    const topItems = await prisma.orderItem.groupBy({
        by: ['bookId'],
        _sum: { quantity: true },
        where: { bookId: { not: null } },
        orderBy: { _sum: { quantity: 'desc' } },
        take: 10,
    });

    const bookIds = topItems.map(item => item.bookId);

    const books = await prisma.book.findMany({
        where: { id: { in: bookIds }, isActive: true },
        include: {
            category: { select: { id: true, name: true, slug: true } },
            author: { select: { id: true, name: true } },
            publisher: { select: { id: true, name: true } },
        },
    });

    // Reorder to match the sorted rank and attach totalSold
    return bookIds
        .map(id => {
            const book = books.find(b => b.id === id);
            const item = topItems.find(i => i.bookId === id);
            if (!book) return null;
            return { ...book, totalSold: item._sum.quantity };
        })
        .filter(Boolean);
};

const getTopAuthors = async () => {
    // Top 10 authors by number of active books in the catalog
    const authors = await prisma.author.findMany({
        include: {
            _count: { select: { books: true } },
        },
    });

    return authors
        .map(a => ({ ...a, bookCount: a._count.books }))
        .sort((a, b) => b.bookCount - a.bookCount)
        .slice(0, 10)
        .map(({ _count, ...rest }) => rest);
};

const getTopPublishers = async () => {
    // Top 10 publishers by number of active books in the catalog
    const publishers = await prisma.publisher.findMany({
        include: {
            _count: { select: { books: true } },
        },
    });

    return publishers
        .map(p => ({ ...p, bookCount: p._count.books }))
        .sort((a, b) => b.bookCount - a.bookCount)
        .slice(0, 10)
        .map(({ _count, ...rest }) => rest);
};

const getLatestActiveCoupon = async () => {
    return prisma.coupon.findFirst({
        where: {
            validUntil: { gt: new Date() }
        },
        orderBy: { validUntil: 'desc' }
    });
};

module.exports = {
    getBooks,
    searchBooks,
    getBookById,
    getCategories,
    getCombos,
    getAuthors,
    getPublishers,
    getBooksByCategory,
    getNewArrivals,
    getBestSellers,
    getTopAuthors,
    getTopPublishers,
    getLatestActiveCoupon,
};
