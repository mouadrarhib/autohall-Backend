// src/middlewares/usersite/hasPermission.js

import * as permissionService from '../../services/permission.service.js';

/**
 * Permission checking middleware specifically for UserSite management operations
 */

// Permission constants for usersite management
export const USERSITE_PERMISSIONS = {
  USERSITE_CREATE: 'USERSITE_CREATE',
  USERSITE_READ: 'USERSITE_READ',
  USERSITE_UPDATE: 'USERSITE_UPDATE',
  USERSITE_DELETE: 'USERSITE_DELETE'
};

/**
 * Generic permission checker for usersite operations
 * @param {string} requiredPermission - Permission name required
 * @returns {Function} Express middleware
 */
const requireUserSitePermission = (requiredPermission) => {
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
      console.error('UserSite permission check error:', err);
      return res.status(500).json({ error: 'Permission check failed' });
    }
  };
};

// Specific permission middleware for usersite management
export const canCreateUserSite = requireUserSitePermission(USERSITE_PERMISSIONS.USERSITE_CREATE);
export const canReadUserSite = requireUserSitePermission(USERSITE_PERMISSIONS.USERSITE_READ);
export const canUpdateUserSite = requireUserSitePermission(USERSITE_PERMISSIONS.USERSITE_UPDATE);
export const canDeleteUserSite = requireUserSitePermission(USERSITE_PERMISSIONS.USERSITE_DELETE);
