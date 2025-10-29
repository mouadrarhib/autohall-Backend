// src/middlewares/typeobjectif/hasPermission.js

import * as userRoleService from '../../services/userRole.service.js';

export const TYPE_OBJECTIF_ROLES = {
  FULL_ACCESS: ['administrateur fonctionnel'],
  READ_ONLY: ['intégrateur des objectifs']
};

const requireTypeObjectifRole = (allowedRoles) => {
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
      console.error('TypeObjectif role check error:', err);
      return res.status(500).json({ error: 'Role check failed', details: err.message });
    }
  };
};

// READ - Both roles can read
export const canReadTypeObjectif = requireTypeObjectifRole([
  ...TYPE_OBJECTIF_ROLES.FULL_ACCESS,
  ...TYPE_OBJECTIF_ROLES.READ_ONLY
]);

// CREATE/UPDATE - Only administrateur fonctionnel
export const canCreateTypeObjectif = requireTypeObjectifRole(TYPE_OBJECTIF_ROLES.FULL_ACCESS);
export const canUpdateTypeObjectif = requireTypeObjectifRole(TYPE_OBJECTIF_ROLES.FULL_ACCESS);
