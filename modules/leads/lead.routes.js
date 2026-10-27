import express from "express";
import validate from "../../middlewares/validate.middleware.js";
import authenticate from "../../middlewares/authenticate.middleware.js";
import authorize from "../../middlewares/authorize.middleware.js";
import Roles from "../../shared/constants/roles.constants.js";
import {
  createLeadSchema,
  updateLeadSchema,
  getLeadsQuerySchema,
} from "./lead.validator.js";
import {
  createLead,
  getAllLeads,
  getLeadById,
  updateLead,
  deleteLead,
} from "./lead.controller.js";

const router = express.Router();

// ============================================================================
// Public Lead Routes (No Authentication Required)
// ============================================================================

/**
 * Create a new lead (Public endpoint - Contact Form / Landing Page)
 */
router.post(
  "/",
  validate(createLeadSchema),
  createLead
);

// ============================================================================
// Super Admin Protected Lead Management Routes
// ============================================================================

/**
 * Display all leads with pagination, filtering, searching, and sorting
 * (Super Admin only)
 */
router.get(
  "/",
  authenticate,
  authorize(Roles.SUPER_ADMIN),
  validate(getLeadsQuerySchema, "query"),
  getAllLeads
);

/**
 * Display single lead by ID
 * (Super Admin only)
 */
router.get(
  "/:id",
  authenticate,
  authorize(Roles.SUPER_ADMIN),
  getLeadById
);

/**
 * Edit / Update lead by ID (PATCH and PUT supported)
 * (Super Admin only)
 */
router.patch(
  "/:id",
  authenticate,
  authorize(Roles.SUPER_ADMIN),
  validate(updateLeadSchema),
  updateLead
);

router.put(
  "/:id",
  authenticate,
  authorize(Roles.SUPER_ADMIN),
  validate(updateLeadSchema),
  updateLead
);

/**
 * Delete lead by ID
 * (Super Admin only)
 */
router.delete(
  "/:id",
  authenticate,
  authorize(Roles.SUPER_ADMIN),
  deleteLead
);

export default router;