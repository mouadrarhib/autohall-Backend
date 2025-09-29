// src/middleware/hasPermission.js

import * as permissionService from '../services/permission.service.js';

/**
 * Middleware to check if authenticated user has a specific permission
 * @param {string} permissionName - The permission name to check
 * @returns {Function} Express middleware function
 */
export const hasPermission = (permissionName) => {
  return async (req, res, next) => {
    try {
      // Ensure user is authenticated (should be set by isAuth middleware)
      if (!req.user || !req.user.id) {
        return res.status(401).json({ error: 'Authentication required' });
      }

      // Check if user has the required permission
      const result = await permissionService.userHasPermissionByName(req.user.id, permissionName);
      
      if (!result || !result.hasPermission) {
        return res.status(403).json({ 
          error: 'Insufficient permissions', 
          required: permissionName 
        });
      }

      next();
    } catch (err) {
      console.error('Permission check error:', err);
      return res.status(500).json({ error: 'Permission check failed' });
    }
  };
};

/**
 * Middleware to check if user has any of the specified permissions
 * @param {string[]} permissionNames - Array of permission names
 * @returns {Function} Express middleware function
 */
export const hasAnyPermission = (permissionNames) => {
  return async (req, res, next) => {
    try {
      if (!req.user || !req.user.id) {
        return res.status(401).json({ error: 'Authentication required' });
      }

      // Check each permission until one matches
      for (const permissionName of permissionNames) {
        const result = await permissionService.userHasPermissionByName(req.user.id, permissionName);
        if (result && result.hasPermission) {
          return next();
        }
      }

      return res.status(403).json({ 
        error: 'Insufficient permissions', 
        required: `One of: ${permissionNames.join(', ')}` 
      });
    } catch (err) {
      console.error('Permission check error:', err);
      return res.status(500).json({ error: 'Permission check failed' });
    }
  };
};

/**
 * Middleware to check if user has all specified permissions
 * @param {string[]} permissionNames - Array of permission names
 * @returns {Function} Express middleware function  
 */
export const hasAllPermissions = (permissionNames) => {
  return async (req, res, next) => {
    try {
      if (!req.user || !req.user.id) {
        return res.status(401).json({ error: 'Authentication required' });
      }

      // Check all permissions
      for (const permissionName of permissionNames) {
        const result = await permissionService.userHasPermissionByName(req.user.id, permissionName);
        if (!result || !result.hasPermission) {
          return res.status(403).json({ 
            error: 'Insufficient permissions', 
            required: `All of: ${permissionNames.join(', ')}`,
            missing: permissionName
          });
        }
      }

      next();
    } catch (err) {
      console.error('Permission check error:', err);
      return res.status(500).json({ error: 'Permission check failed' });
    }
  };
};
