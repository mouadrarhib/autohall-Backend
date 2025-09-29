// src/middlewares/permission/hasPermission.js

import * as permissionService from '../../services/permission.service.js';

/**
 * Permission checking middleware specifically for Permission management operations
 */

// Permission constants for permission management
export const PERMISSION_ROLES = {
  PERMISSION_CREATE: 'PERMISSION_CREATE',
  PERMISSION_READ: 'PERMISSION_READ',
  PERMISSION_UPDATE: 'PERMISSION_UPDATE',
  PERMISSION_LINK: 'PERMISSION_LINK',
  PERMISSION_LINK_READ: 'PERMISSION_LINK_READ'
};

/**
 * Generic permission checker
 * @param {string} requiredPermission - Permission name required
 * @returns {Function} Express middleware
 */
const requirePermission = (requiredPermission) => {
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
      console.error('Permission check error:', err);
      return res.status(500).json({ error: 'Permission check failed' });
    }
  };
};

// Specific permission middleware for permission management
export const canCreatePermission = requirePermission(PERMISSION_ROLES.PERMISSION_CREATE);
export const canReadPermission = requirePermission(PERMISSION_ROLES.PERMISSION_READ);
export const canUpdatePermission = requirePermission(PERMISSION_ROLES.PERMISSION_UPDATE);
export const canLinkPermission = requirePermission(PERMISSION_ROLES.PERMISSION_LINK);
export const canReadPermissionLinks = requirePermission(PERMISSION_ROLES.PERMISSION_LINK_READ);

// Multi-permission checker (user needs ANY of the permissions)
export const canReadOrLink = async (req, res, next) => {
  try {
    if (!req.user?.id) {
      return res.status(401).json({ error: 'Authentication required' });
    }

    const readResult = await permissionService.userHasPermissionByName(req.user.id, PERMISSION_ROLES.PERMISSION_READ);
    const linkReadResult = await permissionService.userHasPermissionByName(req.user.id, PERMISSION_ROLES.PERMISSION_LINK_READ);
    
    if (!readResult?.hasPermission && !linkReadResult?.hasPermission) {
      return res.status(403).json({
        error: 'Insufficient permissions',
        required: `${PERMISSION_ROLES.PERMISSION_READ} or ${PERMISSION_ROLES.PERMISSION_LINK_READ}`
      });
    }

    next();
  } catch (err) {
    console.error('Permission check error:', err);
    return res.status(500).json({ error: 'Permission check failed' });
  }
};
