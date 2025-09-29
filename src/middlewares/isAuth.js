import jwt from 'jsonwebtoken';
import * as authService from '../services/auth.service.js';

export async function isAuth(req, res, next) {
  try {
    const raw = req.headers.authorization || '';
    const token = raw.replace(/^Bearer\s+/i, '').trim();

    if (!token) return res.status(401).json({ error: 'Unauthorized' });

    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'dev-secret');

    const id = parseInt(decoded.id, 10);
    if (!id || id <= 0) {
      console.log('Decoded token:', decoded);
      return res.status(401).json({ error: 'Invalid user id in token' });
    }

    const user = await authService.getUserById(id);
    if (!user) return res.status(401).json({ error: 'Unauthorized' });

    // strip password before attaching
    const { password, ...safe } = user;
    req.user = { ...safe, id };

    next();
  } catch (err) {
    console.error('isAuth middleware error:', err);
    return res.status(401).json({ error: 'Invalid credential' });
  }
}
