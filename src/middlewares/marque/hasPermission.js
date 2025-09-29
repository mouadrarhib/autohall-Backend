// src/middleware/marque/hasPermission.js

import * as permissionService from '../../services/permission.service.js';

/**
 * Permission checking middleware specifically for Marque management operations
 */

// Permission constants for marque management
export const MARQUE_PERMISSIONS = {
  MARQUE_CREATE: 'MARQUE_CREATE',
  MARQUE_READ: 'MARQUE_READ',
  MARQUE_UPDATE: 'MARQUE_UPDATE',
  MARQUE_DELETE: 'MARQUE_DELETE'
};

/**
 * Generic permission checker for marque operations
 * @param {string} requiredPermission - Permission name required
 * @returns {Function} Express middleware
 */
const requireMarquePermission = (requiredPermission) => {
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
      console.error('Marque permission check error:', err);
      return res.status(500).json({ error: 'Permission check failed' });
    }
  };
};

// Specific permission middleware for marque management
export const canCreateMarque = requireMarquePermission(MARQUE_PERMISSIONS.MARQUE_CREATE);
export const canReadMarque = requireMarquePermission(MARQUE_PERMISSIONS.MARQUE_READ);
export const canUpdateMarque = requireMarquePermission(MARQUE_PERMISSIONS.MARQUE_UPDATE);
export const canDeleteMarque = requireMarquePermission(MARQUE_PERMISSIONS.MARQUE_DELETE);
