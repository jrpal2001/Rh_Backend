import Lead from "../../models/lead.model.js";

/**
 * Create a new lead
 * @param {object} data
 */
export const createLead = async (data) => {
  return await Lead.create(data);
};

/**
 * Find lead by ID
 * @param {string} id
 */
export const findLeadById = async (id) => {
  return await Lead.findById(id).lean();
};

/**
 * Find all leads matching filter, sorted and paginated
 * @param {object} params
 * @param {object} params.filter
 * @param {object} params.sort
 * @param {number} params.skip
 * @param {number} params.limit
 */
export const findAllLeads = async ({
  filter = {},
  sort = { createdAt: -1 },
  skip = 0,
  limit = 10,
}) => {
  let query = Lead.find(filter).sort(sort).lean();
  if (limit > 0) {
    query = query.skip(skip).limit(limit);
  }
  return await query.exec();
};

/**
 * Count total leads matching filter
 * @param {object} filter
 */
export const countLeads = async (filter = {}) => {
  return await Lead.countDocuments(filter);
};

/**
 * Update lead by ID
 * @param {string} id
 * @param {object} data
 */
export const updateLeadById = async (id, data) => {
  return await Lead.findByIdAndUpdate(
    id,
    { $set: data },
    { new: true, runValidators: true }
  ).lean();
};

/**
 * Delete lead by ID
 * @param {string} id
 */
export const deleteLeadById = async (id) => {
  return await Lead.findByIdAndDelete(id).lean();
};

export default {
  createLead,
  findLeadById,
  findAllLeads,
  countLeads,
  updateLeadById,
  deleteLeadById,
};
