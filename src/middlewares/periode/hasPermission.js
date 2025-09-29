// src/middlewares/periode/hasPermission.js

import * as permissionService from '../../services/permission.service.js';

export const PERIODE_PERMISSIONS = {
  PERIODE_CREATE: 'PERIODE_CREATE',
  PERIODE_READ: 'PERIODE_READ',
  PERIODE_UPDATE: 'PERIODE_UPDATE'
};

const requirePeriodePermission = (requiredPermission) => {
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
      console.error('Periode permission check error:', err);
      return res.status(500).json({ error: 'Permission check failed' });
    }
  };
};

export const canCreatePeriode = requirePeriodePermission(PERIODE_PERMISSIONS.PERIODE_CREATE);
export const canReadPeriode = requirePeriodePermission(PERIODE_PERMISSIONS.PERIODE_READ);
export const canUpdatePeriode = requirePeriodePermission(PERIODE_PERMISSIONS.PERIODE_UPDATE);
