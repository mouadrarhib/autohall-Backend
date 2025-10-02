// src/middlewares/typeobjectif/hasPermission.js

import * as permissionService from '../../services/permission.service.js';

export const TYPE_OBJECTIF_PERMISSIONS = {
  TYPE_OBJECTIF_CREATE: 'TYPE_OBJECTIF_CREATE',
  TYPE_OBJECTIF_READ: 'TYPE_OBJECTIF_READ',
  TYPE_OBJECTIF_UPDATE: 'TYPE_OBJECTIF_UPDATE'
};

const requireTypeObjectifPermission = (requiredPermission) => {
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
      console.error('TypeObjectif permission check error:', err);
      return res.status(500).json({ error: 'Permission check failed' });
    }
  };
};

export const canCreateTypeObjectif = requireTypeObjectifPermission(TYPE_OBJECTIF_PERMISSIONS.TYPE_OBJECTIF_CREATE);
export const canReadTypeObjectif = requireTypeObjectifPermission(TYPE_OBJECTIF_PERMISSIONS.TYPE_OBJECTIF_READ);
export const canUpdateTypeObjectif = requireTypeObjectifPermission(TYPE_OBJECTIF_PERMISSIONS.TYPE_OBJECTIF_UPDATE);
