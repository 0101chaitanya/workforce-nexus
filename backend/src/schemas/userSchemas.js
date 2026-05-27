/**
 * @file userSchemas.js
 * @description Zod validation schemas for user profile updates, administrative employee edits, and password change operations.
 */

const { z } = require("zod");

/**
 * Zod validation schemas for user management endpoints.
 * @type {Object}
 * @property {z.ZodSchema} updateProfile - Schema for employees to update their own profile fields.
 * @property {z.ZodSchema} updateUserByAdmin - Schema for company owners/admins to update employee administrative fields.
 * @property {z.ZodSchema} changePassword - Schema for changing the active user password.
 */
const userSchemas = {
    updateProfile: z.object({
        fullName: z.string().min(2, "Full name must be at least 2 characters").max(100),
        phone: z.string().min(10, "Phone number must be at least 10 digits").max(20),
        address: z.string().min(1, "Address is required").max(255),
        dateOfBirth: z.preprocess(
            (val) => (val === "" || val === null || val === undefined ? undefined : val),
            z.coerce.date()
        ),
        bankAccount: z.string().min(1, "Bank account is required").max(50),
    }),

    updateUserByAdmin: z.object({
        fullName: z.string().min(2, "Full name must be at least 2 characters").max(100),
        role: z.enum(["employee", "owner"]).optional(),
        salary: z.preprocess(
            (val) => Number(val),
            z.number().nonnegative("Salary cannot be negative")
        ),
        branch: z.string().min(2, "Branch must be at least 2 characters").max(100),
        position: z.string().min(2, "Position must be at least 2 characters").max(100),
        phone: z.string().min(10, "Phone number must be at least 10 digits").max(20),
        address: z.string().min(1, "Address is required").max(255),
        dateOfBirth: z.preprocess(
            (val) => (val === "" || val === null || val === undefined ? undefined : val),
            z.coerce.date().optional()
        ),
        bankAccount: z.string().max(50).nullable().optional().or(z.literal("")),
    }),

    changePassword: z.object({
        oldPassword: z.string().min(1, "Old password is required"),
        newPassword: z.string().min(6, "New password must be at least 6 characters")
    })
};

module.exports = userSchemas;
