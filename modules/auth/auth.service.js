import mongoose from "mongoose";
import SuperAdmin from "../../models/superAdmin.model.js";
import SubAdmin from "../../models/subAdmin.model.js";
import Company from "../../models/company.model.js";
import Traveler from "../../models/traveler.model.js";

import { generateNumericOTP, hashOTP, verifyOTP } from "../../utils/otp.util.js";
import { generateTokens, verifyRefreshToken } from "../../utils/jwt.util.js";
import { sendEmail } from "../../utils/email.util.js";
import logger from "../../utils/logger.util.js";
import { NODE_ENV } from "../../config/env.config.js";
import Roles from "../../shared/constants/roles.constants.js";
import BadRequestError from "../../shared/errors/bad-request.error.js";
import NotFoundError from "../../shared/errors/not-found.error.js";
import UnauthorizedError from "../../shared/errors/unauthorized.error.js";

import {
  createOTP,
  deleteOTPByEmailAndUserType,
  findActiveOTP,
  markOTPAsUsed,
} from "./auth.repository.js";

/**
 * Generic OTP Sender for any user type & model
 * Returns user register id in data
 */
export const sendOtpForUser = async ({ email, Model, userType, displayName, autoCreate = false }) => {
  if (!email) {
    throw new BadRequestError("Email is required");
  }

  const normalizedEmail = email.trim().toLowerCase();

  // Verify account existence in the corresponding model
  let user = await Model.findOne({ email: normalizedEmail });
  if (!user) {
    if (autoCreate) {
      user = await Model.create({
        name: normalizedEmail.split("@")[0],
        email: normalizedEmail,
      });
    } else {
      throw new NotFoundError(`${displayName} account not found with this email`);
    }
  }

  const otp = generateNumericOTP(6);
  const otpHash = hashOTP(otp);

  // Invalidate any previous OTPs for this email and userType
  await deleteOTPByEmailAndUserType(normalizedEmail, userType);

  // Save new OTP with 2 minutes expiry and link with user._id
  await createOTP({
    email: normalizedEmail,
    userId: user._id,
    userType,
    otp: otpHash,
    expiresAt: new Date(Date.now() + 2 * 60 * 1000),
  });

  // Attempt to send email
  try {
    await sendEmail({
      to: normalizedEmail,
      subject: `Your RH Global CRM Login OTP`,
      text: `Your OTP code is ${otp}. It will expire in 2 minutes.`,
      html: `<p>Your OTP code is: <strong>${otp}</strong>. It will expire in 2 minutes.</p>`,
    });
  } catch (mailError) {
    logger.warn(`Could not send OTP email to ${normalizedEmail}: ${mailError.message}`);
  }

  const responseData = {
    id: user._id,
    email: normalizedEmail,
  };

  return {
    message: "OTP sent successfully",
    data: responseData,
  };
};

/**
 * Generic OTP Verifier for any user type & model
 * Supports verification using ID or email
 */
export const verifyOtpForUser = async ({
  id,
  email,
  otp,
  Model,
  userType,
  role,
  displayName,
  autoCreate = false,
}) => {
  if (!otp) {
    throw new BadRequestError("OTP is required");
  }

  if (!id && !email) {
    throw new BadRequestError("ID or email is required");
  }

  if (id && !mongoose.Types.ObjectId.isValid(id)) {
    throw new BadRequestError("Invalid ID format");
  }

  // Find user by ID or email
  let user;
  if (id) {
    user = await Model.findById(id);
    if (!user) {
      throw new NotFoundError(`${displayName} account not found with this ID`);
    }
  } else {
    const normalizedEmail = email.trim().toLowerCase();
    user = await Model.findOne({ email: normalizedEmail });
    if (!user) {
      if (autoCreate) {
        user = await Model.create({
          name: normalizedEmail.split("@")[0],
          email: normalizedEmail,
        });
      } else {
        throw new NotFoundError(`${displayName} account not found`);
      }
    }
  }

  // Find active OTP record for this user (by userId or user email)
  const otpRecord = await findActiveOTP({
    userId: user._id,
    email: user.email,
    userType,
  });

  if (!otpRecord) {
    throw new BadRequestError("Invalid or expired OTP");
  }

  // Validate OTP
  const isValid = verifyOTP(String(otp).trim(), otpRecord.otp);
  if (!isValid) {
    throw new BadRequestError("Invalid OTP");
  }

  // Mark OTP as used
  await markOTPAsUsed(otpRecord._id);

  // Generate Access and Refresh Tokens
  const tokenPayload = {
    id: user._id.toString(),
    ...(user.subAdminId ? { subAdminId: user.subAdminId } : {}),
    email: user.email,
    role,
    userType,
  };
  const { accessToken, refreshToken } = generateTokens(tokenPayload);

  // Persist tokens to user document
  user.accessToken = accessToken;
  user.refreshToken = refreshToken;
  await user.save();

  return {
    message: "OTP verified successfully. Logged in successfully.",
    data: {
      user: {
        id: user._id,
        ...(user.subAdminId ? { subAdminId: user.subAdminId } : {}),
        name: user.name,
        email: user.email,
        phone: user.phone,
        profileImage: user.profileImage || null,
        role,
        userType,
        ...(user.permissions ? { permissions: user.permissions } : {}),
      },
      accessToken,
      refreshToken,
    },
  };
};

/**
 * Generic Logout for any user type & model
 */
export const logoutForUser = async ({ userId, Model, displayName }) => {
  if (!userId) {
    throw new UnauthorizedError("User is not authenticated");
  }

  const user = await Model.findById(userId);
  if (!user) {
    throw new NotFoundError(`${displayName} account not found`);
  }

  user.accessToken = null;
  user.refreshToken = null;
  await user.save();

  return {
    message: "Logged out successfully",
  };
};

/**
 * Generic Token Refresh for any user type & model
 */
export const refreshForUser = async ({ refreshToken, Model, userType, role, displayName }) => {
  if (!refreshToken) {
    throw new BadRequestError("Refresh token is required");
  }

  let decoded;
  try {
    decoded = verifyRefreshToken(refreshToken);
  } catch (error) {
    throw new UnauthorizedError("Invalid or expired refresh token");
  }

  const user = await Model.findById(decoded.id);
  if (!user || user.refreshToken !== refreshToken) {
    throw new UnauthorizedError("Refresh token is invalid or has been revoked");
  }

  const tokenPayload = {
    id: user._id.toString(),
    ...(user.subAdminId ? { subAdminId: user.subAdminId } : {}),
    email: user.email,
    role,
    userType,
  };
  const tokens = generateTokens(tokenPayload);

  user.accessToken = tokens.accessToken;
  user.refreshToken = tokens.refreshToken;
  await user.save();

  return {
    message: "Tokens refreshed successfully",
    data: {
      accessToken: tokens.accessToken,
      refreshToken: tokens.refreshToken,
    },
  };
};

// ============================================================================
// Super Admin Services (Connected to SuperAdmin Model)
// ============================================================================
export const superAdminSendOtpService = (email) =>
  sendOtpForUser({ email, Model: SuperAdmin, userType: "super_admin", displayName: "Super Admin" });

export const superAdminVerifyOtpService = (payload, otp) => {
  const data = typeof payload === "object" ? payload : { email: payload, otp };
  return verifyOtpForUser({
    ...data,
    Model: SuperAdmin,
    userType: "super_admin",
    role: Roles.SUPER_ADMIN,
    displayName: "Super Admin",
  });
};

export const superAdminLogoutService = (userId) =>
  logoutForUser({ userId, Model: SuperAdmin, displayName: "Super Admin" });

export const superAdminRefreshService = (refreshToken) =>
  refreshForUser({ refreshToken, Model: SuperAdmin, userType: "super_admin", role: Roles.SUPER_ADMIN, displayName: "Super Admin" });

// ============================================================================
// Staff Services (Connected to SubAdmin Model)
// ============================================================================
export const staffSendOtpService = (email) =>
  sendOtpForUser({ email, Model: SubAdmin, userType: "staff", displayName: "Staff" });

export const staffVerifyOtpService = (payload, otp) => {
  const data = typeof payload === "object" ? payload : { email: payload, otp };
  return verifyOtpForUser({
    ...data,
    Model: SubAdmin,
    userType: "staff",
    role: Roles.STAFF,
    displayName: "Staff",
  });
};

export const staffLogoutService = (userId) =>
  logoutForUser({ userId, Model: SubAdmin, displayName: "Staff" });

export const staffRefreshService = (refreshToken) =>
  refreshForUser({ refreshToken, Model: SubAdmin, userType: "staff", role: Roles.STAFF, displayName: "Staff" });

// ============================================================================
// Company Services (Connected to Company Model)
// ============================================================================
export const companySendOtpService = (email) =>
  sendOtpForUser({ email, Model: Company, userType: "company", displayName: "Company" });

export const companyVerifyOtpService = (payload, otp) => {
  const data = typeof payload === "object" ? payload : { email: payload, otp };
  return verifyOtpForUser({
    ...data,
    Model: Company,
    userType: "company",
    role: Roles.COMPANY,
    displayName: "Company",
  });
};

export const companyLogoutService = (userId) =>
  logoutForUser({ userId, Model: Company, displayName: "Company" });

export const companyRefreshService = (refreshToken) =>
  refreshForUser({ refreshToken, Model: Company, userType: "company", role: Roles.COMPANY, displayName: "Company" });

// ============================================================================
// Traveler Services (Connected to Traveler Model)
// ============================================================================
export const travelerSendOtpService = (email) =>
  sendOtpForUser({ email, Model: Traveler, userType: "traveler", displayName: "Traveler", autoCreate: true });

export const travelerVerifyOtpService = (payload, otp) => {
  const data = typeof payload === "object" ? payload : { email: payload, otp };
  return verifyOtpForUser({
    ...data,
    Model: Traveler,
    userType: "traveler",
    role: Roles.TRAVELER,
    displayName: "Traveler",
    autoCreate: true,
  });
};

export const travelerLogoutService = (userId) =>
  logoutForUser({ userId, Model: Traveler, displayName: "Traveler" });

export const travelerRefreshService = (refreshToken) =>
  refreshForUser({ refreshToken, Model: Traveler, userType: "traveler", role: Roles.TRAVELER, displayName: "Traveler" });

// Backward compatibility aliases
export const individualSendOtpService = travelerSendOtpService;
export const individualVerifyOtpService = travelerVerifyOtpService;
export const individualLogoutService = travelerLogoutService;
export const individualRefreshService = travelerRefreshService;

// ============================================================================
// Multi-Model Configurations
// ============================================================================
// Insider Portal: Super Admin and Staff (SubAdmin)
export const INSIDER_CONFIGS = [
  { Model: SuperAdmin, userType: "super_admin", role: Roles.SUPER_ADMIN, displayName: "Super Admin" },
  { Model: SubAdmin, userType: "staff", role: Roles.STAFF, displayName: "Staff" },
];

// Outsider Portal: Company and Traveler
export const OUTSIDER_CONFIGS = [
  { Model: Company, userType: "company", role: Roles.COMPANY, displayName: "Company" },
  { Model: Traveler, userType: "traveler", role: Roles.TRAVELER, displayName: "Traveler", autoCreate: true },
];

/**
 * Generic multi-model OTP sender
 */
export const sendOtpMultiUser = async ({ email, configs, portalName }) => {
  if (!email) {
    throw new BadRequestError("Email is required");
  }

  const normalizedEmail = email.trim().toLowerCase();

  let user = null;
  let matchedConfig = null;

  for (const config of configs) {
    const found = await config.Model.findOne({ email: normalizedEmail });
    if (found) {
      user = found;
      matchedConfig = config;
      break;
    }
  }

  if (!user) {
    const autoCreateConfig = configs.find((c) => c.autoCreate);
    if (autoCreateConfig) {
      user = await autoCreateConfig.Model.create({
        name: normalizedEmail.split("@")[0],
        email: normalizedEmail,
      });
      matchedConfig = autoCreateConfig;
    } else {
      throw new NotFoundError(`${portalName} account not found with this email`);
    }
  }

  const otp = generateNumericOTP(6);
  const otpHash = hashOTP(otp);

  await deleteOTPByEmailAndUserType(normalizedEmail, matchedConfig.userType);

  await createOTP({
    email: normalizedEmail,
    userId: user._id,
    userType: matchedConfig.userType,
    otp: otpHash,
    expiresAt: new Date(Date.now() + 2 * 60 * 1000),
  });

  try {
    await sendEmail({
      to: normalizedEmail,
      subject: `Your RH Global CRM Login OTP`,
      text: `Your OTP code is ${otp}. It will expire in 2 minutes.`,
      html: `<p>Your OTP code is: <strong>${otp}</strong>. It will expire in 2 minutes.</p>`,
    });
  } catch (mailError) {
    logger.warn(`Could not send OTP email to ${normalizedEmail}: ${mailError.message}`);
  }

  return {
    message: "OTP sent successfully",
    data: {
      id: user._id,
      email: normalizedEmail,
    },
  };
};

/**
 * Generic multi-model OTP verifier
 */
export const verifyOtpMultiUser = async ({ id, email, otp, configs, portalName }) => {
  if (!otp) {
    throw new BadRequestError("OTP is required");
  }

  if (!id && !email) {
    throw new BadRequestError("ID or email is required");
  }

  if (id && !mongoose.Types.ObjectId.isValid(id)) {
    throw new BadRequestError("Invalid ID format");
  }

  let user = null;
  let matchedConfig = null;

  if (id) {
    for (const config of configs) {
      const found = await config.Model.findById(id);
      if (found) {
        user = found;
        matchedConfig = config;
        break;
      }
    }
  } else if (email) {
    const normalizedEmail = email.trim().toLowerCase();
    for (const config of configs) {
      const found = await config.Model.findOne({ email: normalizedEmail });
      if (found) {
        user = found;
        matchedConfig = config;
        break;
      }
    }

    if (!user) {
      const autoCreateConfig = configs.find((c) => c.autoCreate);
      if (autoCreateConfig) {
        user = await autoCreateConfig.Model.create({
          name: normalizedEmail.split("@")[0],
          email: normalizedEmail,
        });
        matchedConfig = autoCreateConfig;
      }
    }
  }

  if (!user || !matchedConfig) {
    throw new NotFoundError(`${portalName} account not found with this ID/email`);
  }

  const otpRecord = await findActiveOTP({
    userId: user._id,
    email: user.email,
    userType: matchedConfig.userType,
  });

  if (!otpRecord) {
    throw new BadRequestError("Invalid or expired OTP");
  }

  const isValid = verifyOTP(String(otp).trim(), otpRecord.otp);
  if (!isValid) {
    throw new BadRequestError("Invalid OTP");
  }

  await markOTPAsUsed(otpRecord._id);

  const tokenPayload = {
    id: user._id.toString(),
    ...(user.subAdminId ? { subAdminId: user.subAdminId } : {}),
    email: user.email,
    role: matchedConfig.role,
    userType: matchedConfig.userType,
  };
  const { accessToken, refreshToken } = generateTokens(tokenPayload);

  user.accessToken = accessToken;
  user.refreshToken = refreshToken;
  await user.save();

  return {
    message: "OTP verified successfully. Logged in successfully.",
    data: {
      user: {
        id: user._id,
        ...(user.subAdminId ? { subAdminId: user.subAdminId } : {}),
        name: user.name,
        email: user.email,
        phone: user.phone,
        profileImage: user.profileImage || null,
        role: matchedConfig.role,
        userType: matchedConfig.userType,
        ...(user.permissions ? { permissions: user.permissions } : {}),
      },
      accessToken,
      refreshToken,
    },
  };
};

/**
 * Generic multi-model logout
 */
export const logoutMultiUser = async ({ userId, configs, portalName }) => {
  if (!userId) {
    throw new UnauthorizedError("User is not authenticated");
  }

  let user = null;
  for (const config of configs) {
    const found = await config.Model.findById(userId);
    if (found) {
      user = found;
      break;
    }
  }

  if (!user) {
    throw new NotFoundError(`${portalName} account not found`);
  }

  user.accessToken = null;
  user.refreshToken = null;
  await user.save();

  return {
    message: "Logged out successfully",
  };
};

/**
 * Generic multi-model refresh
 */
export const refreshMultiUser = async ({ refreshToken, configs, portalName }) => {
  if (!refreshToken) {
    throw new BadRequestError("Refresh token is required");
  }

  let decoded;
  try {
    decoded = verifyRefreshToken(refreshToken);
  } catch (error) {
    throw new UnauthorizedError("Invalid or expired refresh token");
  }

  let user = null;
  let matchedConfig = null;
  for (const config of configs) {
    const found = await config.Model.findById(decoded.id);
    if (found) {
      user = found;
      matchedConfig = config;
      break;
    }
  }

  if (!user || user.refreshToken !== refreshToken || !matchedConfig) {
    throw new UnauthorizedError("Refresh token is invalid or has been revoked");
  }

  const tokenPayload = {
    id: user._id.toString(),
    ...(user.subAdminId ? { subAdminId: user.subAdminId } : {}),
    email: user.email,
    role: matchedConfig.role,
    userType: matchedConfig.userType,
  };
  const tokens = generateTokens(tokenPayload);

  user.accessToken = tokens.accessToken;
  user.refreshToken = tokens.refreshToken;
  await user.save();

  return {
    message: "Tokens refreshed successfully",
    data: {
      accessToken: tokens.accessToken,
      refreshToken: tokens.refreshToken,
    },
  };
};

// ============================================================================
// Insider Services (Super Admin + Staff)
// ============================================================================
export const insiderSendOtpService = (email) =>
  sendOtpMultiUser({ email, configs: INSIDER_CONFIGS, portalName: "Insider" });

export const insiderVerifyOtpService = (payload, otp) => {
  const data = typeof payload === "object" ? payload : { email: payload, otp };
  return verifyOtpMultiUser({ ...data, configs: INSIDER_CONFIGS, portalName: "Insider" });
};

export const insiderLogoutService = (userId) =>
  logoutMultiUser({ userId, configs: INSIDER_CONFIGS, portalName: "Insider" });

export const insiderRefreshService = (refreshToken) =>
  refreshMultiUser({ refreshToken, configs: INSIDER_CONFIGS, portalName: "Insider" });

// ============================================================================
// Outsider Services (Company + Traveler)
// ============================================================================
export const outsiderSendOtpService = (email) =>
  sendOtpMultiUser({ email, configs: OUTSIDER_CONFIGS, portalName: "Outsider" });

export const outsiderVerifyOtpService = (payload, otp) => {
  const data = typeof payload === "object" ? payload : { email: payload, otp };
  return verifyOtpMultiUser({ ...data, configs: OUTSIDER_CONFIGS, portalName: "Outsider" });
};

export const outsiderLogoutService = (userId) =>
  logoutMultiUser({ userId, configs: OUTSIDER_CONFIGS, portalName: "Outsider" });

export const outsiderRefreshService = (refreshToken) =>
  refreshMultiUser({ refreshToken, configs: OUTSIDER_CONFIGS, portalName: "Outsider" });