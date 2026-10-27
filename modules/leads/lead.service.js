import mongoose from "mongoose";
import BadRequestError from "../../shared/errors/bad-request.error.js";
import NotFoundError from "../../shared/errors/not-found.error.js";
import { getPagination, formatPaginatedResult } from "../../utils/pagination.util.js";
import {
  createLead,
  findLeadById,
  findAllLeads,
  countLeads,
  updateLeadById,
  deleteLeadById,
} from "./lead.repository.js";
import { ALLOWED_SORT_FIELDS } from "./lead.constants.js";

/**
 * Escape regex special characters to prevent regex injection or syntax errors
 * @param {string} text
 */
const escapeRegex = (text) => {
  return text.replace(/[-[\]{}()*+?.,\\^$|#\s]/g, "\\$&");
};

/**
 * Create a new lead
 * (Public endpoint - no authentication required)
 * @param {object} leadData
 */
export const createLeadService = async (leadData) => {
  const payload = {
    ...leadData,
  };

  if (payload.email) {
    payload.email = payload.email.toLowerCase().trim();
  }

  const newLead = await createLead(payload);

  return {
    message: "Lead submitted successfully",
    data: newLead,
  };
};

/**
 * Retrieve all leads with pagination, filtering, searching, and sorting
 * (Super Admin only)
 * @param {object} query
 */
export const getAllLeadsService = async (query = {}) => {
  const { page, limit, skip } = getPagination(query, 10);
  const filter = {};

  // Universal search across firstName, lastName, email, phone, type, travelToCountry, message, howCanWeAssist
  const searchTerm = (query.search || query.q || "").trim();
  if (searchTerm) {
    const searchRegex = new RegExp(escapeRegex(searchTerm), "i");
    filter.$or = [
      { firstName: searchRegex },
      { lastName: searchRegex },
      { email: searchRegex },
      { phone: searchRegex },
      { type: searchRegex },
      { travelToCountry: searchRegex },
      { message: searchRegex },
      { howCanWeAssist: searchRegex },
    ];
  }

  // Filter by lead type
  if (query.type && query.type.trim()) {
    filter.type = new RegExp(escapeRegex(query.type.trim()), "i");
  }

  // Filter by travel to country
  if (query.travelToCountry && query.travelToCountry.trim()) {
    filter.travelToCountry = new RegExp(escapeRegex(query.travelToCountry.trim()), "i");
  }

  // Filter by email
  if (query.email && query.email.trim()) {
    filter.email = new RegExp(escapeRegex(query.email.trim()), "i");
  }

  // Filter by phone
  if (query.phone && query.phone.trim()) {
    filter.phone = new RegExp(escapeRegex(query.phone.trim()), "i");
  }

  // Filter by first name
  if (query.firstName && query.firstName.trim()) {
    filter.firstName = new RegExp(escapeRegex(query.firstName.trim()), "i");
  }

  // Filter by last name
  if (query.lastName && query.lastName.trim()) {
    filter.lastName = new RegExp(escapeRegex(query.lastName.trim()), "i");
  }

  // Determine sorting
  let sortBy = "createdAt";
  if (query.sortBy && ALLOWED_SORT_FIELDS.includes(query.sortBy.trim())) {
    sortBy = query.sortBy.trim();
  }

  const isAscending =
    query.sortOrder === "asc" ||
    query.sortOrder === "1" ||
    query.sortOrder === 1;
  const sortDirection = isAscending ? 1 : -1;
  const sort = { [sortBy]: sortDirection };

  // Fetch paginated leads and total count in parallel
  const [leads, total] = await Promise.all([
    findAllLeads({ filter, sort, skip, limit }),
    countLeads(filter),
  ]);

  const paginatedResult = formatPaginatedResult(leads, total, page, limit);

  return {
    message: "Leads retrieved successfully",
    data: paginatedResult,
  };
};

/**
 * Retrieve single lead details by ID
 * (Super Admin only)
 * @param {string} id
 */
export const getLeadByIdService = async (id) => {
  if (!mongoose.Types.ObjectId.isValid(id)) {
    throw new BadRequestError("Invalid lead ID format");
  }

  const lead = await findLeadById(id);
  if (!lead) {
    throw new NotFoundError("Lead not found");
  }

  return {
    message: "Lead retrieved successfully",
    data: lead,
  };
};

/**
 * Update an existing lead by ID
 * (Super Admin only)
 * @param {string} id
 * @param {object} updateData
 */
export const updateLeadService = async (id, updateData) => {
  if (!mongoose.Types.ObjectId.isValid(id)) {
    throw new BadRequestError("Invalid lead ID format");
  }

  const existingLead = await findLeadById(id);
  if (!existingLead) {
    throw new NotFoundError("Lead not found");
  }

  const payload = { ...updateData };
  if (payload.email) {
    payload.email = payload.email.toLowerCase().trim();
  }

  const updatedLead = await updateLeadById(id, payload);

  return {
    message: "Lead updated successfully",
    data: updatedLead,
  };
};

/**
 * Delete a lead by ID
 * (Super Admin only)
 * @param {string} id
 */
export const deleteLeadService = async (id) => {
  if (!mongoose.Types.ObjectId.isValid(id)) {
    throw new BadRequestError("Invalid lead ID format");
  }

  const existingLead = await findLeadById(id);
  if (!existingLead) {
    throw new NotFoundError("Lead not found");
  }

  const deletedLead = await deleteLeadById(id);

  return {
    message: "Lead deleted successfully",
    data: deletedLead,
  };
};

export default {
  createLeadService,
  getAllLeadsService,
  getLeadByIdService,
  updateLeadService,
  deleteLeadService,
};
