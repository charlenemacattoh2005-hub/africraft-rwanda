import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { User } from '../models/User.js';

function signToken(user) {
  const secret = process.env.JWT_SECRET;
  if (!secret) throw new Error('JWT_SECRET not configured');

  const expire = process.env.JWT_EXPIRE || '7d';

  return jwt.sign(
    { userId: user._id.toString(), email: user.email, role: user.role },
    secret,
    { expiresIn: expire }
  );
}

export async function register(req, res, next) {
  try {
    const { fullName, email, password } = req.body;

    const exists = await User.findOne({ email });
    if (exists) {
      return res.status(409).json({ message: 'Email already registered' });
    }

    const passwordHash = await bcrypt.hash(password, 10);
    const user = await User.create({ fullName, email, passwordHash });

    const token = signToken(user);
    return res.status(201).json({ token, user: { id: user._id, fullName: user.fullName, email: user.email, role: user.role } });
  } catch (err) {
    return next(err);
  }
}

export async function login(req, res, next) {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(401).json({ message: 'Invalid email or password' });
    }

    const ok = await bcrypt.compare(password, user.passwordHash);
    if (!ok) {
      return res.status(401).json({ message: 'Invalid email or password' });
    }

    const token = signToken(user);
    return res.json({ token, user: { id: user._id, fullName: user.fullName, email: user.email, role: user.role } });
  } catch (err) {
    return next(err);
  }
}

