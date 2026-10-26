import mongoose from "mongoose";
import BadRequestError from "../../shared/errors/bad-request.error.js";
import NotFoundError from "../../shared/errors/not-found.error.js";
import { getPagination, formatPaginatedResult } from "../../utils/pagination.util.js";
import {
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
} from "./masterForm.repository.js";

/**
 * Escape regex special characters to prevent regex injection or syntax errors
 */
const escapeRegex = (text) => {
  return text.replace(/[-[\]{}()*+?.,\\^$|#\s]/g, "\\$&");
};

/**
 * Validate MongoDB ObjectId
 */
const validateObjectId = (id, resourceName = "Resource") => {
  if (!id || !mongoose.Types.ObjectId.isValid(id)) {
    throw new BadRequestError(`Invalid ${resourceName} ID: '${id}'`);
  }
};

// ============================================================================
// Checklist Services
// ============================================================================

/**
 * Create a new checklist
 */
export const createChecklistService = async (payload) => {
  const title = (payload.title || "").trim();
  const existing = await findChecklistByTitle(title);
  if (existing) {
    throw new BadRequestError(`Checklist with title '${title}' already exists`);
  }

  const checklistData = {
    title,
    isActive: payload.isActive !== undefined ? Boolean(payload.isActive) : true,
  };

  const checklist = await createChecklist(checklistData);
  return {
    message: "Checklist created successfully",
    data: checklist,
  };
};

/**
 * Retrieve all checklists with search, active filter, pagination, or full list (all=true)
 */
export const getAllChecklistsService = async (query = {}) => {
  const filter = {};

  const searchTerm = (query.search || query.q || "").trim();
  if (searchTerm) {
    filter.title = new RegExp(escapeRegex(searchTerm), "i");
  }

  if (query.isActive !== undefined && query.isActive !== "all") {
    filter.isActive = String(query.isActive) === "true";
  }

  const sortBy = query.sortBy || "createdAt";
  const sortOrder = query.sortOrder === "asc" ? 1 : -1;
  const sort = { [sortBy]: sortOrder };

  const isAll = String(query.all) === "true";

  if (isAll) {
    const items = await findAllChecklists(filter, sort, 0, 0);
    return {
      message: "All checklists retrieved successfully",
      data: {
        items,
        total: items.length,
      },
    };
  }

  const { page, limit, skip } = getPagination(query, 10);
  const [items, totalCount] = await Promise.all([
    findAllChecklists(filter, sort, skip, limit),
    countChecklists(filter),
  ]);

  return {
    message: "Checklists retrieved successfully",
    data: formatPaginatedResult(items, totalCount, page, limit),
  };
};

/**
 * Get checklist by ID
 */
export const getChecklistByIdService = async (id) => {
  validateObjectId(id, "Checklist");
  const checklist = await findChecklistById(id);
  if (!checklist) {
    throw new NotFoundError(`Checklist not found with ID: '${id}'`);
  }

  return {
    message: "Checklist retrieved successfully",
    data: checklist,
  };
};

/**
 * Edit / Update checklist
 */
export const updateChecklistService = async (id, payload) => {
  validateObjectId(id, "Checklist");

  const existing = await findChecklistById(id);
  if (!existing) {
    throw new NotFoundError(`Checklist not found with ID: '${id}'`);
  }

  const updateData = {};

  if (payload.title !== undefined) {
    const trimmedTitle = payload.title.trim();
    const duplicate = await findChecklistByTitle(trimmedTitle, id);
    if (duplicate) {
      throw new BadRequestError(`Checklist with title '${trimmedTitle}' already exists`);
    }
    updateData.title = trimmedTitle;
  }

  if (payload.isActive !== undefined) {
    updateData.isActive = Boolean(payload.isActive);
  }

  const updatedChecklist = await updateChecklistById(id, updateData);
  return {
    message: "Checklist updated successfully",
    data: updatedChecklist,
  };
};

/**
 * Delete checklist
 */
export const deleteChecklistService = async (id) => {
  validateObjectId(id, "Checklist");

  const existing = await findChecklistById(id);
  if (!existing) {
    throw new NotFoundError(`Checklist not found with ID: '${id}'`);
  }

  await deleteChecklistById(id);

  return {
    message: "Checklist deleted successfully",
    data: { id, title: existing.title },
  };
};

// ============================================================================
// Docs Services
// ============================================================================

/**
 * Create a new doc
 */
export const createDocService = async (payload) => {
  const documentName = (payload.documentName || "").trim();
  const existing = await findDocByName(documentName);
  if (existing) {
    throw new BadRequestError(`Document with name '${documentName}' already exists`);
  }

  const docData = {
    documentName,
    isActive: payload.isActive !== undefined ? Boolean(payload.isActive) : true,
  };

  const doc = await createDoc(docData);
  return {
    message: "Document created successfully",
    data: doc,
  };
};

/**
 * Retrieve all docs with search, active filter, pagination, or full list (all=true)
 */
export const getAllDocsService = async (query = {}) => {
  const filter = {};

  const searchTerm = (query.search || query.q || "").trim();
  if (searchTerm) {
    filter.documentName = new RegExp(escapeRegex(searchTerm), "i");
  }

  if (query.isActive !== undefined && query.isActive !== "all") {
    filter.isActive = String(query.isActive) === "true";
  }

  const sortBy = query.sortBy || "createdAt";
  const sortOrder = query.sortOrder === "asc" ? 1 : -1;
  const sort = { [sortBy]: sortOrder };

  const isAll = String(query.all) === "true";

  if (isAll) {
    const items = await findAllDocs(filter, sort, 0, 0);
    return {
      message: "All documents retrieved successfully",
      data: {
        items,
        total: items.length,
      },
    };
  }

  const { page, limit, skip } = getPagination(query, 10);
  const [items, totalCount] = await Promise.all([
    findAllDocs(filter, sort, skip, limit),
    countDocs(filter),
  ]);

  return {
    message: "Documents retrieved successfully",
    data: formatPaginatedResult(items, totalCount, page, limit),
  };
};

/**
 * Get doc by ID
 */
export const getDocByIdService = async (id) => {
  validateObjectId(id, "Document");
  const doc = await findDocById(id);
  if (!doc) {
    throw new NotFoundError(`Document not found with ID: '${id}'`);
  }

  return {
    message: "Document retrieved successfully",
    data: doc,
  };
};

/**
 * Edit / Update doc
 */
export const updateDocService = async (id, payload) => {
  validateObjectId(id, "Document");

  const existing = await findDocById(id);
  if (!existing) {
    throw new NotFoundError(`Document not found with ID: '${id}'`);
  }

  const updateData = {};

  if (payload.documentName !== undefined) {
    const trimmedName = payload.documentName.trim();
    const duplicate = await findDocByName(trimmedName, id);
    if (duplicate) {
      throw new BadRequestError(`Document with name '${trimmedName}' already exists`);
    }
    updateData.documentName = trimmedName;
  }

  if (payload.isActive !== undefined) {
    updateData.isActive = Boolean(payload.isActive);
  }

  const updatedDoc = await updateDocById(id, updateData);
  return {
    message: "Document updated successfully",
    data: updatedDoc,
  };
};

/**
 * Delete doc
 */
export const deleteDocService = async (id) => {
  validateObjectId(id, "Document");

  const existing = await findDocById(id);
  if (!existing) {
    throw new NotFoundError(`Document not found with ID: '${id}'`);
  }

  await deleteDocById(id);

  return {
    message: "Document deleted successfully",
    data: { id, documentName: existing.documentName },
  };
};

export default {
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
};
