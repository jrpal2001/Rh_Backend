import { asyncHandler } from "../../utils/async-handler.js";
import response from "../../utils/response.util.js";
import {
  createChecklistService,
  getAllChecklistsService,
  getChecklistByIdService,
  updateChecklistService,
  deleteChecklistService,
  createDocService,
  getAllDocsService,
  getDocByIdService,
  updateDocService,
  deleteDocService,
} from "./masterForm.service.js";

// ============================================================================
// Checklist Controllers
// ============================================================================

/**
 * Create a new checklist
 */
export const createChecklist = asyncHandler(async (req, res) => {
  const result = await createChecklistService(req.body);
  return response.created(res, result.message, result.data);
});

/**
 * Display all checklists (supports search, isActive filter, pagination, all=true)
 */
export const getAllChecklists = asyncHandler(async (req, res) => {
  const result = await getAllChecklistsService(req.query);
  return response.success(res, result.message, result.data);
});

/**
 * Display single checklist by ID
 */
export const getChecklistById = asyncHandler(async (req, res) => {
  const result = await getChecklistByIdService(req.params.id);
  return response.success(res, result.message, result.data);
});

/**
 * Edit / Update checklist by ID
 */
export const updateChecklist = asyncHandler(async (req, res) => {
  const result = await updateChecklistService(req.params.id, req.body);
  return response.success(res, result.message, result.data);
});

/**
 * Delete checklist by ID
 */
export const deleteChecklist = asyncHandler(async (req, res) => {
  const result = await deleteChecklistService(req.params.id);
  return response.success(res, result.message, result.data);
});

// ============================================================================
// Docs Controllers
// ============================================================================

/**
 * Create a new doc
 */
export const createDoc = asyncHandler(async (req, res) => {
  const result = await createDocService(req.body);
  return response.created(res, result.message, result.data);
});

/**
 * Display all docs (supports search, isActive filter, pagination, all=true)
 */
export const getAllDocs = asyncHandler(async (req, res) => {
  const result = await getAllDocsService(req.query);
  return response.success(res, result.message, result.data);
});

/**
 * Display single doc by ID
 */
export const getDocById = asyncHandler(async (req, res) => {
  const result = await getDocByIdService(req.params.id);
  return response.success(res, result.message, result.data);
});

/**
 * Edit / Update doc by ID
 */
export const updateDoc = asyncHandler(async (req, res) => {
  const result = await updateDocService(req.params.id, req.body);
  return response.success(res, result.message, result.data);
});

/**
 * Delete doc by ID
 */
export const deleteDoc = asyncHandler(async (req, res) => {
  const result = await deleteDocService(req.params.id);
  return response.success(res, result.message, result.data);
});

export default {
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
};
