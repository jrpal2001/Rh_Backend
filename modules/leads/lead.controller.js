import { asyncHandler } from "../../utils/async-handler.js";
import response from "../../utils/response.util.js";
import {
  createLeadService,
  getAllLeadsService,
  getLeadByIdService,
  updateLeadService,
  deleteLeadService,
} from "./lead.service.js";

/**
 * Create a new lead
 * (Public endpoint - no authentication required)
 */
export const createLead = asyncHandler(async (req, res) => {
  const result = await createLeadService(req.body);
  return response.created(res, result.message, result.data);
});

/**
 * Display all leads with pagination, filtering, searching, and sorting
 * (Super Admin only)
 */
export const getAllLeads = asyncHandler(async (req, res) => {
  const result = await getAllLeadsService(req.query);
  return response.success(res, result.message, result.data);
});

/**
 * Display single lead details by ID
 * (Super Admin only)
 */
export const getLeadById = asyncHandler(async (req, res) => {
  const result = await getLeadByIdService(req.params.id);
  return response.success(res, result.message, result.data);
});

/**
 * Edit / Update an existing lead
 * (Super Admin only)
 */
export const updateLead = asyncHandler(async (req, res) => {
  const result = await updateLeadService(req.params.id, req.body);
  return response.success(res, result.message, result.data);
});

/**
 * Delete lead by ID
 * (Super Admin only)
 */
export const deleteLead = asyncHandler(async (req, res) => {
  const result = await deleteLeadService(req.params.id);
  return response.success(res, result.message, result.data);
});

export default {
  createLead,
  getAllLeads,
  getLeadById,
  updateLead,
  deleteLead,
};
