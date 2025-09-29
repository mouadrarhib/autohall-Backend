// src/middleware/role/hasPermission.js

import * as permissionService from '../../services/permission.service.js';

/**
 * Permission checking middleware specifically for Role management operations
 */

// Permission constants for role management
export const ROLE_PERMISSIONS = {
  ROLE_CREATE: 'ROLE_CREATE',
  ROLE_READ: 'ROLE_READ',
  ROLE_UPDATE: 'ROLE_UPDATE',
  ROLE_DELETE: 'ROLE_DELETE'
};

/**
 * Generic permission checker for role operations
 * @param {string} requiredPermission - Permission name required
 * @returns {Function} Express middleware
 */
const requireRolePermission = (requiredPermission) => {
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
      console.error('Role permission check error:', err);
      return res.status(500).json({ error: 'Permission check failed' });
    }
  };
};

// Specific permission middleware for role management
export const canCreateRole = requireRolePermission(ROLE_PERMISSIONS.ROLE_CREATE);
export const canReadRole = requireRolePermission(ROLE_PERMISSIONS.ROLE_READ);
export const canUpdateRole = requireRolePermission(ROLE_PERMISSIONS.ROLE_UPDATE);
export const canDeleteRole = requireRolePermission(ROLE_PERMISSIONS.ROLE_DELETE);
