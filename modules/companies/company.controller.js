import { asyncHandler } from "../../utils/async-handler.js";
import response from "../../utils/response.util.js";
import {
  getAllCompaniesService,
  getCompanyByIdService,
  createCompanyService,
  updateCompanyService,
  deleteCompanyService,
} from "./company.service.js";

/**
 * Display all companies with pagination, filtering, searching, and sorting
 * (Super Admin only)
 */
export const getAllCompanies = asyncHandler(async (req, res) => {
  const result = await getAllCompaniesService(req.query);
  return response.success(res, result.message, result.data);
});

/**
 * Display company full details by ID
 * (Super Admin only)
 */
export const getCompanyById = asyncHandler(async (req, res) => {
  const result = await getCompanyByIdService(req.params.id);
  return response.success(res, result.message, result.data);
});

/**
 * Create a new company
 * (Super Admin only)
 */
export const createCompany = asyncHandler(async (req, res) => {
  const result = await createCompanyService(req.body);
  return response.created(res, result.message, result.data);
});

/**
 * Edit / Update an existing company
 * (Super Admin only)
 */
export const updateCompany = asyncHandler(async (req, res) => {
  const result = await updateCompanyService(req.params.id, req.body);
  return response.success(res, result.message, result.data);
});

/**
 * Delete company by ID
 * (Super Admin only)
 */
export const deleteCompany = asyncHandler(async (req, res) => {
  const result = await deleteCompanyService(req.params.id);
  return response.success(res, result.message, result.data);
});

export default {
  getAllCompanies,
  getCompanyById,
  createCompany,
  updateCompany,
  deleteCompany,
};
