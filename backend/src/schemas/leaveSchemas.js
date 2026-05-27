/**
 * @file leaveSchemas.js
 * @description Zod validation schemas for leave management routes (applying leaves, updating status, querying history).
 */

const { z } = require("zod");
const common = require("./common");

/**
 * Zod validation schemas for leave request endpoints.
 * @type {Object}
 * @property {z.ZodSchema} applyLeave - Schema for submitting a new leave application.
 * @property {z.ZodSchema} updateLeaveStatus - Schema for changing the status of a leave application.
 * @property {z.ZodSchema} historyQuery - Schema for querying leave history records with pagination.
 */
const leaveSchemas = {
    applyLeave: z.object({
        type: common.leaveType,
        startDate: common.isoDate,
        endDate: common.isoDate,
        reason: common.mediumText
    }).refine((data) => new Date(data.startDate) <= new Date(data.endDate), {
        message: "Start date cannot be after end date",
        path: ["startDate"]
    }),
    updateLeaveStatus: z.object({
        status: common.approvalStatus,
        remarks: common.mediumText
    }),
    historyQuery: z.object({
        targetUserId: common.objectId.optional(),
        page: z.coerce.number().int().positive().optional(),
        limit: z.coerce.number().int().positive().max(1000).optional()
    })
};

module.exports = leaveSchemas;
