const { z } = require("zod");
const common = require("./common");

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
