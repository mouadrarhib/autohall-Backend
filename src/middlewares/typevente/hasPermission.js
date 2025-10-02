// src/middlewares/typevente/hasPermission.js

import * as permissionService from '../../services/permission.service.js';

export const TYPE_VENTE_PERMISSIONS = {
  TYPE_VENTE_CREATE: 'TYPE_VENTE_CREATE',
  TYPE_VENTE_READ: 'TYPE_VENTE_READ',
  TYPE_VENTE_UPDATE: 'TYPE_VENTE_UPDATE'
};

const requireTypeVentePermission = (requiredPermission) => {
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
      console.error('TypeVente permission check error:', err);
      return res.status(500).json({ error: 'Permission check failed' });
    }
  };
};

export const canCreateTypeVente = requireTypeVentePermission(TYPE_VENTE_PERMISSIONS.TYPE_VENTE_CREATE);
export const canReadTypeVente = requireTypeVentePermission(TYPE_VENTE_PERMISSIONS.TYPE_VENTE_READ);
export const canUpdateTypeVente = requireTypeVentePermission(TYPE_VENTE_PERMISSIONS.TYPE_VENTE_UPDATE);
