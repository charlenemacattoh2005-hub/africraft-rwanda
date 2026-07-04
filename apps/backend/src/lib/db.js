import mongoose from 'mongoose';

export async function connectMongo() {
  const uri = process.env.MONGODB_URI;
  if (!uri) {
    console.warn('[db] MONGODB_URI not set. Skipping DB connection (placeholder mode).');
    return;
  }

  try {
    await mongoose.connect(uri);
    console.log('[db] Connected to MongoDB');
  } catch (err) {
    console.error('[db] MongoDB connection failed:', err);
    process.exit(1);
  }
}

