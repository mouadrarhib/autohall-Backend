// src/middlewares/objectif/hasPermission.js

import * as userRoleService from '../../services/userRole.service.js';

/**
 * Role checking middleware specifically for Objectif management operations
 */

// Role definitions for objectif management
export const OBJECTIF_ROLES = {
  READ_ONLY: ['administrateur fonctionnel'],
  FULL_ACCESS: ['intégrateur des objectifs']
};

/**
 * Helper function to check if user has any of the specified roles
 * @param {number} userId - User ID
 * @param {Array<string>} allowedRoles - Array of role names
 * @returns {Promise<boolean>}
 */
async function userHasAnyRole(userId, allowedRoles) {
  const userRoles = await userRoleService.getRolesByUser(userId, true);

  if (!userRoles || userRoles.length === 0) {
    return false;
  }

  return userRoles.some(userRole => {
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
}

/**
 * Generic role checker for objectif operations
 * @param {Array<string>} allowedRoles - Array of role names that are allowed
 * @returns {Function} Express middleware
 */
const requireObjectifRole = (allowedRoles) => {
  return async (req, res, next) => {
    try {
      if (!req.user?.id) {
        return res.status(401).json({ error: 'Authentication required' });
      }

      const hasRequiredRole = await userHasAnyRole(req.user.id, allowedRoles);

      if (!hasRequiredRole) {
        return res.status(403).json({
          error: 'Insufficient permissions',
          required: `One of the following roles: ${allowedRoles.join(', ')}`
        });
      }

      next();
    } catch (err) {
      console.error('Objectif role check error:', err);
      return res.status(500).json({ 
        error: 'Role check failed',
        details: err.message
      });
    }
  };
};

// READ operation - Both roles can read
export const canReadObjectif = requireObjectifRole([
  ...OBJECTIF_ROLES.READ_ONLY,
  ...OBJECTIF_ROLES.FULL_ACCESS
]);

// CREATE operation - Only intégrateur des objectifs
export const canCreateObjectif = requireObjectifRole(OBJECTIF_ROLES.FULL_ACCESS);

// UPDATE operation - Only intégrateur des objectifs
export const canUpdateObjectif = requireObjectifRole(OBJECTIF_ROLES.FULL_ACCESS);
