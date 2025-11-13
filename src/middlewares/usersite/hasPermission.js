// src/middlewares/usersite/hasPermission.js

import * as userRoleService from '../../services/userRole.service.js';

/**
 * Role checking middleware specifically for UserSite management operations
 */

// ✅ CHANGED: Different roles for different operations
export const USERSITE_ROLES = {
  // Both admin and intégrateur can READ usersites
  READ_ROLES: ['administrateur fonctionnel', 'intégrateur des objectifs', 'intégrateur des ventes'],
  // Only admin can CREATE/UPDATE/DELETE usersites
  WRITE_ROLES: ['administrateur fonctionnel']
};

/**
 * Generic role checker for usersite operations
 * @param {Array} allowedRoles - Array of role names that are allowed
 * @returns {Function} Express middleware
 */
const requireUserSiteRole = (allowedRoles) => {
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
      console.error('UserSite role check error:', err);
      return res.status(500).json({ error: 'Role check failed', details: err.message });
    }
  };
};

// ✅ CHANGED: Specific role middleware
// READ: 'administrateur fonctionnel', 'intégrateur des objectifs' et 'intégrateur des ventes' can read
export const canReadUserSite = requireUserSiteRole(USERSITE_ROLES.READ_ROLES);

// WRITE: Only 'administrateur fonctionnel' can create/update/delete
export const canCreateUserSite = requireUserSiteRole(USERSITE_ROLES.WRITE_ROLES);
export const canUpdateUserSite = requireUserSiteRole(USERSITE_ROLES.WRITE_ROLES);
export const canDeleteUserSite = requireUserSiteRole(USERSITE_ROLES.WRITE_ROLES);
