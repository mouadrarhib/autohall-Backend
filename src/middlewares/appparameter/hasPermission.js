// src/middlewares/appparameter/hasPermission.js

import * as permissionService from '../../services/permission.service.js';

/**
 * Permission checking middleware specifically for AppParameter management operations
 */

// Permission constants for app parameter management
export const APPPARAMETER_PERMISSIONS = {
  APPPARAMETER_CREATE: 'APPPARAMETER_CREATE',
  APPPARAMETER_READ: 'APPPARAMETER_READ',
  APPPARAMETER_UPDATE: 'APPPARAMETER_UPDATE',
  APPPARAMETER_DELETE: 'APPPARAMETER_DELETE',
  APPPARAMETER_SET: 'APPPARAMETER_SET' // Special permission for upsert operations
};

/**
 * Generic permission checker for app parameter operations
 * @param {string} requiredPermission - Permission name required
 * @returns {Function} Express middleware
 */
const requireAppParameterPermission = (requiredPermission) => {
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
      console.error('AppParameter permission check error:', err);
      return res.status(500).json({ error: 'Permission check failed' });
    }
  };
};

// Specific permission middleware for app parameter management
export const canCreateAppParameter = requireAppParameterPermission(APPPARAMETER_PERMISSIONS.APPPARAMETER_CREATE);
export const canReadAppParameter = requireAppParameterPermission(APPPARAMETER_PERMISSIONS.APPPARAMETER_READ);
export const canUpdateAppParameter = requireAppParameterPermission(APPPARAMETER_PERMISSIONS.APPPARAMETER_UPDATE);
export const canDeleteAppParameter = requireAppParameterPermission(APPPARAMETER_PERMISSIONS.APPPARAMETER_DELETE);
export const canSetAppParameter = requireAppParameterPermission(APPPARAMETER_PERMISSIONS.APPPARAMETER_SET);
