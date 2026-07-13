import { fileURLToPath } from 'url';
import { dirname, join }  from 'path';
import dotenv             from 'dotenv';

// Load .env relative to this file — works regardless of CWD
// In production (Render) the file won't exist; env vars come from the dashboard
dotenv.config({ path: join(dirname(fileURLToPath(import.meta.url)), '../../.env') });

import express    from 'express';
import cors       from 'cors';
import { connectMongo } from './lib/db.js';

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

const app = express();

// ── CORS ──────────────────────────────────────────────────────
const ALLOWED_ORIGINS = [
  'http://localhost:3000',
  'http://localhost:5173',
  'https://africraft-rwanda-sable.vercel.app',
  /^https:\/\/africraft-rwanda[a-z0-9-]*\.vercel\.app$/,
];

if (process.env.CLIENT_URL) ALLOWED_ORIGINS.push(process.env.CLIENT_URL);

const corsOptions = {
  origin(origin, cb) {
    if (!origin) return cb(null, true); // curl / Render health checks
    const ok = ALLOWED_ORIGINS.some(o =>
      typeof o === 'string' ? o === origin : o.test(origin)
    );
    if (!ok) console.warn('[cors] blocked:', origin);
    cb(null, ok);
  },
  credentials:          true,
  methods:              ['GET', 'HEAD', 'PUT', 'PATCH', 'POST', 'DELETE', 'OPTIONS'],
  allowedHeaders:       ['Content-Type', 'Authorization', 'X-Requested-With'],
  optionsSuccessStatus: 200,
};

app.options('*', cors(corsOptions)); // preflight — MUST be first
app.use(cors(corsOptions));

// ── Body parsing ──────────────────────────────────────────────
app.use(express.json({ limit: '2mb' }));
app.use(express.urlencoded({ extended: true, limit: '2mb' }));

// ── Health & root ─────────────────────────────────────────────
app.get('/health', (_req, res) => {
  res.json({
    status:    'ok',
    message:   'DellCraft API is running',
    timestamp: new Date().toISOString(),
  });
});

app.get('/', (_req, res) => {
  res.json({ message: 'AfriCraft Rwanda API', health: '/health' });
});

// ── Routes ────────────────────────────────────────────────────
app.get('/api/site-content', getPublicSiteContent);
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

// ── 404 ───────────────────────────────────────────────────────
app.use((req, res) => {
  res.status(404).json({ message: `Not found: ${req.method} ${req.path}` });
});

// ── Error handler ─────────────────────────────────────────────
app.use(errorHandler);

// ── Start ─────────────────────────────────────────────────────
const PORT = process.env.PORT || 5000;

app.listen(PORT, '0.0.0.0', () => {
  console.log(`[server] listening on port ${PORT}`);
  console.log(`[server] NODE_ENV=${process.env.NODE_ENV || 'development'}`);
  console.log(`[server] CLIENT_URL=${process.env.CLIENT_URL || '(not set)'}`);
});

connectMongo().catch(err => console.error('[db]', err.message));
