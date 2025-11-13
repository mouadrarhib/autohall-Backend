// src/middlewares/modele/hasPermission.js

import * as userRoleService from '../../services/userRole.service.js';

export const MODELE_ROLES = {
  FULL_ACCESS: ['administrateur fonctionnel'],
  READ_ONLY: ['intégrateur des objectifs', 'intégrateur des ventes']
};

const requireModeleRole = (allowedRoles) => {
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
      console.error('Modele role check error:', err);
      return res.status(500).json({ error: 'Role check failed', details: err.message });
    }
  };
};

// READ - Both roles can read
export const canReadModele = requireModeleRole([
  ...MODELE_ROLES.FULL_ACCESS,
  ...MODELE_ROLES.READ_ONLY
]);

// CREATE/UPDATE/DELETE - Only administrateur fonctionnel
export const canCreateModele = requireModeleRole(MODELE_ROLES.FULL_ACCESS);
export const canUpdateModele = requireModeleRole(MODELE_ROLES.FULL_ACCESS);
export const canDeleteModele = requireModeleRole(MODELE_ROLES.FULL_ACCESS);
