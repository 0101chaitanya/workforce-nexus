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
    })
};

module.exports = leaveSchemas;