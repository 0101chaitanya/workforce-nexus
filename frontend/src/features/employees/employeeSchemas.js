/**
 * @file employeeSchemas.js
 * @description Zod validation schemas for owner-controlled employee actions (adding or editing an employee).
 */

import { z } from "zod";
import { common } from "../../utils/validation";

/**
 * Validation schemas for employee-related management tasks.
 * @type {Object}
 * @property {z.ZodSchema} addUser - Schema for onboarding a new employee.
 * @property {z.ZodSchema} updateUserByAdmin - Schema for owner edits to employee profiles.
 */
export const employeeSchemas = {
  addUser: z.object({
    fullName: common.name,
    email: common.email,
    salary: common.positiveAmount,
    branch: common.shortText,
    position: common.shortText
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
  })
};
