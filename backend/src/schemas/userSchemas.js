const { z } = require("zod");

const userSchemas = {
    updateProfile: z.object({
        fullName: z.string().min(2, "Full name must be at least 2 characters").max(100).optional(),
        phone: z.string().min(10, "Phone number must be at least 10 digits").max(20).optional(),
        address: z.string().max(255).optional(),
        dateOfBirth: z.coerce.date().optional(),
        bankAccount: z.string().max(50).optional(),
    }),

    updateUserByAdmin: z.object({
        fullName: z.string().min(2).max(100).optional(),
        role: z.enum(["employee", "owner"]).optional(),
        salary: z.number().nonnegative("Salary cannot be negative").optional(),
        branch: z.string().max(100).optional(),
        position: z.string().max(100).optional(),
        phone: z.string().min(10).max(20).optional(),
        address: z.string().max(255).optional(),
        dateOfBirth: z.coerce.date().optional(),
        bankAccount: z.string().max(50).optional(),
    }),

    changePassword: z.object({
        oldPassword: z.string().min(1, "Old password is required"),
        newPassword: z.string().min(6, "New password must be at least 6 characters")
    })
};

module.exports = userSchemas;