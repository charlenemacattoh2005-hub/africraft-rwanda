import jwt from 'jsonwebtoken';

export function requireAuth(req, res, next) {
  const header = req.headers.authorization || '';
  const token = header.startsWith('Bearer ') ? header.slice('Bearer '.length) : null;

  if (!token) {
    return res.status(401).json({ message: 'Missing authorization token' });
  }

  try {
    const secret = process.env.JWT_SECRET;
    if (!secret) {
      return res.status(500).json({ message: 'JWT_SECRET not configured' });
    }

    const decoded = jwt.verify(token, secret);
    // decoded is { userId, email, role, iat, exp }
    req.user = decoded;
    return next();
  } catch (err) {
    return res.status(401).json({ message: 'Invalid/expired token' });
  }
}

