const { z } = require("zod");
const common = require("./common");

const ownerSchemas = {
  editCompanyInfo: z.object({
    companyName: common.name.optional(),
    email: common.email.optional(),
    phone: common.phone.optional(),
    address: common.address.optional(),
  }),

  updateProfile: z.object({
    fullName: common.name,
    phone: common.phone,
    address: common.address,
  }),

  addAdmin: z.object({
    fullName: common.name,
    email: common.email,
    salary: common.adminSalary,
    position: common.tinyText,
    branch: common.shortText,
  }),

  approvePayroll: z.object({
    payrollId: common.objectId,
    status: common.approvalStatus,
  }),
};

module.exports = ownerSchemas;
