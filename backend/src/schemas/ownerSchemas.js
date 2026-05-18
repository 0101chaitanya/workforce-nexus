const { z } = require("zod");
const common = require("./common");

const ownerSchemas = {
  addUser: z.object({
    fullName: common.name,
    email: common.email,
    role: z.enum(["employee"]),
    salary: common.positiveAmount.optional(),
    branch: common.shortText.optional(),
    position: common.shortText.optional()
  }),

  searchUsersQuery: z.object({
    query: common.shortText.optional(),
    role: z.enum(["employee", "owner"]).optional()
  }),

  historyQuery: z.object({
    targetUserId: common.objectId.optional()
  })
};

module.exports = ownerSchemas;
