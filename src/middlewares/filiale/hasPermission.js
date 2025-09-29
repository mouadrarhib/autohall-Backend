// src/middlewares/filiale/hasPermission.js

import * as permissionService from '../../services/permission.service.js';

/**
 * Permission checking middleware specifically for Filiale management operations
 */

// Permission constants for filiale management
export const FILIALE_PERMISSIONS = {
  FILIALE_CREATE: 'FILIALE_CREATE',
  FILIALE_READ: 'FILIALE_READ',
  FILIALE_UPDATE: 'FILIALE_UPDATE',
  FILIALE_DELETE: 'FILIALE_DELETE'
};

/**
 * Generic permission checker for filiale operations
 * @param {string} requiredPermission - Permission name required
 * @returns {Function} Express middleware
 */
const requireFilialePermission = (requiredPermission) => {
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
      console.error('Filiale permission check error:', err);
      return res.status(500).json({ error: 'Permission check failed' });
    }
  };
};

// Specific permission middleware for filiale management
export const canCreateFiliale = requireFilialePermission(FILIALE_PERMISSIONS.FILIALE_CREATE);
export const canReadFiliale = requireFilialePermission(FILIALE_PERMISSIONS.FILIALE_READ);
export const canUpdateFiliale = requireFilialePermission(FILIALE_PERMISSIONS.FILIALE_UPDATE);
export const canDeleteFiliale = requireFilialePermission(FILIALE_PERMISSIONS.FILIALE_DELETE);
