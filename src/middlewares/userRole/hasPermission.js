// src/middlewares/userRole/hasPermission.js

import * as permissionService from '../../services/permission.service.js';

export const USER_ROLE_PERMISSIONS = {
  USER_ROLE_CREATE: 'USER_ROLE_CREATE',
  USER_ROLE_READ: 'USER_ROLE_READ',
  USER_ROLE_UPDATE: 'USER_ROLE_UPDATE',
  USER_ROLE_DELETE: 'USER_ROLE_DELETE',
  USER_ROLE_MANAGE: 'USER_ROLE_MANAGE'
};

const requireUserRolePermission = (requiredPermission) => {
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
      console.error('UserRole permission check error:', err);
      return res.status(500).json({ error: 'Permission check failed' });
    }
  };
};

export const canManageUserRole = requireUserRolePermission(USER_ROLE_PERMISSIONS.USER_ROLE_MANAGE);
export const canCreateUserRole = requireUserRolePermission(USER_ROLE_PERMISSIONS.USER_ROLE_CREATE);
export const canReadUserRole = requireUserRolePermission(USER_ROLE_PERMISSIONS.USER_ROLE_READ);
export const canUpdateUserRole = requireUserRolePermission(USER_ROLE_PERMISSIONS.USER_ROLE_UPDATE);
export const canDeleteUserRole = requireUserRolePermission(USER_ROLE_PERMISSIONS.USER_ROLE_DELETE);
