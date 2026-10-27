import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import cookieParser from 'cookie-parser';
import appConfig from './config/app.config.js';
import requestLogger from './middlewares/request-logger.middleware.js';
import rateLimiter from './middlewares/rate-limiter.middleware.js';
import errorHandler from './middlewares/error-handler.middleware.js';
import NotFoundError from './shared/errors/not-found.error.js';

import authRoutes from './modules/auth/auth.routes.js';
import holidayRoutes from './modules/holiday/holiday.routes.js';
import visaRoutes from './modules/visa/visa.routes.js';
import companyRoutes from './modules/companies/company.routes.js';
import rolePermissionRoutes from './modules/roles-permissions/role-permission.routes.js';
import masterFormRoutes from './modules/masterForm/masterForm.routes.js';

const app = express();

// Trust reverse proxy (Render, Vercel, AWS) for accurate HTTPS detection and cookies
app.set('trust proxy', 1);

// Security HTTP headers
app.use(helmet());

// Whitelist default frontend development ports and any configured origins
const defaultOrigins = [
  'http://localhost:3000',
  'http://localhost:5173',
  'http://localhost:5174',
  'http://localhost:5175',
  'http://localhost:5176',
  'http://127.0.0.1:3000',
  'http://127.0.0.1:5173',
  'http://127.0.0.1:5174',
  'http://127.0.0.1:5175',
  'http://127.0.0.1:5176',
];

const configuredOrigins = Array.isArray(appConfig.allowedOrigins)
  ? appConfig.allowedOrigins
  : (appConfig.frontendUrl || '')
    .split(',')
    .map((u) => u.trim().replace(/\/+$/, ''))
    .filter(Boolean);

const allowedOrigins = Array.from(new Set([...defaultOrigins, ...configuredOrigins]));

// Enable CORS with credentials for cookies and multiple allowed origins
app.use(
  cors({
    origin: (origin, callback) => {
      // Allow requests with no origin (e.g. mobile apps, curl, Postman)
      if (!origin) return callback(null, true);

      // Check against allowed origins list
      if (allowedOrigins.includes(origin)) {
        return callback(null, true);
      }

      // In development, also allow any localhost/127.0.0.1 port (e.g. 5173, 5174, 5175, etc.)
      if (!appConfig.isProduction && /^http:\/\/(localhost|127\.0\.0\.1)(:\d+)?$/.test(origin)) {
        return callback(null, true);
      }

      return callback(null, false);
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With', 'Accept', 'Origin'],
  })
);

// Cookie parser middleware
app.use(cookieParser());

// Body parsers
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));


// HTTP Request logging
app.use(requestLogger);

// Global Rate Limiting
app.use(appConfig.apiPrefix, rateLimiter);

// Favicon handlers
app.get(['/favicon.ico', '/favicon.png'], (req, res) => res.status(204).end());

// Root Welcome endpoint
app.get('/', (req, res) => {
  res.status(200).json({
    success: true,
    message: `Welcome to ${appConfig.appName} API`,
    version: '1.0.0',
    apiPrefix: appConfig.apiPrefix,
  });
});

// Health check endpoint
app.get('/health', (req, res) => {
  res.status(200).json({
    status: 'OK',
    uptime: process.uptime(),
    timestamp: new Date().toISOString(),
    service: appConfig.appName,
  });
});

// Root API Welcome endpoint
app.get(appConfig.apiPrefix, (req, res) => {
  res.status(200).json({
    message: `Welcome to ${appConfig.appName} API`,
    version: '1.0.0',
  });
});

// Note: Domain module routes are plugged in here dynamically:
app.use(`${appConfig.apiPrefix}/auth`, authRoutes);
app.use(`${appConfig.apiPrefix}/holiday`, holidayRoutes);
app.use(`${appConfig.apiPrefix}/visa`, visaRoutes);
app.use(`${appConfig.apiPrefix}/company`, companyRoutes);
app.use(`${appConfig.apiPrefix}/staff`, rolePermissionRoutes);
app.use(`${appConfig.apiPrefix}/master`, masterFormRoutes);
// app.use(`${appConfig.apiPrefix}/applications`, applicationRoutes);
// etc.

// 404 Handler for undefined routes
app.use((req, res, next) => {
  next(new NotFoundError(`Cannot ${req.method} ${req.originalUrl}`));
});

// Centralized Global Error Handler
app.use(errorHandler);

export default app;
export { app };
