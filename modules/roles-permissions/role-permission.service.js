import BadRequestError from "../../shared/errors/bad-request.error.js";
import NotFoundError from "../../shared/errors/not-found.error.js";
import { getPagination, formatPaginatedResult } from "../../utils/pagination.util.js";
import {
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
} from "./role-permission.repository.js";
import { ARCHIVE_STATUSES } from "./role-permission.constants.js";

const escapeRegex = (text) => text.replace(/[-[\]{}()*+?.,\\^$|#\s]/g, "\\$&");

// ============================================================================
// Staff Roles & Permissions CRUD Services
// ============================================================================

export const getAllStaffRolesService = async (query = {}) => {
  const { page, limit, skip } = getPagination(query, 10);
  const filter = {};

  const search = (query.search || query.q || "").trim();
  if (search) {
    const searchRegex = new RegExp(escapeRegex(search), "i");
    filter.$or = [
      { subAdminId: searchRegex },
      { name: searchRegex },
      { email: searchRegex },
      { phone: searchRegex },
      { role: searchRegex },
    ];
  }

  if (query.status && query.status !== "all") {
    filter.status = query.status.toLowerCase().trim();
  }

  const [staffList, totalItems] = await Promise.all([
    findAllStaff({ filter, skip, limit }),
    countStaff(filter),
  ]);

  const paginated = formatPaginatedResult({ data: staffList, totalItems, page, limit });
  return {
    message: "Staff roles and permissions retrieved successfully",
    data: paginated,
  };
};

export const getStaffRoleByIdService = async (id) => {
  const staff = await findStaffById(id);
  if (!staff) {
    throw new NotFoundError("Staff member not found");
  }
  return {
    message: "Staff role and permissions fetched successfully",
    data: staff,
  };
};

export const createStaffRoleService = async (payload) => {
  const normalizedEmail = payload.email.trim().toLowerCase();
  const existing = await findStaffByEmail(normalizedEmail);
  if (existing) {
    throw new BadRequestError("A staff account with this email already exists");
  }

  const newStaff = await createStaff({
    ...payload,
    email: normalizedEmail,
  });

  return {
    message: "Staff role and permissions created successfully",
    data: newStaff,
  };
};

export const updateStaffRoleService = async (id, payload) => {
  const existing = await findStaffById(id);
  if (!existing) {
    throw new NotFoundError("Staff member not found");
  }

  if (payload.email) {
    const normalizedEmail = payload.email.trim().toLowerCase();
    if (normalizedEmail !== existing.email) {
      const emailInUse = await findStaffByEmail(normalizedEmail);
      if (emailInUse && emailInUse._id.toString() !== id.toString()) {
        throw new BadRequestError("This email address is already in use by another staff account");
      }
      payload.email = normalizedEmail;
    }
  }

  const updatedStaff = await updateStaffById(id, payload);
  return {
    message: "Staff role and permissions updated successfully",
    data: updatedStaff,
  };
};

export const deleteStaffRoleService = async (id) => {
  const existing = await findStaffById(id);
  if (!existing) {
    throw new NotFoundError("Staff member not found");
  }

  // Clear assigned applications for this staff member
  await unassignStaffFromApplications(id);

  const deletedStaff = await deleteStaffById(id);
  return {
    message: "Staff member deleted successfully",
    data: deletedStaff,
  };
};

// ============================================================================
// Task Assignment & History Archival Services
// ============================================================================

/**
 * Assign an application (booking or visa) to a staff member.
 * Automatically removes any previous staff assignment and updates application document.
 */
export const assignTaskService = async ({ staffId, applicationType, applicationId }) => {
  const staff = await findStaffById(staffId);
  if (!staff) {
    throw new NotFoundError("Staff member not found");
  }

  const applicationModel = applicationType === "booking" ? "BookingApplication" : "VisaApplication";

  let application;
  if (applicationType === "booking") {
    application = await findBookingApplicationById(applicationId);
    if (!application) throw new NotFoundError("Booking application not found");
  } else if (applicationType === "visa") {
    application = await findVisaApplicationById(applicationId);
    if (!application) throw new NotFoundError("Visa application not found");
  } else {
    throw new BadRequestError("Invalid application type. Allowed: booking, visa");
  }

  // Remove existing assignment of this application from any staff
  await removeAssignedApplicationFromAllStaff(applicationId);

  // Add assignment to the target staff
  const assignmentEntry = {
    applicationType,
    applicationId,
    applicationModel,
    assignedAt: new Date(),
  };

  const updatedStaff = await addAssignedApplicationToStaff(staffId, assignmentEntry);

  // Update application record with assigned staff reference
  if (applicationType === "booking") {
    await updateBookingApplicationById(applicationId, { assignedStaff: staffId });
  } else {
    await updateVisaApplicationById(applicationId, { caseOfficer: staffId });
  }

  return {
    message: `${applicationType === "booking" ? "Booking" : "Visa"} application assigned to ${staff.name} successfully`,
    data: updatedStaff,
  };
};

/**
 * Helper to build basic application details directly
 */
const buildBasicApplicationDetails = (application, applicationType, applicationId) => {
  if (!application) {
    return {
      applicationId: applicationId?.toString() || null,
    };
  }

  if (applicationType === "booking") {
    return {
      applicationId: application._id?.toString() || applicationId?.toString(),
      customerName: application.customerName || null,
      email: application.email || null,
      phone: application.contactPhone || null,
      destinationOrCountry: application.destination || null,
      packageNameOrVisaType: application.packageName || null,
      duration: application.duration || null,
      totalPrice: application.totalPackagePrice || null,
      passportNumber: null,
      applicationDate: application.bookingDate || null,
    };
  }

  // Visa application
  return {
    applicationId: application._id?.toString() || applicationId?.toString(),
    customerName: application.applicantName || null,
    email: application.email || null,
    phone: application.mobileNumber || null,
    destinationOrCountry: application.targetCountry || null,
    packageNameOrVisaType: application.visaType || null,
    duration: null,
    totalPrice: null,
    passportNumber: application.passportDetails?.passportNumber || null,
    applicationDate: application.applicationDate || null,
  };
};

/**
 * Unassign a task from a staff member and archive to StaffAssignHistory
 */
export const unassignTaskService = async (applicationId, { staffId, applicationType, remarks = null } = {}) => {
  let targetStaffId = staffId;
  let assignedAt = null;
  let application = null;

  if (applicationType === "booking") {
    application = await findBookingApplicationById(applicationId);
    if (!targetStaffId) targetStaffId = application?.assignedStaff;
  } else {
    application = await findVisaApplicationById(applicationId);
    if (!targetStaffId) targetStaffId = application?.caseOfficer;
  }

  if (targetStaffId) {
    const staff = await findStaffById(targetStaffId);
    const existingAssignment = staff?.assignedApplications?.find(
      (a) => a.applicationId?._id?.toString() === applicationId.toString() || a.applicationId?.toString() === applicationId.toString()
    );
    if (existingAssignment) {
      assignedAt = existingAssignment.assignedAt;
    }

    // Pull from staff assignedApplications
    await removeAssignedApplicationFromStaff(targetStaffId, applicationId);

    // Archive basic details directly to StaffAssignHistory
    await createStaffAssignHistory({
      staffId: targetStaffId,
      staffName: staff?.name || null,
      staffEmail: staff?.email || null,
      applicationType,
      applicationDetails: buildBasicApplicationDetails(application, applicationType, applicationId),
      finalStatus: "unassigned",
      assignedAt,
      endedAt: new Date(),
      remarks,
    });
  }

  // Remove reference on application
  if (applicationType === "booking") {
    await updateBookingApplicationById(applicationId, { assignedStaff: null });
  } else {
    await updateVisaApplicationById(applicationId, { caseOfficer: null });
  }

  return {
    message: "Task unassigned and recorded into history successfully",
    data: { applicationId, applicationType },
  };
};

/**
 * When application status changes to completed or rejected (or canceled),
 * remove from active staff assignedApplications and store in staffAssignHistory.model.js
 */
export const handleApplicationStatusChangeService = async ({
  applicationType,
  applicationId,
  status,
  remarks = null,
}) => {
  const normalizedStatus = status.toLowerCase().trim();

  let application;
  let staffId = null;

  if (applicationType === "booking") {
    application = await updateBookingApplicationById(applicationId, { status: normalizedStatus });
    if (!application) throw new NotFoundError("Booking application not found");
    staffId = application.assignedStaff;
  } else if (applicationType === "visa") {
    application = await updateVisaApplicationById(applicationId, { status: normalizedStatus });
    if (!application) throw new NotFoundError("Visa application not found");
    staffId = application.caseOfficer;
  } else {
    throw new BadRequestError("Invalid application type. Allowed: booking, visa");
  }

  // Check if status is completed or rejected
  if (["completed", "rejected", "canceled"].includes(normalizedStatus) && staffId) {
    const staff = await findStaffById(staffId);
    let assignedAt = null;

    if (staff && Array.isArray(staff.assignedApplications)) {
      const match = staff.assignedApplications.find(
        (a) => a.applicationId?._id?.toString() === applicationId.toString() || a.applicationId?.toString() === applicationId.toString()
      );
      if (match) {
        assignedAt = match.assignedAt;
      }
      // Remove from active assignedApplications in SubAdmin
      await removeAssignedApplicationFromStaff(staffId, applicationId);
    }

    // Save direct basic details into StaffAssignHistory
    await createStaffAssignHistory({
      staffId,
      staffName: staff?.name || null,
      staffEmail: staff?.email || null,
      applicationType,
      applicationDetails: buildBasicApplicationDetails(application, applicationType, applicationId),
      finalStatus: normalizedStatus,
      assignedAt,
      endedAt: new Date(),
      remarks,
    });
  }

  return {
    message: `Application status updated to ${normalizedStatus} and assignment archived if applicable`,
    data: application,
  };
};

/**
 * Get staff task assignment history
 */
export const getStaffHistoryService = async (query = {}) => {
  const { page, limit, skip } = getPagination(query, 10);
  const filter = {};

  if (query.staffId) filter.staffId = query.staffId;
  if (query.applicationType) filter.applicationType = query.applicationType;
  if (query.finalStatus) filter.finalStatus = query.finalStatus;

  const [history, totalItems] = await Promise.all([
    findStaffAssignHistory({ filter, skip, limit }),
    countStaffAssignHistory(filter),
  ]);

  const paginated = formatPaginatedResult({ data: history, totalItems, page, limit });
  return {
    message: "Staff assignment history fetched successfully",
    data: paginated,
  };
};

export default {
  getAllStaffRolesService,
  getStaffRoleByIdService,
  createStaffRoleService,
  updateStaffRoleService,
  deleteStaffRoleService,
  assignTaskService,
  unassignTaskService,
  handleApplicationStatusChangeService,
  getStaffHistoryService,
};
