const { z } = require("zod");
const common = require("./common");

const leaveSchemas = {
    applyLeave: z.object({
        type: common.leaveType,
        startDate: common.isoDate,
        endDate: common.isoDate,
        reason: common.mediumText
    }),
    updateLeaveStatus: z.object({
        status: common.approvalStatus,
        remarks: common.optionalMediumText
    }),
    historyQuery: z.object({
        targetUserId: common.objectId.optional(),
        page: z.coerce.number().int().positive().optional(),
        limit: z.coerce.number().int().positive().max(1000).optional()
    })
};

module.exports = leaveSchemas;