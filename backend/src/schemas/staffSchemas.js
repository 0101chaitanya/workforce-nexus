const { z } = require("zod");
const common = require("./common");

const staffSchemas = {
  applyLeave: z.object({
    startDate: common.isoDate,
    endDate: common.isoDate,
    reason: common.mediumText,
    leaveType: common.leaveType,
  }),
};

module.exports = staffSchemas;
