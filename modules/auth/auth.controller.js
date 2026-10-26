import { asyncHandler } from "../../utils/async-handler.js";
import response from "../../utils/response.util.js";
import {
  superAdminSendOtpService,
  superAdminVerifyOtpService,
  superAdminLogoutService,
  superAdminRefreshService,
  staffSendOtpService,
  staffVerifyOtpService,
  staffLogoutService,
  staffRefreshService,
  companySendOtpService,
  companyVerifyOtpService,
  companyLogoutService,
  companyRefreshService,
  travelerSendOtpService,
  travelerVerifyOtpService,
  travelerLogoutService,
  travelerRefreshService,
  insiderSendOtpService,
  insiderVerifyOtpService,
  insiderLogoutService,
  insiderRefreshService,
  outsiderSendOtpService,
  outsiderVerifyOtpService,
  outsiderLogoutService,
  outsiderRefreshService,
} from "./auth.service.js";
import jwtConfig from "../../config/jwt.config.js";

const isProduction = process.env.NODE_ENV === "production";

/**
 * Convert duration string (e.g. '1d', '15m', '7d') to milliseconds
 */
const parseDurationToMs = (duration, defaultMs = 15 * 60 * 1000) => {
  if (!duration) return defaultMs;
  if (typeof duration === "number") return duration;
  const match = String(duration).trim().match(/^(\d+)([smhdwy])$/i);
  if (!match) return defaultMs;
  const val = parseInt(match[1], 10);
  const unit = match[2].toLowerCase();
  switch (unit) {
    case "s": return val * 1000;
    case "m": return val * 60 * 1000;
    case "h": return val * 60 * 60 * 1000;
    case "d": return val * 24 * 60 * 60 * 1000;
    case "w": return val * 7 * 24 * 60 * 60 * 1000;
    case "y": return val * 365 * 24 * 60 * 60 * 1000;
    default: return defaultMs;
  }
};

const getAccessTokenMaxAge = () =>
  parseDurationToMs(jwtConfig.accessExpiresIn, 24 * 60 * 60 * 1000);
const getRefreshTokenMaxAge = () =>
  parseDurationToMs(jwtConfig.refreshExpiresIn, 7 * 24 * 60 * 60 * 1000);

const getCookieOptions = (maxAge) => ({
  httpOnly: true,
  secure: true,
  sameSite: "none",
  path: "/",
  ...(maxAge ? { maxAge } : {}),
});

/**
 * Controller helper to generate clean, standardized auth endpoints for any user role
 */
const createAuthController = (services) => ({
  sendOtp: asyncHandler(async (req, res) => {
    const result = await services.sendOtp(req.body.email);
    return response.success(res, result.message, result.data);
  }),

  verifyOtp: asyncHandler(async (req, res) => {
    const { id, email, otp } = req.body;
    const result = await services.verifyOtp({ id, email, otp });

    // Save tokens directly into HTTP-only cookies with SameSite=None and Secure for cross-origin support
    res.cookie("accessToken", result.data.accessToken, getCookieOptions(getAccessTokenMaxAge()));
    res.cookie("refreshToken", result.data.refreshToken, getCookieOptions(getRefreshTokenMaxAge()));

    // Return user info in response (tokens stored in HTTP-only cookies only)
    return response.success(res, result.message, {
      user: result.data.user,
    });
  }),

  logout: asyncHandler(async (req, res) => {
    const result = await services.logout(req.user.id);

    // Clear cookies upon logout with identical cross-origin options
    res.clearCookie("accessToken", getCookieOptions());
    res.clearCookie("refreshToken", getCookieOptions());

    return response.success(res, result.message);
  }),

  refresh: asyncHandler(async (req, res) => {
    const token = req.cookies?.refreshToken || req.body?.refreshToken || req.headers["x-refresh-token"];
    const result = await services.refresh(token);

    // Refresh cookies using duration from .env
    res.cookie("accessToken", result.data.accessToken, getCookieOptions(getAccessTokenMaxAge()));
    res.cookie("refreshToken", result.data.refreshToken, getCookieOptions(getRefreshTokenMaxAge()));

    return response.success(res, result.message);
  }),
});

// ============================================================================
// Super Admin Controllers
// ============================================================================
const superAdminController = createAuthController({
  sendOtp: superAdminSendOtpService,
  verifyOtp: superAdminVerifyOtpService,
  logout: superAdminLogoutService,
  refresh: superAdminRefreshService,
});

export const superAdminSendOtp = superAdminController.sendOtp;
export const superAdminVerifyOtp = superAdminController.verifyOtp;
export const superAdminLogout = superAdminController.logout;
export const superAdminRefresh = superAdminController.refresh;

// ============================================================================
// Staff Controllers (SubAdmin)
// ============================================================================
const staffController = createAuthController({
  sendOtp: staffSendOtpService,
  verifyOtp: staffVerifyOtpService,
  logout: staffLogoutService,
  refresh: staffRefreshService,
});

export const staffSendOtp = staffController.sendOtp;
export const staffVerifyOtp = staffController.verifyOtp;
export const staffLogout = staffController.logout;
export const staffRefresh = staffController.refresh;

// ============================================================================
// Company Controllers
// ============================================================================
const companyController = createAuthController({
  sendOtp: companySendOtpService,
  verifyOtp: companyVerifyOtpService,
  logout: companyLogoutService,
  refresh: companyRefreshService,
});

export const companySendOtp = companyController.sendOtp;
export const companyVerifyOtp = companyController.verifyOtp;
export const companyLogout = companyController.logout;
export const companyRefresh = companyController.refresh;

// ============================================================================
// Traveler Controllers
// ============================================================================
const travelerController = createAuthController({
  sendOtp: travelerSendOtpService,
  verifyOtp: travelerVerifyOtpService,
  logout: travelerLogoutService,
  refresh: travelerRefreshService,
});

export const travelerSendOtp = travelerController.sendOtp;
export const travelerVerifyOtp = travelerController.verifyOtp;
export const travelerLogout = travelerController.logout;
export const travelerRefresh = travelerController.refresh;

// Backward compatibility aliases for individual
export const individualSendOtp = travelerSendOtp;
export const individualVerifyOtp = travelerVerifyOtp;
export const individualLogout = travelerLogout;
export const individualRefresh = travelerRefresh;

// ============================================================================
// Insider Controllers (Super Admin & Staff)
// ============================================================================
const insiderController = createAuthController({
  sendOtp: insiderSendOtpService,
  verifyOtp: insiderVerifyOtpService,
  logout: insiderLogoutService,
  refresh: insiderRefreshService,
});

export const insiderSendOtp = insiderController.sendOtp;
export const insiderVerifyOtp = insiderController.verifyOtp;
export const insiderLogout = insiderController.logout;
export const insiderRefresh = insiderController.refresh;

// ============================================================================
// Outsider Controllers (Company & Traveler)
// ============================================================================
const outsiderController = createAuthController({
  sendOtp: outsiderSendOtpService,
  verifyOtp: outsiderVerifyOtpService,
  logout: outsiderLogoutService,
  refresh: outsiderRefreshService,
});

export const outsiderSendOtp = outsiderController.sendOtp;
export const outsiderVerifyOtp = outsiderController.verifyOtp;
export const outsiderLogout = outsiderController.logout;
export const outsiderRefresh = outsiderController.refresh;