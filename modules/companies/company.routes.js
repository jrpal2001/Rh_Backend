import express from "express";
import authenticate from "../../middlewares/authenticate.middleware.js";
import authorize from "../../middlewares/authorize.middleware.js";
import validate from "../../middlewares/validate.middleware.js";
import Roles from "../../shared/constants/roles.constants.js";
import { uploadS3Image } from "../../middlewares/upload.middleware.js";
import {
  createCompanySchema,
  updateCompanySchema,
  getCompaniesQuerySchema,
} from "./company.validator.js";
import {
  getAllCompanies,
  getCompanyById,
  createCompany,
  updateCompany,
  deleteCompany,
} from "./company.controller.js";

const router = express.Router();

// ============================================================================
// Super Admin Company Management Routes
// ============================================================================

/**
 * Display all companies with pagination, filtering, searching, and sorting
 * Filtering options: contact no (phone), email, country, regDetails, status (active/inactive)
 * Search: contact no, email, country, regDetails, name, contactPersonName
 * Sorting: sortBy (createdAt, name, email, country, etc.) & sortOrder (asc/desc)
 */
router.get(
  "/",
  authenticate,
  authorize(Roles.SUPER_ADMIN),
  validate(getCompaniesQuerySchema, "query"),
  getAllCompanies
);

/**
 * Display company full details by ID
 */
router.get(
  "/:id",
  authenticate,
  authorize(Roles.SUPER_ADMIN),
  getCompanyById
);

/**
 * Create a new company
 * Supports logo file upload via multipart/form-data or logo URL in JSON
 */
router.post(
  "/",
  authenticate,
  authorize(Roles.SUPER_ADMIN),
  uploadS3Image("logo", "companies"),
  validate(createCompanySchema),
  createCompany
);

/**
 * Edit company details
 * Supports updating name, email, phone, address, status, logo, contactPersonName, regDetails, country
 */
router.patch(
  "/:id",
  authenticate,
  authorize(Roles.SUPER_ADMIN),
  uploadS3Image("logo", "companies"),
  validate(updateCompanySchema),
  updateCompany
);

router.put(
  "/:id",
  authenticate,
  authorize(Roles.SUPER_ADMIN),
  uploadS3Image("logo", "companies"),
  validate(updateCompanySchema),
  updateCompany
);

/**
 * Delete company by ID
 * (Super Admin only)
 */
router.delete(
  "/:id",
  authenticate,
  authorize(Roles.SUPER_ADMIN),
  deleteCompany
);

export default router;
