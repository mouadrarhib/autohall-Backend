// src/middlewares/auth/hasPermission.js

import * as permissionService from '../../services/permission.service.js';

// Permission constants for auth domain (adjust names to match DB permission keys)
export const AUTH_PERMISSIONS = {
  AUTH_READ: 'AUTH_READ',
  AUTH_MANAGE: 'AUTH_MANAGE',
  AUTH_ADMIN: 'AUTH_ADMIN',
};

// Generic permission checker for auth operations
const requireAuthPermission = (requiredPermission) => {
  return async (req, res, next) => {
    try {
      if (!req.user?.id) {
        return res.status(401).json({ error: 'Authentication required' });
      }
      const result = await permissionService.userHasPermissionByName(req.user.id, requiredPermission);
      if (!result?.hasPermission) {
        return res.status(403).json({
          error: 'Insufficient permissions',
          required: requiredPermission,
        });
      }
      next();
    } catch (err) {
      console.error('Auth permission check error:', err);
      return res.status(500).json({ error: 'Permission check failed' });
    }
  };
};

// Specific permission middleware for auth management
export const canReadAuth = requireAuthPermission(AUTH_PERMISSIONS.AUTH_READ);
export const canManageAuth = requireAuthPermission(AUTH_PERMISSIONS.AUTH_MANAGE);
export const canAdminAuth = requireAuthPermission(AUTH_PERMISSIONS.AUTH_ADMIN);
