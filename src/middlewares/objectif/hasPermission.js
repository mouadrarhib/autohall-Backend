// src/middlewares/objectif/hasPermission.js

import * as permissionService from '../../services/permission.service.js';

export const OBJECTIF_PERMISSIONS = {
  OBJECTIF_CREATE: 'OBJECTIF_CREATE',
  OBJECTIF_READ: 'OBJECTIF_READ',
  OBJECTIF_UPDATE: 'OBJECTIF_UPDATE'
};

const requireObjectifPermission = (requiredPermission) => {
  return async (req, res, next) => {
    try {
      if (!req.user?.id) {
        return res.status(401).json({ error: 'Authentication required' });
      }
      const result = await permissionService.userHasPermissionByName(req.user.id, requiredPermission);
      if (!result?.hasPermission) {
        return res.status(403).json({ error: 'Insufficient permissions', required: requiredPermission });
      }
      next();
    } catch (err) {
      console.error('Objectif permission check error:', err);
      return res.status(500).json({ error: 'Permission check failed' });
    }
  };
};

export const canCreateObjectif = requireObjectifPermission(OBJECTIF_PERMISSIONS.OBJECTIF_CREATE);
export const canReadObjectif = requireObjectifPermission(OBJECTIF_PERMISSIONS.OBJECTIF_READ);
export const canUpdateObjectif = requireObjectifPermission(OBJECTIF_PERMISSIONS.OBJECTIF_UPDATE);
