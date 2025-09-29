// src/middlewares/typeperiode/hasPermission.js

import * as permissionService from '../../services/permission.service.js';

export const TYPE_PERIODE_PERMISSIONS = {
  TYPE_PERIODE_CREATE: 'TYPE_PERIODE_CREATE',
  TYPE_PERIODE_READ: 'TYPE_PERIODE_READ',
  TYPE_PERIODE_UPDATE: 'TYPE_PERIODE_UPDATE'
};

const requireTypePeriodePermission = (requiredPermission) => {
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
      console.error('TypePeriode permission check error:', err);
      return res.status(500).json({ error: 'Permission check failed' });
    }
  };
};

export const canCreateTypePeriode = requireTypePeriodePermission(TYPE_PERIODE_PERMISSIONS.TYPE_PERIODE_CREATE);
export const canReadTypePeriode = requireTypePeriodePermission(TYPE_PERIODE_PERMISSIONS.TYPE_PERIODE_READ);
export const canUpdateTypePeriode = requireTypePeriodePermission(TYPE_PERIODE_PERMISSIONS.TYPE_PERIODE_UPDATE);
