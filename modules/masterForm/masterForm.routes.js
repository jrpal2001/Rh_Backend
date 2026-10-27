import express from "express";
import validate from "../../middlewares/validate.middleware.js";
import authenticate from "../../middlewares/authenticate.middleware.js";
import authorize from "../../middlewares/authorize.middleware.js";
import Roles from "../../shared/constants/roles.constants.js";
import {
  createChecklistSchema,
  updateChecklistSchema,
  getChecklistQuerySchema,
  createDocsSchema,
  updateDocsSchema,
  getDocsQuerySchema,
} from "./masterForm.validator.js";
import {
  createChecklist,
  getAllChecklists,
  getChecklistById,
  updateChecklist,
  deleteChecklist,
  createDoc,
  getAllDocs,
  getDocById,
  updateDoc,
  deleteDoc,
} from "./masterForm.controller.js";

const router = express.Router();

// ============================================================================
// Checklist Routes
// ============================================================================

/**
 * Display all checklists (supports search, isActive filter, pagination, all=true)
 * Accessible directly in browser & frontend dropdowns
 */
router.get(
  ["/checklist"],
  validate(getChecklistQuerySchema, "query"),
  getAllChecklists
);

/**
 * Display single checklist by ID
 */
router.get(["/checklist/:id"], getChecklistById);

/**
 * Create a new checklist
 * (Super Admin & Staff only)
 */
router.post(
  ["/checklist"],
  authenticate,
  authorize(Roles.SUPER_ADMIN, Roles.STAFF),
  validate(createChecklistSchema),
  createChecklist
);

/**
 * Edit / Update checklist by ID
 * (Super Admin & Staff only)
 */
router.patch(
  ["/checklist/:id"],
  authenticate,
  authorize(Roles.SUPER_ADMIN, Roles.STAFF),
  validate(updateChecklistSchema),
  updateChecklist
);

router.put(
  ["/checklist/:id"],
  authenticate,
  authorize(Roles.SUPER_ADMIN, Roles.STAFF),
  validate(updateChecklistSchema),
  updateChecklist
);

/**
 * Delete checklist by ID
 * (Super Admin & Staff only)
 */
router.delete(
  ["/checklist/:id"],
  authenticate,
  authorize(Roles.SUPER_ADMIN, Roles.STAFF),
  deleteChecklist
);

// ============================================================================
// Docs Routes
// ============================================================================

/**
 * Display all documents (supports search, isActive filter, pagination, all=true)
 * Accessible directly in browser & frontend dropdowns
 */
router.get(
  ["/docs"],
  validate(getDocsQuerySchema, "query"),
  getAllDocs
);

/**
 * Display single document by ID
 */
router.get(["/docs/:id"], getDocById);

/**
 * Create a new document
 * (Super Admin & Staff only)
 */
router.post(
  ["/docs"],
  authenticate,
  authorize(Roles.SUPER_ADMIN, Roles.STAFF),
  validate(createDocsSchema),
  createDoc
);

/**
 * Edit / Update document by ID
 * (Super Admin & Staff only)
 */
router.patch(
  ["/docs/:id"],
  authenticate,
  authorize(Roles.SUPER_ADMIN, Roles.STAFF),
  validate(updateDocsSchema),
  updateDoc
);

router.put(
  ["/docs/:id"],
  authenticate,
  authorize(Roles.SUPER_ADMIN, Roles.STAFF),
  validate(updateDocsSchema),
  updateDoc
);

/**
 * Delete document by ID
 * (Super Admin & Staff only)
 */
router.delete(
  ["/docs/:id"],
  authenticate,
  authorize(Roles.SUPER_ADMIN, Roles.STAFF),
  deleteDoc
);

export default router;
