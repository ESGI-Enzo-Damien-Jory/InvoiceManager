/**
 * @file app.js
 * @module app
 * @description Initializes the Express application, configures middleware, and sets up routes for the API.
 */

const express = require('express');
const cors = require('cors');
const routes = require('./routes/index');
const devAuthMiddleware = require('./middleware/devAuth');
const rateLimit = require('express-rate-limit');

const app = express();

/**
 * Rate limiting middleware to restrict excessive requests from a single IP.
 * @const {Object} limiter
 * @memberof module:routes
 */
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 2000,
  message: {
    status: 429,
    message:
      'Too many requests from this IP, please try again after 15 minutes',
  },
  standardHeaders: true,
  legacyHeaders: false,
  trustProxy: true,
  skip: (_request) => {
    return process.env.NODE_ENV === 'development';
  },
  keyGenerator: (request) => {
    const realIp = request.headers['x-real-ip'];
    const forwardedFor = request.headers['x-forwarded-for'];

    if (realIp) {
      return realIp;
    }

    if (forwardedFor) {
      return forwardedFor.split(',')[0].trim();
    }

    return request.ip;
  },
});

app.set('trust proxy', (ip) => {
  return ip === '127.0.0.1' || ip === '::1' || ip.startsWith('localhost');
});

/**
 * Enables Cross-Origin Resource Sharing (CORS) for the Express application.
 * This allows the server to handle requests from different origins.
 *
 * @function
 */
app.use(
  cors({
    origin:
      process.env.NODE_ENV === 'development'
        ? 'http://localhost:3000'
        : 'my-production-domain.com',
    credentials: true,
  })
);

/**
 * Adds middleware to parse incoming requests with JSON payloads.
 * This allows the server to handle `application/json` requests.
 *
 * @function
 */
app.use(express.json());

/**
 * Adds development authentication middleware.
 * This middleware verifies the user-id header and attaches user information to the request.
 * Only active in development environment.
 *
 * @function
 */
if (process.env.NODE_ENV === 'development') {
  app.use('/api', limiter, devAuthMiddleware);
}

/**
 * Sets up the main API routes under the `/api` path.
 *
 * @function
 * @memberof module:app
 * @description All routes are defined in the `routes/index.js` file, and are mounted on the `/api` path for the application.
 */
app.use('/api', routes);

/**
 * Global error handler
 *
 * @function
 * @param {Error} err - Error object
 * @param {Request} _req - Express request object (unused)
 * @param {Response} res - Express response object
 * @param {NextFunction} _next - Express next function (unused)
 * @description Catches any errors that weren't handled in the routes
 */
app.use((err, _req, res, _next) => {
  console.error('Unhandled error:', err);
  res.status(500).json({
    error: 'Internal server error',
    message: process.env.NODE_ENV === 'development' ? err.message : undefined,
  });
});

app.use(limiter);

module.exports = app;
