import { z } from "zod";
import { common } from "../../utils/validation";

export const userSchemas = {
  updateProfile: z.object({
    fullName: z.string().min(2, "Full name must be at least 2 characters").max(100),
    phone: z.string().min(10, "Phone number must be at least 10 digits").max(20),
    address: z.string().min(1, "Address is required").max(255),
    dateOfBirth: z.preprocess(
      (val) => (val === "" || val === null || val === undefined ? undefined : val),
      z.coerce.date()
    ),
    bankAccount: z.string().min(1, "Bank account is required").max(50),
  }),
  changePassword: z.object({
    oldPassword: z.string().min(1, "Old password is required"),
    newPassword: z.string().min(8, "New password must be at least 8 characters"),
    confirmPassword: z.string().min(1, "Please confirm your new password.")
  }).refine((data) => data.newPassword === data.confirmPassword, {
    message: "New password and confirmation password do not match.",
    path: ["confirmPassword"]
  })
};
