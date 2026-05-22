const { z } = require("zod");
const common = require("./common");

const ownerSchemas = {
  addUser: z.object({
    fullName: common.name,
    email: common.email,
    salary: common.positiveAmount.optional(),
    branch: common.shortText.optional(),
    position: common.shortText.optional()
  }),

  searchUsersQuery: z.object({
    query: z.string().trim().min(2).max(100).optional().or(z.literal("")),
    page: z.coerce.number().int().positive().optional(),
    limit: z.coerce.number().int().positive().max(1000).optional()
  }),

  updateCompany: z.object({
    companyName: common.name.optional(),
    address: z.string().trim().max(500).optional(),
    phone: z.string().trim().optional(),
    latitude: z.preprocess((val) => (val === '' || val === null || val === undefined) ? null : Number(val), z.number().min(-90).max(90).nullable()).optional(),
    longitude: z.preprocess((val) => (val === '' || val === null || val === undefined) ? null : Number(val), z.number().min(-180).max(180).nullable()).optional(),
    proximityRadius: z.preprocess((val) => (val === '' || val === null || val === undefined) ? null : Number(val), z.number().nonnegative().nullable()).optional()
  }),

  historyQuery: z.object({
    targetUserId: common.objectId.optional(),
    page: z.coerce.number().int().positive().optional(),
    limit: z.coerce.number().int().positive().max(1000).optional()
  })
};

module.exports = ownerSchemas;
