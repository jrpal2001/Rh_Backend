import Company from "../../models/company.model.js";

/**
 * Find company by ID excluding sensitive tokens
 * @param {string} id
 */
export const findCompanyById = async (id) => {
  return await Company.findById(id).select("-accessToken -refreshToken");
};

/**
 * Find company by normalized email
 * @param {string} email
 */
export const findCompanyByEmail = async (email) => {
  return await Company.findOne({ email: email.toLowerCase().trim() });
};

/**
 * Find all companies matching filter, sorted and paginated
 * @param {object} params
 * @param {object} params.filter
 * @param {object} params.sort
 * @param {number} params.skip
 * @param {number} params.limit
 */
export const findAllCompanies = async ({ filter = {}, sort = { createdAt: -1 }, skip = 0, limit = 10 }) => {
  return await Company.find(filter)
    .select("-accessToken -refreshToken")
    .sort(sort)
    .skip(skip)
    .limit(limit)
    .lean();
};

/**
 * Count total companies matching filter
 * @param {object} filter
 */
export const countCompanies = async (filter = {}) => {
  return await Company.countDocuments(filter);
};

/**
 * Create new company
 * @param {object} data
 */
export const createCompany = async (data) => {
  const company = await Company.create(data);
  const result = company.toObject();
  delete result.accessToken;
  delete result.refreshToken;
  return result;
};

/**
 * Update company by ID
 * @param {string} id
 * @param {object} updateData
 */
export const updateCompany = async (id, updateData) => {
  return await Company.findByIdAndUpdate(id, updateData, {
    new: true,
    runValidators: true,
  }).select("-accessToken -refreshToken");
};

/**
 * Delete company permanently by ID
 * @param {string} id
 */
export const deleteCompanyById = async (id) => {
  return await Company.findByIdAndDelete(id).select("-accessToken -refreshToken");
};

/**
 * Soft delete company (set status to inactive)
 * @param {string} id
 */
export const softDeleteCompany = async (id) => {
  return await Company.findByIdAndUpdate(
    id,
    { status: "inactive" },
    { new: true }
  ).select("-accessToken -refreshToken");
};

export default {
  findCompanyById,
  findCompanyByEmail,
  findAllCompanies,
  countCompanies,
  createCompany,
  updateCompany,
  deleteCompanyById,
  softDeleteCompany,
};
