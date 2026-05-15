const { z } = require("zod");
const common = require("./common");

const managerSchemas = {
  addStaff: z.object({
    fullName: common.name,
    email: common.email,
    salary: common.staffSalary,
    position: common.tinyText,
  }),

  respondLeave: z.object({
    leaveId: common.objectId,
    status: common.approvalStatus,
    rejectionReason: common.optionalMediumText,
  }),

  preparePayroll: z.object({
    staffId: common.objectId,
    month: common.month,
    year: common.year,
    allowances: common.amount,
    bonus: common.amount,
    taxes: common.amount,
    deductions: common.amount,
  }),
};

module.exports = managerSchemas;
