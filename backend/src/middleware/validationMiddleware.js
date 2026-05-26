const { z } = require("zod");

/**
 * Validates the Express request body against a given **Zod schema**.
 * Sends a `400` response with structured validation errors if validation fails.
 * @param {z.ZodSchema} schema - Zod validation schema to parse.
 * @returns {Function} Express middleware.
 */
const validate = (schema) => async (req, res, next) => {
    try {
        req.body = await schema.parseAsync(req.body);
        next();
    } catch (error) {
        if (error instanceof z.ZodError) {
            const concatenatedMessage = (error.issues || []).map((e) => e.message).join(", ");
            return res.status(400).json({
                message: concatenatedMessage || "Validation failed",
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

/**
 * Validates the Express query parameters against a given **Zod schema**.
 * Sends a `400` response with structured query validation errors if validation fails.
 * @param {z.ZodSchema} schema - Zod validation schema to parse.
 * @returns {Function} Express middleware.
 */
const validateQuery = (schema) => async (req, res, next) => {
    try {
        // We use parseAsync. Zod can also coerce string queries to numbers/booleans if specified in the schema.
        req.query = await schema.parseAsync(req.query);
        next();
    } catch (error) {
        if (error instanceof z.ZodError) {
            const concatenatedMessage = (error.issues || []).map((e) => e.message).join(", ");
            return res.status(400).json({
                message: concatenatedMessage || "Query validation failed",
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
