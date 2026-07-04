import { User } from '../models/User.js';

export async function getProfile(req, res, next) {
  try {
    const userId = req.user?.userId;
    if (!userId) return res.status(401).json({ message: 'Unauthorized' });

    const user = await User.findById(userId).select('-passwordHash');
    if (!user) return res.status(404).json({ message: 'User not found' });

    return res.json({ user });
  } catch (err) {
    return next(err);
  }
}

export async function updateProfile(req, res, next) {
  try {
    const userId = req.user?.userId;
    if (!userId) return res.status(401).json({ message: 'Unauthorized' });

    const updates = req.body;
    const user = await User.findByIdAndUpdate(userId, updates, {
      new: true,
      runValidators: true,
      select: '-passwordHash',
    });

    if (!user) return res.status(404).json({ message: 'User not found' });

    return res.json({ user });
  } catch (err) {
    return next(err);
  }
}
