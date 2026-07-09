import bcrypt from 'bcrypt';
import mongoose from 'mongoose';

const MONGO_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/africraft-rwanda';

const userSchema = new mongoose.Schema({
  fullName: String, email: String, passwordHash: String,
  role: { type: String, default: 'customer' },
  isActive: { type: Boolean, default: true },
}, { timestamps: true });

const User = mongoose.models.User || mongoose.model('User', userSchema);

const USERS = [
  { fullName: 'Admin User',    email: 'admin@dellcraft.rw',    password: 'Admin@2026!',  role: 'admin'    },
  { fullName: 'Vendor User',   email: 'vendor@dellcraft.rw',   password: 'Admin@2026!',  role: 'vendor'   },
  { fullName: 'Test Customer', email: 'customer@dellcraft.rw', password: 'Admin@2026!',  role: 'customer' },
];

await mongoose.connect(MONGO_URI);

for (const u of USERS) {
  const hash = await bcrypt.hash(u.password, 10);
  await User.findOneAndUpdate(
    { email: u.email },
    { fullName: u.fullName, email: u.email, passwordHash: hash, role: u.role, isActive: true },
    { upsert: true, new: true }
  );
  console.log(`✓ ${u.role}: ${u.email}`);
}

await mongoose.disconnect();
console.log('Done.');
