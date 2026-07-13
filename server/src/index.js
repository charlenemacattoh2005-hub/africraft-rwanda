import dotenv from 'dotenv';
dotenv.config();

import express from 'express';
import cors from 'cors';
import { connectMongo } from './lib/db.js';

import authRoutes         from './routes/authRoutes.js';
import productRoutes      from './routes/productRoutes.js';
import orderRoutes        from './routes/orderRoutes.js';
import categoryRoutes     from './routes/categoryRoutes.js';
import wishlistRoutes     from './routes/wishlistRoutes.js';
import reviewRoutes       from './routes/reviewRoutes.js';
import userRoutes         from './routes/userRoutes.js';
import adminRoutes        from './routes/adminRoutes.js';
import adminReviewRoutes  from './routes/adminReviewRoutes.js';
import uploadRoutes       from './routes/uploadRoutes.js';
import { getPublicSiteContent } from './controllers/siteController.js';
import { errorHandler } from './middleware/errorHandler.js';

const app = express();

/* ── CORS ────────────────────────────────────────────────────── */
const ALLOWED_ORIGINS = [
  'http://localhost:5173',
  'http://localhost:3000',
  'https://africraft-rwanda-sable.vercel.app',
  /^https:\/\/africraft-rwanda[a-z0-9-]*\.vercel\.app$/,
  ...(process.env.CLIENT_URL ? [process.env.CLIENT_URL] : []),
];

const corsOptions = {
  origin(origin, callback) {
    if (!origin) return callback(null, true);
    const allowed = ALLOWED_ORIGINS.some(o =>
      typeof o === 'string' ? o === origin : o.test(origin)
    );
    if (allowed) return callback(null, true);
    console.warn(`[cors] Blocked origin: ${origin}`);
    callback(new Error(`CORS: origin ${origin} not allowed`));
  },
  credentials: true,
  methods: ['GET', 'HEAD', 'PUT', 'PATCH', 'POST', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  optionsSuccessStatus: 200,
};

// Preflight must come BEFORE any other middleware
app.options('*', cors(corsOptions));
app.use(cors(corsOptions));
app.use(express.json({ limit: '2mb' }));

/* ── Health / root ───────────────────────────────────────────── */
app.get('/health', (_req, res) => res.json({ ok: true, service: 'africraft-api', env: process.env.NODE_ENV }));
app.get('/',       (_req, res) => res.json({ message: 'AfriCraft Rwanda API running' }));

/* ── Public routes (no auth) ─────────────────────────────────── */
app.get('/api/site-content', getPublicSiteContent);

/* ── API routes ──────────────────────────────────────────────── */
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

app.use(errorHandler);

/* ── Start server ────────────────────────────────────────────── */
const port = process.env.PORT || 5000;

async function start() {
  // Start listening FIRST — Render requires the port to bind quickly
  app.listen(port, '0.0.0.0', () => {
    console.log(`[server] AfriCraft API listening on port ${port}`);
  });

  // Connect to MongoDB after the server is already accepting requests
  try {
    const ok = await connectMongo();
    if (!ok) {
      console.warn('[server] Running without MongoDB — DB-backed routes will fail.');
    }
  } catch (err) {
    console.error('[server] MongoDB connection error:', err.message);
  }
}

start().catch(err => {
  console.error('[server] Fatal startup error:', err);
  process.exit(1);
});
