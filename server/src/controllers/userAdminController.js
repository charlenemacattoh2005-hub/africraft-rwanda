import { User }  from '../models/User.js';
import bcrypt from 'bcrypt';

export async function getAdminCustomers(req, res, next) {
  try {
    const { search, page = 1, limit = 50 } = req.query;
    const filter = { role: 'customer' };
    if (search) filter.$or = [
      { fullName: { $regex: search, $options: 'i' } },
      { email:    { $regex: search, $options: 'i' } },
    ];
    const skip = (Number(page) - 1) * Number(limit);
    const [users, total] = await Promise.all([
      User.find(filter).select('-passwordHash').sort({ createdAt: -1 }).skip(skip).limit(Number(limit)).lean(),
      User.countDocuments(filter),
    ]);
    return res.json({ users, total });
  } catch (err) { return next(err); }
}

export async function getAllUsers(req, res, next) {
  try {
    const { role, search, page = 1, limit = 50 } = req.query;
    const filter = {};
    if (role && role !== 'all') filter.role = role;
    if (search) filter.$or = [
      { fullName: { $regex: search, $options: 'i' } },
      { email:    { $regex: search, $options: 'i' } },
    ];
    const skip = (Number(page) - 1) * Number(limit);
    const [users, total] = await Promise.all([
      User.find(filter).select('-passwordHash').sort({ createdAt: -1 }).skip(skip).limit(Number(limit)).lean(),
      User.countDocuments(filter),
    ]);
    return res.json({ users, total });
  } catch (err) { return next(err); }
}

export async function createUser(req, res, next) {
  try {
    const { fullName, email, password, role, phone, address, bio } = req.body;
    if (!fullName || !email || !password)
      return res.status(400).json({ message: 'fullName, email and password are required' });
    if (await User.findOne({ email }))
      return res.status(409).json({ message: 'Email already registered' });
    const passwordHash = await bcrypt.hash(password, 10);
    const user = await User.create({ fullName, email, passwordHash, role: role || 'customer', phone, address, bio });
    const { passwordHash: _ph, ...safe } = user.toObject();
    return res.status(201).json({ user: safe });
  } catch (err) { return next(err); }
}

export async function updateUser(req, res, next) {
  try {
    const allowed = ['fullName','email','role','phone','address','bio','profilePhoto','isActive'];
    const updates = {};
    allowed.forEach(k => { if (req.body[k] !== undefined) updates[k] = req.body[k]; });
    if (req.body.password) updates.passwordHash = await bcrypt.hash(req.body.password, 10);
    const user = await User.findByIdAndUpdate(req.params.id, updates, { new: true, select: '-passwordHash' });
    if (!user) return res.status(404).json({ message: 'User not found' });
    return res.json({ user });
  } catch (err) { return next(err); }
}

export async function deleteUser(req, res, next) {
  try {
    if (req.params.id === req.user.userId)
      return res.status(400).json({ message: 'Cannot delete your own account' });
    await User.findByIdAndDelete(req.params.id);
    return res.json({ message: 'User deleted' });
  } catch (err) { return next(err); }
}

export async function suspendUser(req, res, next) {
  try {
    const user = await User.findByIdAndUpdate(
      req.params.id,
      { isActive: !req.body.suspend },
      { new: true, select: '-passwordHash' }
    );
    if (!user) return res.status(404).json({ message: 'User not found' });
    return res.json({ user });
  } catch (err) { return next(err); }
}

export async function assignRole(req, res, next) {
  try {
    const { role } = req.body;
    if (!['customer','vendor','rider','admin'].includes(role))
      return res.status(400).json({ message: 'Invalid role' });
    const user = await User.findByIdAndUpdate(req.params.id, { role }, { new: true, select: '-passwordHash' });
    if (!user) return res.status(404).json({ message: 'User not found' });
    return res.json({ user });
  } catch (err) { return next(err); }
}
