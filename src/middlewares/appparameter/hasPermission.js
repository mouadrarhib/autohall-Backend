// src/middlewares/appparameter/hasPermission.js

import * as userRoleService from '../../services/userRole.service.js';

/**
 * Role checking middleware specifically for AppParameter management operations
 */

// Allowed roles for app parameter management
export const APPPARAMETER_ROLES = {
  ALLOWED_ROLES: ['administrateur fonctionnel']
};

/**
 * Generic role checker for app parameter operations
 * @param {Array<string>} allowedRoles - Array of role names that are allowed
 * @returns {Function} Express middleware
 */
const requireAppParameterRole = (allowedRoles) => {
  return async (req, res, next) => {
    try {
      console.log('=== Role Check Debug ===');
      console.log('User ID:', req.user?.id);
      console.log('Required Roles:', allowedRoles);

      if (!req.user?.id) {
        return res.status(401).json({ error: 'Authentication required' });
      }

      // Get user's roles
      const userRoles = await userRoleService.getRolesByUser(req.user.id, true);
      console.log('Raw User Roles Retrieved:', JSON.stringify(userRoles, null, 2));

      if (!userRoles || userRoles.length === 0) {
        console.log('User has no roles assigned');
        return res.status(403).json({
          error: 'Insufficient permissions - No roles assigned',
          required: allowedRoles
        });
      }

      // Check if user has any of the required roles
      // Handle different possible column names from stored procedure
      const hasRequiredRole = userRoles.some(userRole => {
        // Get the role name from various possible column names
        const roleName = userRole.name || 
                        userRole.roleName || 
                        userRole.RoleName || 
                        userRole.Name || 
                        userRole.role_name ||
                        '';
        
        console.log(`Checking role: "${roleName}"`);

        if (!roleName) {
          console.log('Warning: Role object has no name property:', userRole);
          return false;
        }

        return allowedRoles.some(allowedRole => {
          const match = roleName.toLowerCase().trim() === allowedRole.toLowerCase().trim();
          console.log(`  "${roleName.toLowerCase().trim()}" === "${allowedRole.toLowerCase().trim()}" => ${match}`);
          return match;
        });
      });

      console.log('Has Required Role:', hasRequiredRole);

      if (!hasRequiredRole) {
        return res.status(403).json({
          error: 'Insufficient permissions',
          required: allowedRoles,
          userHasRoles: userRoles.map(r => 
            r.name || r.roleName || r.RoleName || r.Name || r.role_name || 'unknown'
          )
        });
      }

      console.log('Role check passed!');
      next();
    } catch (err) {
      console.error('AppParameter role check error:', err);
      return res.status(500).json({ 
        error: 'Role check failed', 
        details: err.message,
        stack: process.env.NODE_ENV === 'development' ? err.stack : undefined
      });
    }
  };
};

// Specific role middleware for app parameter management
// All operations require 'administrateur fonctionnel' role
export const canCreateAppParameter = requireAppParameterRole(APPPARAMETER_ROLES.ALLOWED_ROLES);
export const canReadAppParameter = requireAppParameterRole(APPPARAMETER_ROLES.ALLOWED_ROLES);
export const canUpdateAppParameter = requireAppParameterRole(APPPARAMETER_ROLES.ALLOWED_ROLES);
export const canDeleteAppParameter = requireAppParameterRole(APPPARAMETER_ROLES.ALLOWED_ROLES);
export const canSetAppParameter = requireAppParameterRole(APPPARAMETER_ROLES.ALLOWED_ROLES);
