const { z } = require("zod");
const common = require("./common");

const adminSchemas = {
  addManager: z.object({
    fullName: common.name,
    email: common.email,
    salary: common.managerSalary,
    position: common.tinyText,
    department: common.shortText,
  }),

  reviewPayroll: z.object({
    payrollId: common.objectId,
    status: common.reviewStatus,
  }),
};

module.exports = adminSchemas;
