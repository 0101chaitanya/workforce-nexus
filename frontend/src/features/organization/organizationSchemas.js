/**
 * @file organizationSchemas.js
 * @description Zod validation schemas for organization setting forms.
 */

import { z } from "zod";
import { common } from "../../utils/validation";

/**
 * Validation schemas for organization-related actions.
 * @type {Object}
 * @property {z.ZodSchema} updateCompany - Schema for updating company details and geofencing boundaries.
 */
export const organizationSchemas = {
  updateCompany: z.object({
    companyName: common.name,
    address: z.string().trim().min(1, "Address is required").max(500),
    phone: z.string().trim().min(10, "Phone number must be at least 10 digits").max(20),
    latitude: z.preprocess((val) => Number(val), z.number().min(-90, "Latitude must be between -90 and 90").max(90, "Latitude must be between -90 and 90")),
    longitude: z.preprocess((val) => Number(val), z.number().min(-180, "Longitude must be between -180 and 180").max(180, "Longitude must be between -180 and 180")),
    proximityRadius: z.preprocess((val) => Number(val), z.number().nonnegative("Proximity radius cannot be negative"))
  })
};
