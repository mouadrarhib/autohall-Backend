// src/middlewares/filiale/hasPermission.js

import * as userRoleService from '../../services/userRole.service.js';

/**
 * Role checking middleware specifically for Filiale management operations
 */

// ✅ CHANGED: Different roles for different operations
export const FILIALE_ROLES = {
  // Both admin and intégrateur can READ filiales
  READ_ROLES: ['administrateur fonctionnel', 'intégrateur des objectifs'],
  // Only admin can CREATE/UPDATE/DELETE filiales
  WRITE_ROLES: ['administrateur fonctionnel']
};

/**
 * Generic role checker for filiale operations
 * @param {Array} allowedRoles - Array of role names that are allowed
 * @returns {Function} Express middleware
 */
const requireFilialeRole = (allowedRoles) => {
  return async (req, res, next) => {
    try {
      if (!req.user?.id) {
        return res.status(401).json({ error: 'Authentication required' });
      }

      // Get user's roles
      const userRoles = await userRoleService.getRolesByUser(req.user.id, true);
      if (!userRoles || userRoles.length === 0) {
        return res.status(403).json({
          error: 'Insufficient permissions - No roles assigned',
          required: allowedRoles
        });
      }

      // Check if user has any of the required roles
      const hasRequiredRole = userRoles.some(userRole => {
        const roleName = userRole.name ||
          userRole.roleName ||
          userRole.RoleName ||
          userRole.Name ||
          userRole.role_name ||
          '';
        if (!roleName) return false;
        return allowedRoles.some(allowedRole =>
          roleName.toLowerCase().trim() === allowedRole.toLowerCase().trim()
        );
      });

      if (!hasRequiredRole) {
        return res.status(403).json({
          error: 'Insufficient permissions',
          required: allowedRoles,
          userHasRoles: userRoles.map(r =>
            r.name || r.roleName || r.RoleName || r.Name || r.role_name || 'unknown'
          )
        });
      }

      next();
    } catch (err) {
      console.error('Filiale role check error:', err);
      return res.status(500).json({
        error: 'Role check failed',
        details: err.message
      });
    }
  };
};

// ✅ CHANGED: Specific role middleware for filiale management
// READ: Both 'administrateur fonctionnel' and 'intégrateur des objectifs' can read
export const canReadFiliale = requireFilialeRole(FILIALE_ROLES.READ_ROLES);

// WRITE: Only 'administrateur fonctionnel' can create/update/delete
export const canCreateFiliale = requireFilialeRole(FILIALE_ROLES.WRITE_ROLES);
export const canUpdateFiliale = requireFilialeRole(FILIALE_ROLES.WRITE_ROLES);
export const canDeleteFiliale = requireFilialeRole(FILIALE_ROLES.WRITE_ROLES);
