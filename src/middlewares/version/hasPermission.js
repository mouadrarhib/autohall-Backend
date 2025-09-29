// src/middlewares/version/hasPermission.js

import * as permissionService from '../../services/permission.service.js';

/**
 * Permission checking middleware specifically for Version management operations
 */

// Permission constants for version management
export const VERSION_PERMISSIONS = {
  VERSION_CREATE: 'VERSION_CREATE',
  VERSION_READ: 'VERSION_READ',
  VERSION_UPDATE: 'VERSION_UPDATE',
  VERSION_DELETE: 'VERSION_DELETE'
};

/**
 * Generic permission checker for version operations
 * @param {string} requiredPermission - Permission name required
 * @returns {Function} Express middleware
 */
const requireVersionPermission = (requiredPermission) => {
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
      console.error('Version permission check error:', err);
      return res.status(500).json({ error: 'Permission check failed' });
    }
  };
};

// Specific permission middleware for version management
export const canCreateVersion = requireVersionPermission(VERSION_PERMISSIONS.VERSION_CREATE);
export const canReadVersion = requireVersionPermission(VERSION_PERMISSIONS.VERSION_READ);
export const canUpdateVersion = requireVersionPermission(VERSION_PERMISSIONS.VERSION_UPDATE);
export const canDeleteVersion = requireVersionPermission(VERSION_PERMISSIONS.VERSION_DELETE);
