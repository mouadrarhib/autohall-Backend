// src/middlewares/filiale/hasPermission.js

import * as userRoleService from '../../services/userRole.service.js';

/**
 * Role checking middleware specifically for Filiale management operations
 */

// Allowed roles for filiale management
export const FILIALE_ROLES = {
  ALLOWED_ROLES: ['administrateur fonctionnel']
};

/**
 * Generic role checker for filiale operations
 * @param {Array<string>} allowedRoles - Array of role names that are allowed
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

// Specific role middleware for filiale management
// All operations require 'administrateur fonctionnel' role
export const canCreateFiliale = requireFilialeRole(FILIALE_ROLES.ALLOWED_ROLES);
export const canReadFiliale = requireFilialeRole(FILIALE_ROLES.ALLOWED_ROLES);
export const canUpdateFiliale = requireFilialeRole(FILIALE_ROLES.ALLOWED_ROLES);
export const canDeleteFiliale = requireFilialeRole(FILIALE_ROLES.ALLOWED_ROLES);
