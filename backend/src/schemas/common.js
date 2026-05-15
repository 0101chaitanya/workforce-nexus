const { z } = require("zod");

// Common reusable validators
const common = {
  // MongoDB ObjectId (24 hex chars)
  objectId: z.string().regex(/^[0-9a-fA-F]{24}$/, "Invalid ID format"),

  // Email with standard validation
  email: z.string().email("Invalid email format").trim(),

  // Password for login (minimal check)
  password: z.string().min(8, "Password must be at least 8 characters"),

  // Password for registration (strict rules)
  newPassword: z.string()
    .min(8, "Password must be at least 8 characters")
    .max(100, "Password is too long")
    .regex(/[a-z]/, "Password must contain at least one lowercase letter")
    .regex(/[A-Z]/, "Password must contain at least one uppercase letter")
    .regex(/[0-9]/, "Password must contain at least one number")
    .regex(/[^a-zA-Z0-9]/, "Password must contain at least one special character"),

  // Person name
  name: z.string().trim().min(6, "Name must be at least 6 characters").max(70, "Name is too long"),

  // OTP - 5 digits, coerced from string if needed
  otp: z.coerce.number().int().min(10000, "OTP must be 5 digits").max(99999, "OTP must be 5 digits"),

  // Phone number (E.164 format with flexibility) - allows empty string
  phone: z.union([
    z.string().trim().regex(/^\+?[1-9]\d{1,14}$/, "Invalid phone number format"),
    z.literal(""),
    z.literal(undefined)
  ]),

  // Address
  address: z.string().trim().max(500, "Address is too long").optional(),

  // Positive amount (for salaries, payroll items)
  positiveAmount: z.coerce.number().positive("Must be a positive number").max(100000000, "Amount exceeds maximum"),

  // Role-specific salary ranges (industry standards for India)
  adminSalary: z.coerce.number()
    .positive("Must be a positive number")
    .min(25000, "Admin salary should be at least ₹25,000/month")
    .max(200000, "Admin salary should not exceed ₹2,00,000/month"),
    
  managerSalary: z.coerce.number()
    .positive("Must be a positive number")
    .min(20000, "Manager salary should be at least ₹20,000/month")
    .max(150000, "Manager salary should not exceed ₹1,50,000/month"),
    
  staffSalary: z.coerce.number()
    .positive("Must be a positive number")
    .min(15000, "Staff salary should be at least ₹15,000/month")
    .max(80000, "Staff salary should not exceed ₹80,000/month"),

  // Non-negative amount (for allowances, deductions)
  amount: z.coerce.number().min(0, "Cannot be negative").max(10000000, "Amount too high").default(0),

  // Month string (01-12)
  month: z.string().regex(/^(0[1-9]|1[0-2])$/, "Month must be 01-12"),

  // Year (reasonable range)
  year: z.coerce.number().int().min(2020).max(2100, "Year out of range"),

  // Short text (position, department, branch names)
  shortText: z.string().trim().min(2, "Must be at least 2 characters").max(100, "Too long"),

  // Tiny text (position titles)
  tinyText: z.string().trim().min(2, "Must be at least 2 characters").max(50, "Too long"),

  // Medium text (reasons, remarks)
  mediumText: z.string().trim().min(5, "Must be at least 5 characters").max(1000, "Too long"),

  // Optional medium text
  optionalMediumText: z.string().trim().max(500, "Too long").optional(),

  // ISO Date string
  isoDate: z.string().datetime({ message: "Invalid date format" }),

  // Leave types
  leaveType: z.enum(["sick", "personal", "annual", "unpaid"]),

  // Binary status enums
  approvalStatus: z.enum(["approved", "rejected"]),
  reviewStatus: z.enum(["pending_approval", "rejected"]),
};

module.exports = common;
