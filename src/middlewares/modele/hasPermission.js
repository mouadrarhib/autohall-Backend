// src/middlewares/modele/hasPermission.js

import * as permissionService from '../../services/permission.service.js';

/**
 * Permission checking middleware specifically for Modele management operations
 */

// Permission constants for modele management
export const MODELE_PERMISSIONS = {
  MODELE_CREATE: 'MODELE_CREATE',
  MODELE_READ: 'MODELE_READ',
  MODELE_UPDATE: 'MODELE_UPDATE',
  MODELE_DELETE: 'MODELE_DELETE'
};

/**
 * Generic permission checker for modele operations
 * @param {string} requiredPermission - Permission name required
 * @returns {Function} Express middleware
 */
const requireModelePermission = (requiredPermission) => {
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
      console.error('Modele permission check error:', err);
      return res.status(500).json({ error: 'Permission check failed' });
    }
  };
};

// Specific permission middleware for modele management
export const canCreateModele = requireModelePermission(MODELE_PERMISSIONS.MODELE_CREATE);
export const canReadModele = requireModelePermission(MODELE_PERMISSIONS.MODELE_READ);
export const canUpdateModele = requireModelePermission(MODELE_PERMISSIONS.MODELE_UPDATE);
export const canDeleteModele = requireModelePermission(MODELE_PERMISSIONS.MODELE_DELETE);
