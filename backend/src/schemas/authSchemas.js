/**
 * @file authSchemas.js
 * @description Zod validation schemas for authentication routes (login, register, OTP verification, password resets).
 */

const { z } = require("zod");
const common = require("./common");

/**
 * Zod validation schemas for authentication endpoints.
 * @type {Object}
 * @property {z.ZodSchema} sendOtp - Schema for sending verification OTP.
 * @property {z.ZodSchema} verifyOtp - Schema for validating OTP.
 * @property {z.ZodSchema} register - Schema for onboarding registration.
 * @property {z.ZodSchema} login - Schema for user authentication.
 * @property {z.ZodSchema} forgotPasswordOtp - Schema for triggering password reset OTP.
 * @property {z.ZodSchema} resetPassword - Schema for executing password reset.
 */
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
