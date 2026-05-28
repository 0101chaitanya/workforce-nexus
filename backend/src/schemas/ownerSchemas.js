/**
 * @file ownerSchemas.js
 * @description Zod validation schemas for owner-specific actions (adding employees, searching users, updating company details).
 */

const { z } = require("zod");
const common = require("./common");

/**
 * Zod validation schemas for administrative actions performed by the company owner.
 * @type {Object}
 * @property {z.ZodSchema} addUser - Schema for onboarding a new employee.
 * @property {z.ZodSchema} searchUsersQuery - Schema for searching and filtering company employees.
 * @property {z.ZodSchema} updateCompany - Schema for updating company core information and geofencing configurations.
 * @property {z.ZodSchema} historyQuery - Schema for querying system histories (attendance, payroll, etc.).
 */
const ownerSchemas = {
  addUser: z.object({
    fullName: common.name,
    email: common.email,
    salary: common.positiveAmount,
    branch: common.shortText,
    position: common.shortText
  }),

  searchUsersQuery: z.object({
    query: z.string().trim().min(2).max(100).optional().or(z.literal("")),
    page: z.coerce.number().int().positive().optional(),
    limit: z.coerce.number().int().positive().max(1000).optional(),
    statusFilter: z.enum(["active", "inactive", "both"]).optional()
  }),

  updateCompany: z.object({
    companyName: common.name,
    address: z.string().trim().min(1, "Address is required").max(500),
    phone: z.string().trim().min(10, "Phone number must be at least 10 digits").max(20),
    latitude: z.preprocess((val) => Number(val), z.number().min(-90, "Latitude must be between -90 and 90").max(90, "Latitude must be between -90 and 90")),
    longitude: z.preprocess((val) => Number(val), z.number().min(-180, "Longitude must be between -180 and 180").max(180, "Longitude must be between -180 and 180")),
    proximityRadius: z.preprocess((val) => Number(val), z.number().nonnegative("Proximity radius cannot be negative"))
  }),

  historyQuery: z.object({
    targetUserId: common.objectId.optional(),
    page: z.coerce.number().int().positive().optional(),
    limit: z.coerce.number().int().positive().max(1000).optional()
  })
};

module.exports = ownerSchemas;
