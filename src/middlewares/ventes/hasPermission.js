// src/middlewares/ventes/hasPermission.js

import * as userRoleService from '../../services/userRole.service.js';

/**
 * Role checking middleware specifically for Ventes management operations
 */

// Role definitions for ventes management
export const VENTES_ROLES = {
  READ_ONLY: ['administrateur fonctionnel'],
  FULL_ACCESS: ['intégrateur des ventes']
};

/**
 * Helper function to check if user has any of the specified roles
 * @param {number} userId - User ID
 * @param {Array} allowedRoles - Array of role names
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
 * Generic role checker for ventes operations
 * @param {Array} allowedRoles - Array of role names that are allowed
 * @returns {Function} Express middleware
 */
const requireVentesRole = (allowedRoles) => {
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
      console.error('Ventes role check error:', err);
      return res.status(500).json({
        error: 'Role check failed',
        details: err.message
      });
    }
  };
};

// READ operation - Both roles can read
export const canReadVente = requireVentesRole([
  ...VENTES_ROLES.READ_ONLY,
  ...VENTES_ROLES.FULL_ACCESS
]);

// CREATE operation - Only intégrateur des ventes
export const canCreateVente = requireVentesRole(VENTES_ROLES.FULL_ACCESS);

// UPDATE operation - Only intégrateur des ventes
export const canUpdateVente = requireVentesRole(VENTES_ROLES.FULL_ACCESS);

// ANALYTICS operation - Both roles can access analytics
export const canAccessAnalytics = requireVentesRole([
  ...VENTES_ROLES.READ_ONLY,
  ...VENTES_ROLES.FULL_ACCESS
]);
