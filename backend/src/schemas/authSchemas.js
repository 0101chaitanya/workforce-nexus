const { z } = require("zod");
const common = require("./common");

const authSchemas = {
  sendOtp: z.object({
    email: common.email,
    companyName: common.name,
  }),

  verifyOtp: z.object({
    email: common.email,
    otp: common.otp,
  }),

  register: z.object({
    fullName: common.name,
    email: common.email,
    password: common.newPassword,
  }),

  login: z.object({
    email: common.email,
    password: common.password,
  }),

  forgotPasswordOtp: z.object({
    email: common.email,
  }),

  resetPassword: z.object({
    email: common.email,
    otp: common.otp,
    newPassword: common.newPassword,
  }),
};

module.exports = authSchemas;
