const { z } = require("zod");

const validate = (schema) => async (req, res, next) => {
    try {
        await schema.parseAsync(req.body);
        next();
    } catch (error) {
        if (error instanceof z.ZodError) {
            return res.status(400).json({
                message: "Validation failed",
                errors: error.errors.map((e) => ({
                    field: e.path.join("."),
                    message: e.message,
                })),
                success: false,
                occurredAt: new Date().toISOString()
            });
        }
        return res.status(500).json({
            message: "Internal server error",
            success: false,
            occurredAt: new Date().toISOString()
        });
    }
};

const validateQuery = (schema) => async (req, res, next) => {
    try {
        // We use parseAsync. Zod can also coerce string queries to numbers/booleans if specified in the schema.
        req.query = await schema.parseAsync(req.query);
        next();
    } catch (error) {
        if (error instanceof z.ZodError) {
            return res.status(400).json({
                message: "Query validation failed",
                errors: error.errors.map((e) => ({
                    field: e.path.join("."),
                    message: e.message,
                })),
                success: false,
                occurredAt: new Date().toISOString()
            });
        }
        return res.status(500).json({
            message: "Internal server error",
            success: false,
            occurredAt: new Date().toISOString()
        });
    }
};

module.exports = {
    validate,
    validateQuery
};
