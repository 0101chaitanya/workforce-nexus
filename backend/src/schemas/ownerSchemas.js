const { z } = require("zod");
const common = require("./common");

const ownerSchemas = {
  addUser: z.object({
    fullName: common.name,
    email: common.email,
    password: common.newPassword,
    role: z.enum(["hr", "manager", "staff"]),
    salary: common.positiveAmount.optional(),
    branch: common.shortText.optional()
  }),

  searchUsersQuery: z.object({
    query: common.shortText.optional(),
    role: z.enum(["hr", "manager", "staff", "owner"]).optional()
  }),

  historyQuery: z.object({
    targetUserId: common.objectId.optional()
  })
};

module.exports = ownerSchemas;
