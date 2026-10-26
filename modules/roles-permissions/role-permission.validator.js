import Joi from "joi";
import { AVAILABLE_PERMISSIONS } from "./role-permission.constants.js";

const phoneRegex = /^[+]?[(]?[0-9]{1,4}[)]?[-\s./0-9]{6,15}$/;
const objectIdRegex = /^[0-9a-fA-F]{24}$/;

export const createStaffRoleSchema = Joi.object({
  subAdminId: Joi.string().trim().optional(),
  name: Joi.string().trim().min(2).max(100).required().messages({
    "any.required": "Name is required",
    "string.empty": "Name cannot be empty",
  }),
  email: Joi.string().trim().lowercase().email().required().messages({
    "any.required": "Email is required",
    "string.email": "Please provide a valid email address",
  }),
  phone: Joi.string().trim().pattern(phoneRegex).allow("", null).optional(),
  profileImage: Joi.string().trim().allow("", null).optional(),
  role: Joi.string().trim().default("STAFF"),
  permissions: Joi.array().items(Joi.string().trim()).default([]),
  status: Joi.string().valid("active", "inactive").default("active"),
});

export const updateStaffRoleSchema = Joi.object({
  subAdminId: Joi.string().trim().optional(),
  name: Joi.string().trim().min(2).max(100).optional(),
  email: Joi.string().trim().lowercase().email().optional(),
  phone: Joi.string().trim().pattern(phoneRegex).allow("", null).optional(),
  profileImage: Joi.string().trim().allow("", null).optional(),
  role: Joi.string().trim().optional(),
  permissions: Joi.array().items(Joi.string().trim()).optional(),
  status: Joi.string().valid("active", "inactive").optional(),
}).min(1);

export const assignTaskSchema = Joi.object({
  staffId: Joi.string().pattern(objectIdRegex).required().messages({
    "any.required": "staffId is required",
    "string.pattern.base": "Invalid staffId format",
  }),
  applicationType: Joi.string().valid("booking", "visa").required().messages({
    "any.required": "applicationType is required (booking or visa)",
  }),
  applicationId: Joi.string().pattern(objectIdRegex).required().messages({
    "any.required": "applicationId is required",
    "string.pattern.base": "Invalid applicationId format",
  }),
});

export const unassignTaskSchema = Joi.object({
  staffId: Joi.string().pattern(objectIdRegex).optional(),
  applicationType: Joi.string().valid("booking", "visa").required().messages({
    "any.required": "applicationType is required (booking or visa)",
  }),
  remarks: Joi.string().trim().allow("", null).optional(),
});

export const updateApplicationStatusSchema = Joi.object({
  applicationType: Joi.string().valid("booking", "visa").required(),
  applicationId: Joi.string().pattern(objectIdRegex).required(),
  status: Joi.string().required().messages({
    "any.required": "status is required",
  }),
  remarks: Joi.string().trim().allow("", null).optional(),
});

export const getRolesPermissionsQuerySchema = Joi.object({
  page: Joi.number().integer().min(1).default(1),
  limit: Joi.number().integer().min(1).max(100).default(10),
  search: Joi.string().trim().allow("").optional(),
  status: Joi.string().valid("active", "inactive", "all").optional(),
});

export default {
  createStaffRoleSchema,
  updateStaffRoleSchema,
  assignTaskSchema,
  unassignTaskSchema,
  updateApplicationStatusSchema,
  getRolesPermissionsQuerySchema,
};
