import Joi from "joi";
import { ALLOWED_SORT_FIELDS } from "./lead.constants.js";

// International phone number regex (supports optional +, country code, spaces, dashes, 7-20 digits)
const phoneRegex = /^[+]?[(]?[0-9]{1,4}[)]?[-\s./0-9]{6,20}$/;

/**
 * Validation schema for creating a new lead
 * (Public endpoint - no authentication required)
 */
export const createLeadSchema = Joi.object({
  firstName: Joi.string()
    .trim()
    .min(1)
    .max(100)
    .required()
    .messages({
      "any.required": "First name is required",
      "string.empty": "First name cannot be empty",
      "string.max": "First name cannot exceed 100 characters",
    }),

  lastName: Joi.string()
    .trim()
    .min(1)
    .max(100)
    .required()
    .messages({
      "any.required": "Last name is required",
      "string.empty": "Last name cannot be empty",
      "string.max": "Last name cannot exceed 100 characters",
    }),

  email: Joi.string()
    .trim()
    .lowercase()
    .email({ tlds: { allow: false } })
    .max(100)
    .optional()
    .allow("", null)
    .messages({
      "string.email": "Please provide a valid email address",
      "string.max": "Email cannot exceed 100 characters",
    }),

  phone: Joi.string()
    .trim()
    .pattern(phoneRegex)
    .required()
    .messages({
      "any.required": "Phone number is required",
      "string.empty": "Phone number cannot be empty",
      "string.pattern.base": "Please provide a valid phone number (7 to 20 digits, optional country code)",
    }),

  type: Joi.string()
    .trim()
    .max(100)
    .optional()
    .allow("", null)
    .messages({
      "string.max": "Lead type cannot exceed 100 characters",
    }),

  travelToCountry: Joi.string()
    .trim()
    .max(100)
    .optional()
    .allow("", null)
    .messages({
      "string.max": "Travel to country cannot exceed 100 characters",
    }),

  member: Joi.number()
    .integer()
    .min(1)
    .optional()
    .allow(null)
    .messages({
      "number.base": "Member count must be a number",
      "number.min": "Member count must be at least 1",
    }),

  groupMember: Joi.number()
    .integer()
    .min(1)
    .optional()
    .allow(null)
    .messages({
      "number.base": "Group member count must be a number",
      "number.min": "Group member count must be at least 1",
    }),

  message: Joi.string()
    .trim()
    .max(2000)
    .optional()
    .allow("", null)
    .messages({
      "string.max": "Message cannot exceed 2000 characters",
    }),

  timeToRevertBack: Joi.string()
    .trim()
    .max(150)
    .optional()
    .allow("", null)
    .messages({
      "string.max": "Time to revert back cannot exceed 150 characters",
    }),

  howCanWeAssist: Joi.string()
    .trim()
    .max(1000)
    .optional()
    .allow("", null)
    .messages({
      "string.max": "How can we assist details cannot exceed 1000 characters",
    }),
});

/**
 * Validation schema for updating an existing lead
 */
export const updateLeadSchema = Joi.object({
  firstName: Joi.string()
    .trim()
    .min(1)
    .max(100)
    .optional()
    .messages({
      "string.empty": "First name cannot be empty",
      "string.max": "First name cannot exceed 100 characters",
    }),

  lastName: Joi.string()
    .trim()
    .min(1)
    .max(100)
    .optional()
    .messages({
      "string.empty": "Last name cannot be empty",
      "string.max": "Last name cannot exceed 100 characters",
    }),

  email: Joi.string()
    .trim()
    .lowercase()
    .email({ tlds: { allow: false } })
    .max(100)
    .optional()
    .allow("", null)
    .messages({
      "string.email": "Please provide a valid email address",
      "string.max": "Email cannot exceed 100 characters",
    }),

  phone: Joi.string()
    .trim()
    .pattern(phoneRegex)
    .optional()
    .messages({
      "string.empty": "Phone number cannot be empty",
      "string.pattern.base": "Please provide a valid phone number (7 to 20 digits, optional country code)",
    }),

  type: Joi.string()
    .trim()
    .max(100)
    .optional()
    .allow("", null)
    .messages({
      "string.max": "Lead type cannot exceed 100 characters",
    }),

  travelToCountry: Joi.string()
    .trim()
    .max(100)
    .optional()
    .allow("", null)
    .messages({
      "string.max": "Travel to country cannot exceed 100 characters",
    }),

  member: Joi.number()
    .integer()
    .min(1)
    .optional()
    .allow(null)
    .messages({
      "number.base": "Member count must be a number",
      "number.min": "Member count must be at least 1",
    }),

  groupMember: Joi.number()
    .integer()
    .min(1)
    .optional()
    .allow(null)
    .messages({
      "number.base": "Group member count must be a number",
      "number.min": "Group member count must be at least 1",
    }),

  message: Joi.string()
    .trim()
    .max(2000)
    .optional()
    .allow("", null)
    .messages({
      "string.max": "Message cannot exceed 2000 characters",
    }),

  timeToRevertBack: Joi.string()
    .trim()
    .max(150)
    .optional()
    .allow("", null)
    .messages({
      "string.max": "Time to revert back cannot exceed 150 characters",
    }),

  howCanWeAssist: Joi.string()
    .trim()
    .max(1000)
    .optional()
    .allow("", null)
    .messages({
      "string.max": "How can we assist details cannot exceed 1000 characters",
    }),
});

/**
 * Validation schema for query parameters when fetching leads
 */
export const getLeadsQuerySchema = Joi.object({
  page: Joi.number()
    .integer()
    .min(1)
    .default(1)
    .messages({
      "number.base": "Page must be a valid number",
      "number.min": "Page must be greater than or equal to 1",
    }),

  limit: Joi.number()
    .integer()
    .min(1)
    .max(100)
    .default(10)
    .messages({
      "number.base": "Limit must be a valid number",
      "number.min": "Limit must be at least 1",
      "number.max": "Limit cannot exceed 100",
    }),

  search: Joi.string().trim().optional().allow("", null),
  q: Joi.string().trim().optional().allow("", null),

  type: Joi.string().trim().optional().allow("", null),
  travelToCountry: Joi.string().trim().optional().allow("", null),
  email: Joi.string().trim().optional().allow("", null),
  phone: Joi.string().trim().optional().allow("", null),
  firstName: Joi.string().trim().optional().allow("", null),
  lastName: Joi.string().trim().optional().allow("", null),

  sortBy: Joi.string()
    .valid(...ALLOWED_SORT_FIELDS)
    .optional()
    .allow("", null)
    .default("createdAt")
    .messages({
      "any.only": `sortBy must be one of: ${ALLOWED_SORT_FIELDS.join(", ")}`,
    }),

  sortOrder: Joi.string()
    .valid("asc", "desc", "1", "-1")
    .optional()
    .allow("", null)
    .default("desc")
    .messages({
      "any.only": "sortOrder must be 'asc', 'desc', '1', or '-1'",
    }),
}).unknown(true);

export default {
  createLeadSchema,
  updateLeadSchema,
  getLeadsQuerySchema,
};
