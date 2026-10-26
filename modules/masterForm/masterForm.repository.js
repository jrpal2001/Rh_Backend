import Checklist from "../../models/checklist.model.js";
import Docs from "../../models/docs.model.js";

// ============================================================================
// Checklist Repositories
// ============================================================================

export const createChecklist = async (data) => {
  return Checklist.create(data);
};

export const findChecklistById = async (id) => {
  return Checklist.findById(id).lean();
};

export const findChecklistByTitle = async (title, excludeId = null) => {
  const query = {
    title: { $regex: new RegExp(`^${title.trim()}$`, "i") },
  };
  if (excludeId) {
    query._id = { $ne: excludeId };
  }
  return Checklist.findOne(query).lean();
};

export const findAllChecklists = async (
  filter = {},
  sort = { createdAt: -1 },
  skip = 0,
  limit = 10
) => {
  let query = Checklist.find(filter).sort(sort).lean();
  if (limit > 0) {
    query = query.skip(skip).limit(limit);
  }
  return query.exec();
};

export const countChecklists = async (filter = {}) => {
  return Checklist.countDocuments(filter);
};

export const updateChecklistById = async (id, data) => {
  return Checklist.findByIdAndUpdate(
    id,
    { $set: data },
    { new: true, runValidators: true }
  ).lean();
};

export const deleteChecklistById = async (id) => {
  return Checklist.findByIdAndDelete(id).lean();
};

// ============================================================================
// Docs Repositories
// ============================================================================

export const createDoc = async (data) => {
  return Docs.create(data);
};

export const findDocById = async (id) => {
  return Docs.findById(id).lean();
};

export const findDocByName = async (documentName, excludeId = null) => {
  const query = {
    documentName: { $regex: new RegExp(`^${documentName.trim()}$`, "i") },
  };
  if (excludeId) {
    query._id = { $ne: excludeId };
  }
  return Docs.findOne(query).lean();
};

export const findAllDocs = async (
  filter = {},
  sort = { createdAt: -1 },
  skip = 0,
  limit = 10
) => {
  let query = Docs.find(filter).sort(sort).lean();
  if (limit > 0) {
    query = query.skip(skip).limit(limit);
  }
  return query.exec();
};

export const countDocs = async (filter = {}) => {
  return Docs.countDocuments(filter);
};

export const updateDocById = async (id, data) => {
  return Docs.findByIdAndUpdate(
    id,
    { $set: data },
    { new: true, runValidators: true }
  ).lean();
};

export const deleteDocById = async (id) => {
  return Docs.findByIdAndDelete(id).lean();
};

export default {
  createChecklist,
  findChecklistById,
  findChecklistByTitle,
  findAllChecklists,
  countChecklists,
  updateChecklistById,
  deleteChecklistById,
  createDoc,
  findDocById,
  findDocByName,
  findAllDocs,
  countDocs,
  updateDocById,
  deleteDocById,
};
