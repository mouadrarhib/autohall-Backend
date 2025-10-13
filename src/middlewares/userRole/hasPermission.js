// src/middlewares/userRole/hasPermission.js
import * as permissionService from '../../services/permission.service.js';

export const USER_ROLE_PERMISSIONS = {
  USER_ROLE_READ: 'USER_ROLE_READ',
  USER_ROLE_LINK: 'USER_ROLE_LINK',
  USER_ROLE_UPDATE: 'USER_ROLE_UPDATE',
  USER_ROLE_SYNC: 'USER_ROLE_SYNC',
  USER_ROLE_DELETE: 'USER_ROLE_DELETE'
};

const requireUserRolePermission = (requiredPermission) => {
  return async (req, res, next) => {
    try {
      if (!req.user?.id) return res.status(401).json({ error: 'Authentication required' });
      const result = await permissionService.userHasPermissionByName(req.user.id, requiredPermission);
      if (!result?.hasPermission) {
        return res.status(403).json({ error: 'Insufficient permissions', required: requiredPermission });
      }
      next();
    } catch (err) {
      console.error('UserRole permission check error:', err);
      return res.status(500).json({ error: 'Permission check failed' });
    }
  };
};

export const canReadUserRole = requireUserRolePermission(USER_ROLE_PERMISSIONS.USER_ROLE_READ);
export const canLinkUserRole = requireUserRolePermission(USER_ROLE_PERMISSIONS.USER_ROLE_LINK);
export const canUpdateUserRole = requireUserRolePermission(USER_ROLE_PERMISSIONS.USER_ROLE_UPDATE);
export const canSyncUserRole = requireUserRolePermission(USER_ROLE_PERMISSIONS.USER_ROLE_SYNC);
export const canDeleteUserRole = requireUserRolePermission(USER_ROLE_PERMISSIONS.USER_ROLE_DELETE);
