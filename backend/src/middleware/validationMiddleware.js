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
            });
        }
        return res.status(500).json({
            message: "Internal server error",
            success: false,
        });
    }
};

module.exports = {
    validate
};
