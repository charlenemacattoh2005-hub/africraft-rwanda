import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { connectMongo } from './lib/db.js';

import authRoutes from './routes/authRoutes.js';
import productRoutes from './routes/productRoutes.js';
import orderRoutes from './routes/orderRoutes.js';
import { errorHandler } from './middleware/errorHandler.js';

dotenv.config();

const app = express();

app.use(cors({ origin: true, credentials: true }));
app.use(express.json({ limit: '1mb' }));

app.get('/health', (req, res) => {
  res.json({ ok: true, service: 'africraft-backend' });
});

app.get('/', (req, res) => {
  res.json({ message: 'AfriCraft API running' });
});

app.use('/api/auth', authRoutes);
app.use('/api/products', productRoutes);
app.use('/api/orders', orderRoutes);

app.use(errorHandler);

const port = process.env.PORT || 4000;

await connectMongo();

app.listen(port, () => {
  console.log(`Backend running on http://localhost:${port}`);
});


