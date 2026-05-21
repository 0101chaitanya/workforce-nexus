const { z } = require("zod");
const common = require("./common");

const authSchemas = {
  sendOtp: z.object({
    email: common.email,
    companyName: common.name,
  }),

  verifyOtp: z.object({
    email: common.emailOrIdentity,
    otp: common.otp,
  }),

  register: z.object({
    fullName: common.name,
    email: common.email,
    password: common.newPassword,
  }),

  login: z.object({
    email: common.emailOrIdentity,
    password: common.password,
  }),

  forgotPasswordOtp: z.object({
    email: common.emailOrIdentity,
  }),

  resetPassword: z.object({
    email: common.emailOrIdentity,
    otp: common.otp,
    newPassword: common.newPassword,
  }),
};

module.exports = authSchemas;
