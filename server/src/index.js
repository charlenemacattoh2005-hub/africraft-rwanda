import dotenv from 'dotenv';
dotenv.config();

import express from 'express';
import cors from 'cors';
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
import { errorHandler } from './middleware/errorHandler.js';

const app = express();

app.use(cors({ origin: true, credentials: true }));
app.use(express.json({ limit: '2mb' }));

app.get('/health', (_req, res) => res.json({ ok: true, service: 'africraft-api' }));
app.get('/',       (_req, res) => res.json({ message: 'AfriCraft Rwanda API running' }));

// Public site content (homepage CMS) — no auth required
app.get('/api/site-content', getPublicSiteContent);

app.use('/api/auth',         authRoutes);
app.use('/api/products',     productRoutes);
app.use('/api/categories',   categoryRoutes);
app.use('/api/orders',       orderRoutes);
app.use('/api/wishlist',     wishlistRoutes);
app.use('/api/reviews',      reviewRoutes);
app.use('/api/users',        userRoutes);
app.use('/api/admin',        adminRoutes);
app.use('/api/admin/reviews',adminReviewRoutes);
app.use('/api/upload',       uploadRoutes);

app.use(errorHandler);

const port = process.env.PORT || 5000;

const dbReady = await connectMongo();
if (!dbReady) {
  console.log('[server] Continuing without MongoDB connection.');
}

app.listen(port, () => {
  console.log(`AfriCraft API running on http://localhost:${port}`);
});



