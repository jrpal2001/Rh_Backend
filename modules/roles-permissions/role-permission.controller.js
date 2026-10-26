import { asyncHandler } from "../../utils/async-handler.js";
import response from "../../utils/response.util.js";
import {
  getAllStaffRolesService,
  getStaffRoleByIdService,
  createStaffRoleService,
  updateStaffRoleService,
  deleteStaffRoleService,
  assignTaskService,
  unassignTaskService,
  handleApplicationStatusChangeService,
  getStaffHistoryService,
} from "./role-permission.service.js";

/**
 * Get all staff roles & permissions (paginated, searchable)
 */
export const getAllStaffRoles = asyncHandler(async (req, res) => {
  const result = await getAllStaffRolesService(req.query);
  console.log(result, "result")
  return response.success(res, result.message, result.data);
});

/**
 * Get single staff role & permissions by ID
 */
export const getStaffRoleById = asyncHandler(async (req, res) => {
  const result = await getStaffRoleByIdService(req.params.id);
  return response.success(res, result.message, result.data);
});

/**
 * Create a new staff role / subadmin
 */
export const createStaffRole = asyncHandler(async (req, res) => {
  const result = await createStaffRoleService(req.body);
  return response.created(res, result.message, result.data);
});

/**
 * Update staff role, permissions, status, details
 */
export const updateStaffRole = asyncHandler(async (req, res) => {
  const result = await updateStaffRoleService(req.params.id, req.body);
  return response.success(res, result.message, result.data);
});

/**
 * Permanently delete a staff role from the database
 */
export const deleteStaffRole = asyncHandler(async (req, res) => {
  const result = await deleteStaffRoleService(req.params.id);
  return response.success(res, result.message, result.data);
});

/**
 * Assign task (booking or visa) to staff member
 */
export const assignTask = asyncHandler(async (req, res) => {
  const result = await assignTaskService(req.body);
  return response.success(res, result.message, result.data);
});

/**
 * Unassign task from staff member & record in history
 */
export const unassignTask = asyncHandler(async (req, res) => {
  const result = await unassignTaskService(req.params.id, req.body);
  return response.success(res, result.message, result.data);
});

/**
 * Update application status (if completed or rejected, auto archives to staffAssignHistory)
 */
export const updateApplicationStatus = asyncHandler(async (req, res) => {
  const result = await handleApplicationStatusChangeService(req.body);
  return response.success(res, result.message, result.data);
});

/**
 * Get staff assignment history log
 */
export const getStaffHistory = asyncHandler(async (req, res) => {
  const result = await getStaffHistoryService(req.query);
  return response.success(res, result.message, result.data);
});

export default {
  getAllStaffRoles,
  getStaffRoleById,
  createStaffRole,
  updateStaffRole,
  deleteStaffRole,
  assignTask,
  unassignTask,
  updateApplicationStatus,
  getStaffHistory,
};
