// src/middlewares/rolePermission/hasPermission.js
import * as permissionService from '../../services/permission.service.js';

export const ROLE_PERMISSION_PERMISSIONS = {
  ROLE_PERMISSION_CREATE: 'ROLE_PERMISSION_CREATE',
  ROLE_PERMISSION_READ: 'ROLE_PERMISSION_READ',
  ROLE_PERMISSION_UPDATE: 'ROLE_PERMISSION_UPDATE',
  ROLE_PERMISSION_DELETE: 'ROLE_PERMISSION_DELETE',
  ROLE_PERMISSION_MANAGE: 'ROLE_PERMISSION_MANAGE'
};

const requireRolePermissionPermission = (requiredPermission) => {
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
      console.error('RolePermission permission check error:', err);
      return res.status(500).json({ error: 'Permission check failed' });
    }
  };
};

export const canCreateRolePermission = requireRolePermissionPermission(ROLE_PERMISSION_PERMISSIONS.ROLE_PERMISSION_CREATE);
export const canReadRolePermission = requireRolePermissionPermission(ROLE_PERMISSION_PERMISSIONS.ROLE_PERMISSION_READ);
export const canUpdateRolePermission = requireRolePermissionPermission(ROLE_PERMISSION_PERMISSIONS.ROLE_PERMISSION_UPDATE);
export const canDeleteRolePermission = requireRolePermissionPermission(ROLE_PERMISSION_PERMISSIONS.ROLE_PERMISSION_DELETE);
export const canManageRolePermission = requireRolePermissionPermission(ROLE_PERMISSION_PERMISSIONS.ROLE_PERMISSION_MANAGE);
