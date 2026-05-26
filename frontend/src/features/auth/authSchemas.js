import { z } from "zod";
import { common } from "../../utils/validation";

export const authSchemas = {
  sendOtp: z.object({
    email: common.email,
    companyName: z.string().trim().min(6, "Company name must be at least 6 characters").max(70, "Company name is too long"),
  }),
  verifyOtp: z.object({
    email: common.emailOrIdentity,
    otp: common.otp,
  }),
  register: z.object({
    fullName: z.string().trim().min(6, "Full name must be at least 6 characters").max(70, "Full name is too long"),
    email: common.email,
    password: common.newPassword,
    confirmPassword: z.string().min(1, "Please confirm your password.")
  }).refine((data) => data.password === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"]
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
  })
};
