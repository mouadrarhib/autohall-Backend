// src/middlewares/groupement/hasPermission.js

import * as permissionService from '../../services/permission.service.js';

/**
 * Permission checking middleware specifically for Groupement management operations
 */

// Permission constants for groupement management
export const GROUPEMENT_PERMISSIONS = {
  GROUPEMENT_CREATE: 'GROUPEMENT_CREATE',
  GROUPEMENT_READ: 'GROUPEMENT_READ',
  GROUPEMENT_UPDATE: 'GROUPEMENT_UPDATE',
  GROUPEMENT_DELETE: 'GROUPEMENT_DELETE'
};

/**
 * Generic permission checker for groupement operations
 * @param {string} requiredPermission - Permission name required
 * @returns {Function} Express middleware
 */
const requireGroupementPermission = (requiredPermission) => {
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
      console.error('Groupement permission check error:', err);
      return res.status(500).json({ error: 'Permission check failed' });
    }
  };
};

// Specific permission middleware for groupement management
export const canCreateGroupement = requireGroupementPermission(GROUPEMENT_PERMISSIONS.GROUPEMENT_CREATE);
export const canReadGroupement = requireGroupementPermission(GROUPEMENT_PERMISSIONS.GROUPEMENT_READ);
export const canUpdateGroupement = requireGroupementPermission(GROUPEMENT_PERMISSIONS.GROUPEMENT_UPDATE);
export const canDeleteGroupement = requireGroupementPermission(GROUPEMENT_PERMISSIONS.GROUPEMENT_DELETE);
