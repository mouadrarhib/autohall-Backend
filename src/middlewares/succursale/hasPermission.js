// src/middlewares/succursale/hasPermission.js

import * as permissionService from '../../services/permission.service.js';

/**
 * Permission checking middleware specifically for Succursale management operations
 */

// Permission constants for succursale management
export const SUCCURSALE_PERMISSIONS = {
  SUCCURSALE_CREATE: 'SUCCURSALE_CREATE',
  SUCCURSALE_READ: 'SUCCURSALE_READ',
  SUCCURSALE_UPDATE: 'SUCCURSALE_UPDATE',
  SUCCURSALE_DELETE: 'SUCCURSALE_DELETE'
};

/**
 * Generic permission checker for succursale operations
 * @param {string} requiredPermission - Permission name required
 * @returns {Function} Express middleware
 */
const requireSuccursalePermission = (requiredPermission) => {
  return async (req, res, next) => {
    try {
      if (!req.user?.id) {
        return res.status(401).json({ error: 'Authentication required' });
      }

      const result = await permissionService.userHasPermissionByName(req.user.id, requiredPermission);
      
      if (!result?.hasPermission) {
        return res.status(403).json({ 
          error: 'Insufficient permissions', 
          required: requiredPermission 
        });
      }

      next();
    } catch (err) {
      console.error('Succursale permission check error:', err);
      return res.status(500).json({ error: 'Permission check failed' });
    }
  };
};

// Specific permission middleware for succursale management
export const canCreateSuccursale = requireSuccursalePermission(SUCCURSALE_PERMISSIONS.SUCCURSALE_CREATE);
export const canReadSuccursale = requireSuccursalePermission(SUCCURSALE_PERMISSIONS.SUCCURSALE_READ);
export const canUpdateSuccursale = requireSuccursalePermission(SUCCURSALE_PERMISSIONS.SUCCURSALE_UPDATE);
export const canDeleteSuccursale = requireSuccursalePermission(SUCCURSALE_PERMISSIONS.SUCCURSALE_DELETE);
