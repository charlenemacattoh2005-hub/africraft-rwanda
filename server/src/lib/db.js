import mongoose from 'mongoose';

export async function connectMongo() {
  const uri = process.env.MONGODB_URI;
  if (!uri) {
    console.warn('[db] MONGODB_URI not set. Skipping DB connection (placeholder mode).');
    return false;
  }

  try {
    await mongoose.connect(uri, { serverSelectionTimeoutMS: 3000 });
    console.log('[db] Connected to MongoDB');
    return true;
  } catch (err) {
    console.warn('[db] MongoDB connection failed; continuing in placeholder mode:', err.message);
    return false;
  }
}

