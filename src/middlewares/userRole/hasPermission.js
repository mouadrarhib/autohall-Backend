// src/middlewares/userRole/hasPermission.js

import * as userRoleService from '../../services/userRole.service.js';

/**
 * Role checking middleware specifically for UserRole management operations
 */

// Allowed roles for user-role management
export const USER_ROLE_ROLES = {
  ALLOWED_ROLES: ['administrateur fonctionnel']
};

/**
 * Generic role checker for user-role operations
 * @param {Array<string>} allowedRoles - Array of role names that are allowed
 * @returns {Function} Express middleware
 */
const requireUserRoleRole = (allowedRoles) => {
  return async (req, res, next) => {
    try {
      if (!req.user?.id) {
        return res.status(401).json({ error: 'Authentication required' });
      }

      const userRoles = await userRoleService.getRolesByUser(req.user.id, true);

      if (!userRoles || userRoles.length === 0) {
        return res.status(403).json({
          error: 'Insufficient permissions - No roles assigned',
          required: allowedRoles
        });
      }

      const hasRequiredRole = userRoles.some(userRole => {
        const roleName = userRole.name || userRole.roleName || userRole.RoleName || userRole.Name || userRole.role_name || '';
        if (!roleName) return false;
        return allowedRoles.some(allowedRole => roleName.toLowerCase().trim() === allowedRole.toLowerCase().trim());
      });

      if (!hasRequiredRole) {
        return res.status(403).json({
          error: 'Insufficient permissions',
          required: allowedRoles
        });
      }

      next();
    } catch (err) {
      console.error('UserRole role check error:', err);
      return res.status(500).json({ error: 'Role check failed', details: err.message });
    }
  };
};

// All operations require 'administrateur fonctionnel' role
export const canManageUserRole = requireUserRoleRole(USER_ROLE_ROLES.ALLOWED_ROLES);
export const canCreateUserRole = requireUserRoleRole(USER_ROLE_ROLES.ALLOWED_ROLES);
export const canReadUserRole = requireUserRoleRole(USER_ROLE_ROLES.ALLOWED_ROLES);
export const canUpdateUserRole = requireUserRoleRole(USER_ROLE_ROLES.ALLOWED_ROLES);
export const canDeleteUserRole = requireUserRoleRole(USER_ROLE_ROLES.ALLOWED_ROLES);
