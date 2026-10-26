import mongoose from "mongoose";
import SubAdmin from "../../models/subAdmin.model.js";
import StaffAssignHistory from "../../models/staffAssignHistory.model.js";
import BookingApplication from "../../models/bookingApplication.model.js";
import VisaApplication from "../../models/visaApplication.model.js";

const EXCLUDE_TOKENS = "-accessToken -refreshToken";

// ============================================================================
// Staff / SubAdmin Repository
// ============================================================================

export const findStaffById = async (id) => {
  if (!id) return null;
  const isObjectId = mongoose.Types.ObjectId.isValid(id);
  const query = isObjectId ? { _id: id } : { subAdminId: new RegExp(`^${id}$`, "i") };
  return await SubAdmin.findOne(query)
    .select(EXCLUDE_TOKENS)
    .populate({
      path: "assignedApplications.applicationId",
    });
};

export const findStaffByEmail = async (email) => {
  return await SubAdmin.findOne({ email: email.toLowerCase().trim() });
};

export const findAllStaff = async ({ filter = {}, sort = { createdAt: -1 }, skip = 0, limit = 10 }) => {
  return await SubAdmin.find(filter)
    .select(EXCLUDE_TOKENS)
    .sort(sort)
    .skip(skip)
    .limit(limit)
    .populate({
      path: "assignedApplications.applicationId",
    })
    .lean();
};

export const countStaff = async (filter = {}) => {
  return await SubAdmin.countDocuments(filter);
};

export const createStaff = async (data) => {
  const staff = await SubAdmin.create(data);
  const result = staff.toObject();
  delete result.accessToken;
  delete result.refreshToken;
  return result;
};

export const updateStaffById = async (id, updateData) => {
  const isObjectId = mongoose.Types.ObjectId.isValid(id);
  const query = isObjectId ? { _id: id } : { subAdminId: new RegExp(`^${id}$`, "i") };
  return await SubAdmin.findOneAndUpdate(query, updateData, {
    new: true,
    runValidators: true,
  })
    .select(EXCLUDE_TOKENS)
    .populate("assignedApplications.applicationId");
};

export const deleteStaffById = async (id) => {
  const isObjectId = mongoose.Types.ObjectId.isValid(id);
  const query = isObjectId ? { _id: id } : { subAdminId: new RegExp(`^${id}$`, "i") };
  return await SubAdmin.findOneAndDelete(query).select(EXCLUDE_TOKENS);
};

export const unassignStaffFromApplications = async (staffId) => {
  return await Promise.all([
    BookingApplication.updateMany({ assignedStaff: staffId }, { $set: { assignedStaff: null } }),
    VisaApplication.updateMany({ caseOfficer: staffId }, { $set: { caseOfficer: null } }),
  ]);
};

// ============================================================================
// Application Lookups
// ============================================================================

export const findBookingApplicationById = async (id) => {
  return await BookingApplication.findById(id);
};

export const findVisaApplicationById = async (id) => {
  return await VisaApplication.findById(id);
};

export const updateBookingApplicationById = async (id, updateData) => {
  return await BookingApplication.findByIdAndUpdate(id, updateData, { new: true });
};

export const updateVisaApplicationById = async (id, updateData) => {
  return await VisaApplication.findByIdAndUpdate(id, updateData, { new: true });
};

// ============================================================================
// Assignment & History Operations
// ============================================================================

export const addAssignedApplicationToStaff = async (staffId, assignment) => {
  return await SubAdmin.findByIdAndUpdate(
    staffId,
    { $push: { assignedApplications: assignment } },
    { new: true }
  ).select(EXCLUDE_TOKENS);
};

export const removeAssignedApplicationFromStaff = async (staffId, applicationId) => {
  return await SubAdmin.findByIdAndUpdate(
    staffId,
    { $pull: { assignedApplications: { applicationId } } },
    { new: true }
  ).select(EXCLUDE_TOKENS);
};

export const removeAssignedApplicationFromAllStaff = async (applicationId) => {
  return await SubAdmin.updateMany(
    { "assignedApplications.applicationId": applicationId },
    { $pull: { assignedApplications: { applicationId } } }
  );
};

export const createStaffAssignHistory = async (historyData) => {
  return await StaffAssignHistory.create(historyData);
};

export const findStaffAssignHistory = async ({ filter = {}, sort = { endedAt: -1 }, skip = 0, limit = 10 }) => {
  return await StaffAssignHistory.find(filter)
    .sort(sort)
    .skip(skip)
    .limit(limit)
    .populate("staffId", "name email phone profileImage")
    .lean();
};

export const countStaffAssignHistory = async (filter = {}) => {
  return await StaffAssignHistory.countDocuments(filter);
};

export default {
  findStaffById,
  findStaffByEmail,
  findAllStaff,
  countStaff,
  createStaff,
  updateStaffById,
  deleteStaffById,
  unassignStaffFromApplications,
  findBookingApplicationById,
  findVisaApplicationById,
  updateBookingApplicationById,
  updateVisaApplicationById,
  addAssignedApplicationToStaff,
  removeAssignedApplicationFromStaff,
  removeAssignedApplicationFromAllStaff,
  createStaffAssignHistory,
  findStaffAssignHistory,
  countStaffAssignHistory,
};
