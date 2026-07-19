const validateRequest = (schema) => async (req, res, next) => {
    try {
        await schema.parseAsync({
            body: req.body,
            query: req.query,
            params: req.params,
        });
        return next();
    } catch (error) {
        if (error.errors && Array.isArray(error.errors)) {
            return res.status(400).json({
                success: false,
                message: 'Validation failed',
                errors: error.errors.map(err => ({ field: err.path.join('.'), message: err.message })),
            });
        }
        return res.status(400).json({
            success: false,
            message: error.message || 'Validation failed'
        });
    }
};

module.exports = validateRequest;
