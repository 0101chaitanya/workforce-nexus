import { z } from "zod";
import { toast } from "react-toastify";

// Reusable base validators (identical to backend common.js)
export const common = {
  objectId: z.string().regex(/^[0-9a-fA-F]{24}$/, "Invalid ID format"),
  email: z.string().trim().min(1, "Email is required").email("Invalid email format"),
  emailOrIdentity: z.string().trim().refine(val => {
      const isEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(val);
      const isIdentity = /^EMP-[A-Z0-9]{6}$/i.test(val);
      return isEmail || isIdentity;
  }, "Must be a valid corporate email or identity code (e.g., EMP-7A9F23)"),
  password: z.string().min(8, "Password must be at least 8 characters"),
  newPassword: z.string().min(8, "Password must be at least 8 characters"),
  name: z.string().trim().min(6, "Name must be at least 6 characters").max(70, "Name is too long"),
  otp: z.coerce.number().int().min(10000, "OTP must be 5 digits").max(99999, "OTP must be 5 digits"),
  phone: z.string().min(10, "Phone number must be at least 10 digits").max(20),
  address: z.string().trim().min(1, "Address is required").max(500),
  positiveAmount: z.coerce.number().positive("Must be a positive number").max(100000000, "Amount exceeds maximum"),
  shortText: z.string().trim().min(2, "Must be at least 2 characters").max(100, "Too long"),
  mediumText: z.string().trim().min(5, "Must be at least 5 characters").max(1000, "Too long"),
  isoDate: z.string().datetime({ message: "Invalid date format" }),
  leaveType: z.enum(["sick", "personal", "annual", "unpaid"]),
  approvalStatus: z.enum(["approved", "rejected"])
};

export const validateForm = (schema, data) => {
  const result = schema.safeParse(data);
  if (!result.success) {
    const errorMessages = (result.error.issues || result.error.errors || []).map(err => err.message);
    toastFormErrors(errorMessages);
    return null;
  }
  return result.data;
};

export const toastFormErrors = (messages) => {
  messages.forEach(msg => toast.error(msg));
};
