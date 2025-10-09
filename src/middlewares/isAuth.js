import jwt from 'jsonwebtoken';
import * as authService from '../services/auth.service.js';

export async function isAuth(req, res, next) {
  try {
    // Try to get token from cookie first, then from Authorization header
    let token = req.cookies.token;
    
    if (!token) {
      const raw = req.headers.authorization || '';
      token = raw.replace(/^Bearer\s+/i, '').trim();
    }
    
    if (!token) {
      return res.status(401).json({ error: 'Unauthorized' });
    }
    
    // Verify JWT token
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'dev-secret');
    const id = parseInt(decoded.id, 10);
    
    if (!id || id <= 0) {
      console.log('Decoded token:', decoded);
      return res.status(401).json({ error: 'Invalid user id in token' });
    }
    
    // Fetch user from database
    const user = await authService.getUserById(id);
    if (!user) {
      return res.status(401).json({ error: 'Unauthorized' });
    }
    
    // Strip password before attaching to request
    const { password, ...safe } = user;
    req.user = { ...safe, id };
    
    next();
  } catch (err) {
    console.error('isAuth middleware error:', err);
    return res.status(401).json({ error: 'Invalid credential' });
  }
}
