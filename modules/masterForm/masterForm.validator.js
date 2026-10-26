import Joi from "joi";
import { CHECKLIST_SORT_FIELDS, DOCS_SORT_FIELDS } from "./masterForm.constants.js";

// ============================================================================
// Checklist Validators
// ============================================================================

/**
 * Validation schema for creating a checklist
 */
export const createChecklistSchema = Joi.object({
  title: Joi.string()
    .trim()
    .min(1)
    .max(250)
    .required()
    .messages({
      "any.required": "Checklist title is required",
      "string.empty": "Checklist title cannot be empty",
      "string.min": "Checklist title must have at least 1 character",
      "string.max": "Checklist title cannot exceed 250 characters",
    }),

  isActive: Joi.boolean().default(true).optional(),
});

/**
 * Validation schema for editing/updating a checklist
 */
export const updateChecklistSchema = Joi.object({
  title: Joi.string()
    .trim()
    .min(1)
    .max(250)
    .optional()
    .messages({
      "string.empty": "Checklist title cannot be empty",
      "string.min": "Checklist title must have at least 1 character",
      "string.max": "Checklist title cannot exceed 250 characters",
    }),

  isActive: Joi.boolean().optional(),
})
  .min(1)
  .messages({
    "object.min": "At least one field (title, isActive) is required to update",
  });

/**
 * Validation schema for querying/displaying checklists
 */
export const getChecklistQuerySchema = Joi.object({
  search: Joi.string().trim().allow("", null).optional(),
  q: Joi.string().trim().allow("", null).optional(),
  isActive: Joi.alternatives()
    .try(Joi.boolean(), Joi.string().valid("true", "false", "all"))
    .optional(),
  page: Joi.number().integer().min(1).default(1).optional(),
  limit: Joi.number().integer().min(1).max(200).default(10).optional(),
  all: Joi.alternatives()
    .try(Joi.boolean(), Joi.string().valid("true", "false"))
    .optional(),
  sortBy: Joi.string()
    .valid(...CHECKLIST_SORT_FIELDS)
    .default("createdAt")
    .optional(),
  sortOrder: Joi.string().valid("asc", "desc").default("desc").optional(),
});

// ============================================================================
// Docs Validators
// ============================================================================

/**
 * Validation schema for creating a doc
 */
export const createDocsSchema = Joi.object({
  documentName: Joi.string()
    .trim()
    .min(1)
    .max(250)
    .required()
    .messages({
      "any.required": "Document name is required",
      "string.empty": "Document name cannot be empty",
      "string.min": "Document name must have at least 1 character",
      "string.max": "Document name cannot exceed 250 characters",
    }),

  isActive: Joi.boolean().default(true).optional(),
});

/**
 * Validation schema for editing/updating a doc
 */
export const updateDocsSchema = Joi.object({
  documentName: Joi.string()
    .trim()
    .min(1)
    .max(250)
    .optional()
    .messages({
      "string.empty": "Document name cannot be empty",
      "string.min": "Document name must have at least 1 character",
      "string.max": "Document name cannot exceed 250 characters",
    }),

  isActive: Joi.boolean().optional(),
})
  .min(1)
  .messages({
    "object.min": "At least one field (documentName, isActive) is required to update",
  });

/**
 * Validation schema for querying/displaying docs
 */
export const getDocsQuerySchema = Joi.object({
  search: Joi.string().trim().allow("", null).optional(),
  q: Joi.string().trim().allow("", null).optional(),
  isActive: Joi.alternatives()
    .try(Joi.boolean(), Joi.string().valid("true", "false", "all"))
    .optional(),
  page: Joi.number().integer().min(1).default(1).optional(),
  limit: Joi.number().integer().min(1).max(200).default(10).optional(),
  all: Joi.alternatives()
    .try(Joi.boolean(), Joi.string().valid("true", "false"))
    .optional(),
  sortBy: Joi.string()
    .valid(...DOCS_SORT_FIELDS)
    .default("createdAt")
    .optional(),
  sortOrder: Joi.string().valid("asc", "desc").default("desc").optional(),
});

export default {
  createChecklistSchema,
  updateChecklistSchema,
  getChecklistQuerySchema,
  createDocsSchema,
  updateDocsSchema,
  getDocsQuerySchema,
};
