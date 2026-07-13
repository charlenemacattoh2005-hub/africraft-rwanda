/**
 * server/src/index.js
 *
 * Express application entry point.
 *
 * Middleware order (correct):
 *   1. dotenv         — load env vars first
 *   2. cors           — BEFORE everything so preflight OPTIONS works
 *   3. express.json   — body parsing
 *   4. routes         — application routes
 *   5. errorHandler   — catches errors from routes
 *
 * CORS strategy:
 *   • app.options('*', cors(corsOptions)) — handles ALL preflight requests
 *     before any route or auth middleware runs.
 *   • app.use(cors(corsOptions)) — adds ACAO header to every response.
 *   • errorHandler also sets CORS headers so error responses (401, 500,
 *     etc.) don't lose the header and cause spurious CORS errors in the
 *     browser.
 */

// ── 1. Environment variables ──────────────────────────────────
import dotenv from 'dotenv';
dotenv.config();

import express    from 'express';
import cors       from 'cors';
import { connectMongo } from './lib/db.js';

// ── Routes ────────────────────────────────────────────────────
import authRoutes        from './routes/authRoutes.js';
import productRoutes     from './routes/productRoutes.js';
import orderRoutes       from './routes/orderRoutes.js';
import categoryRoutes    from './routes/categoryRoutes.js';
import wishlistRoutes    from './routes/wishlistRoutes.js';
import reviewRoutes      from './routes/reviewRoutes.js';
import userRoutes        from './routes/userRoutes.js';
import adminRoutes       from './routes/adminRoutes.js';
import adminReviewRoutes from './routes/adminReviewRoutes.js';
import uploadRoutes      from './routes/uploadRoutes.js';

import { getPublicSiteContent } from './controllers/siteController.js';
import { errorHandler }         from './middleware/errorHandler.js';

// ── App ───────────────────────────────────────────────────────
const app = express();

// ── 2. CORS — must be the FIRST middleware ────────────────────
// Build the allowed origins list from hard-coded values + env var.
// The regex allows any Vercel preview deployment for this project.
const ALLOWED_ORIGINS = [
  'http://localhost:5173',
  'http://localhost:3000',
  'https://africraft-rwanda-sable.vercel.app',
  /^https:\/\/africraft-rwanda[a-z0-9-]*\.vercel\.app$/,
];

// Also allow any origin set via CLIENT_URL env var (e.g. custom domain)
if (process.env.CLIENT_URL) {
  ALLOWED_ORIGINS.push(process.env.CLIENT_URL);
}

/**
 * corsOptions.origin — called by the cors middleware for every request.
 * Returns true/false to allow/deny the origin.
 * Requests with no Origin header (server-to-server, curl, Postman,
 * Render health checks) are always allowed.
 */
function originFn(origin, callback) {
  // No Origin header → allow (server-to-server, Render health checks, curl)
  if (!origin) return callback(null, true);

  const allowed = ALLOWED_ORIGINS.some(o =>
    typeof o === 'string' ? o === origin : o.test(origin)
  );

  if (allowed) {
    return callback(null, true);
  }

  // Blocked — log it, but return a normal error so the cors middleware
  // can still set the correct (empty) ACAO header rather than crashing.
  console.warn(`[cors] Blocked origin: ${origin}`);
  return callback(null, false);
}

const corsOptions = {
  origin:             originFn,
  credentials:        true,
  methods:            ['GET', 'HEAD', 'PUT', 'PATCH', 'POST', 'DELETE', 'OPTIONS'],
  allowedHeaders:     ['Content-Type', 'Authorization', 'X-Requested-With'],
  exposedHeaders:     ['Content-Range', 'X-Total-Count'],
  optionsSuccessStatus: 200,   // Some legacy browsers (IE11) choke on 204
};

// Handle ALL preflight OPTIONS requests — must come before any route
app.options('*', cors(corsOptions));

// Apply CORS headers to every response
app.use(cors(corsOptions));

// ── 3. Body parsing ───────────────────────────────────────────
app.use(express.json({ limit: '2mb' }));
app.use(express.urlencoded({ extended: true, limit: '2mb' }));

// ── 4. Health & root ──────────────────────────────────────────
// These are intentionally BEFORE auth middleware so they always respond.

app.get('/health', (_req, res) => {
  res.status(200).json({
    status:  'ok',
    message: 'Server is running',
    service: 'africraft-api',
    env:     process.env.NODE_ENV || 'development',
    time:    new Date().toISOString(),
  });
});

app.get('/', (_req, res) => {
  res.status(200).json({
    message: 'AfriCraft Rwanda API',
    version: '1.0.0',
    health:  '/health',
    docs:    '/api',
  });
});

// ── 5. Public routes (no auth required) ──────────────────────
app.get('/api/site-content', getPublicSiteContent);

// ── 6. API routes ─────────────────────────────────────────────
app.use('/api/auth',          authRoutes);
app.use('/api/products',      productRoutes);
app.use('/api/categories',    categoryRoutes);
app.use('/api/orders',        orderRoutes);
app.use('/api/wishlist',      wishlistRoutes);
app.use('/api/reviews',       reviewRoutes);
app.use('/api/users',         userRoutes);
app.use('/api/admin',         adminRoutes);
app.use('/api/admin/reviews', adminReviewRoutes);
app.use('/api/upload',        uploadRoutes);

// ── 7. 404 for unknown routes ─────────────────────────────────
app.use((_req, res) => {
  res.status(404).json({ message: 'Route not found' });
});

// ── 8. Error handler ──────────────────────────────────────────
// IMPORTANT: errorHandler must run AFTER CORS middleware has already
// added the ACAO header.  The cors middleware adds headers in app.use()
// above, so by the time an error is thrown those headers are on the
// response object.  The handler below just needs to not clear them.
app.use(errorHandler);

// ── 9. Start server ───────────────────────────────────────────
// Listen on process.env.PORT (required by Render).
// Bind to 0.0.0.0 so the port is reachable from outside the container.
// IMPORTANT: listen() is called BEFORE connectMongo() so Render sees the
// port open immediately and doesn't kill the process during cold start.
const PORT = process.env.PORT || 5000;

async function start() {
  app.listen(PORT, '0.0.0.0', () => {
    console.log(`[server] AfriCraft API listening on port ${PORT}`);
    console.log(`[server] NODE_ENV = ${process.env.NODE_ENV || 'development'}`);
    console.log(`[server] CORS origins: ${ALLOWED_ORIGINS.filter(o => typeof o === 'string').join(', ')}`);
  });

  try {
    const ok = await connectMongo();
    if (ok) {
      console.log('[db] Connected to MongoDB ✓');
    } else {
      console.warn('[server] MongoDB not connected — DB routes will fail');
    }
  } catch (err) {
    console.error('[server] MongoDB error:', err.message);
  }
}

start().catch(err => {
  console.error('[server] Fatal startup error:', err);
  process.exit(1);
});
