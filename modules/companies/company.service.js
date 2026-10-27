import mongoose from "mongoose";
import BadRequestError from "../../shared/errors/bad-request.error.js";
import NotFoundError from "../../shared/errors/not-found.error.js";
import { getPagination, formatPaginatedResult } from "../../utils/pagination.util.js";
import {
  findCompanyById,
  findCompanyByEmail,
  findAllCompanies,
  countCompanies,
  createCompany,
  updateCompany,
  deleteCompanyById,
  softDeleteCompany,
} from "./company.repository.js";
import { ALLOWED_SORT_FIELDS } from "./company.constants.js";

/**
 * Escape regex special characters to prevent regex injection or syntax errors
 * @param {string} text
 */
const escapeRegex = (text) => {
  return text.replace(/[-[\]{}()*+?.,\\^$|#\s]/g, "\\$&");
};

/**
 * Retrieve all companies with pagination, filtering, searching, and sorting
 * @param {object} query
 */
export const getAllCompaniesService = async (query = {}) => {
  const { page, limit, skip } = getPagination(query, 10);
  const filter = {};

  // Universal search across contact no (phone), email, country, regDetails, name, contactPersonName
  const searchTerm = (query.search || query.q || "").trim();
  if (searchTerm) {
    const searchRegex = new RegExp(escapeRegex(searchTerm), "i");
    filter.$or = [
      { name: searchRegex },
      { email: searchRegex },
      { phone: searchRegex },
      { country: searchRegex },
      { regDetails: searchRegex },
      { contactPersonName: searchRegex },
    ];
  }

  // Filter by status (active / inactive / all)
  if (query.status && query.status !== "all") {
    filter.status = query.status.toLowerCase().trim();
  }

  // Filter by contact number / phone
  const contactNo = (query.contactNo || query.phone || "").trim();
  if (contactNo) {
    filter.phone = new RegExp(escapeRegex(contactNo), "i");
  }

  // Filter by email
  if (query.email && query.email.trim()) {
    filter.email = new RegExp(escapeRegex(query.email.trim()), "i");
  }

  // Filter by country
  if (query.country && query.country.trim()) {
    filter.country = new RegExp(escapeRegex(query.country.trim()), "i");
  }

  // Filter by registration details
  const regDetails = (query.regDetails || query.registrationDetails || "").trim();
  if (regDetails) {
    filter.regDetails = new RegExp(escapeRegex(regDetails), "i");
  }

  // Filter by company name
  if (query.name && query.name.trim()) {
    filter.name = new RegExp(escapeRegex(query.name.trim()), "i");
  }

  // Filter by contact person name
  if (query.contactPersonName && query.contactPersonName.trim()) {
    filter.contactPersonName = new RegExp(escapeRegex(query.contactPersonName.trim()), "i");
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

  // Fetch paginated companies and total count in parallel
  const [companies, total] = await Promise.all([
    findAllCompanies({ filter, sort, skip, limit }),
    countCompanies(filter),
  ]);

  const paginatedResult = formatPaginatedResult(companies, total, page, limit);

  return {
    message: "Companies retrieved successfully",
    data: paginatedResult,
  };
};

/**
 * Retrieve company full details by ID
 * @param {string} id
 */
export const getCompanyByIdService = async (id) => {
  if (!mongoose.Types.ObjectId.isValid(id)) {
    throw new BadRequestError("Invalid company ID format");
  }

  const company = await findCompanyById(id);
  if (!company) {
    throw new NotFoundError("Company not found");
  }

  return {
    message: "Company details retrieved successfully",
    data: company,
  };
};

/**
 * Create a new company
 * @param {object} companyData
 */
export const createCompanyService = async (companyData) => {
  const normalizedEmail = (companyData.email || "").toLowerCase().trim();

  const existingCompany = await findCompanyByEmail(normalizedEmail);
  if (existingCompany) {
    throw new BadRequestError("A company with this email already exists");
  }

  const payload = {
    ...companyData,
    email: normalizedEmail,
  };

  const newCompany = await createCompany(payload);

  return {
    message: "Company created successfully",
    data: newCompany,
  };
};

/**
 * Update an existing company
 * @param {string} id
 * @param {object} updateData
 */
export const updateCompanyService = async (id, updateData) => {
  if (!mongoose.Types.ObjectId.isValid(id)) {
    throw new BadRequestError("Invalid company ID format");
  }

  const existingCompany = await findCompanyById(id);
  if (!existingCompany) {
    throw new NotFoundError("Company not found");
  }

  // If email is being changed, ensure uniqueness
  if (updateData.email) {
    const normalizedEmail = updateData.email.toLowerCase().trim();
    if (normalizedEmail !== existingCompany.email.toLowerCase()) {
      const duplicateCompany = await findCompanyByEmail(normalizedEmail);
      if (duplicateCompany && duplicateCompany._id.toString() !== id) {
        throw new BadRequestError("Email is already registered by another company");
      }
      updateData.email = normalizedEmail;
    }
  }

  const updatedCompany = await updateCompany(id, updateData);

  return {
    message: "Company updated successfully",
    data: updatedCompany,
  };
};

/**
 * Delete company permanently by ID
 * @param {string} id
 */
export const deleteCompanyService = async (id) => {
  if (!mongoose.Types.ObjectId.isValid(id)) {
    throw new BadRequestError("Invalid company ID format");
  }

  const existingCompany = await findCompanyById(id);
  if (!existingCompany) {
    throw new NotFoundError("Company not found");
  }

  const deletedCompany = await deleteCompanyById(id);

  return {
    message: "Company deleted successfully",
    data: deletedCompany,
  };
};

export default {
  getAllCompaniesService,
  getCompanyByIdService,
  createCompanyService,
  updateCompanyService,
  deleteCompanyService,
};
