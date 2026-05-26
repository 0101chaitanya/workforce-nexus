import { z } from "zod";
import { common } from "../../utils/validation";

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
