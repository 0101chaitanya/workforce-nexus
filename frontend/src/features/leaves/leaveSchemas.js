/**
 * @file leaveSchemas.js
 * @description Zod validation schemas for leave application forms and reviewer response forms.
 */

import { z } from "zod";
import { common } from "../../utils/validation";

/**
 * Validation schemas for leave request pages.
 * @type {Object}
 * @property {z.ZodSchema} applyLeave - Schema for applying for leaves.
 * @property {z.ZodSchema} updateLeaveStatus - Schema for approving/rejecting leave applications.
 */
export const leaveSchemas = {
  applyLeave: z.object({
    type: common.leaveType,
    startDate: z.string().min(1, "Please select a start date"),
    endDate: z.string().min(1, "Please select an end date"),
    reason: common.mediumText
  }).refine((data) => new Date(data.startDate) <= new Date(data.endDate), {
    message: "Start date cannot be after end date.",
    path: ["startDate"]
  }).transform((data) => ({
    ...data,
    startDate: new Date(data.startDate).toISOString(),
    endDate: new Date(data.endDate).toISOString()
  })),
  updateLeaveStatus: z.object({
    status: common.approvalStatus,
    remarks: common.mediumText
  })
};
