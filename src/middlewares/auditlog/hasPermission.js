// src/middlewares/auditlog/hasPermission.js

import * as permissionService from '../../services/permission.service.js';

/**
 * Permission checking middleware specifically for AuditLog operations
 */

// Permission constants for audit log management
export const AUDITLOG_PERMISSIONS = {
  AUDITLOG_READ: 'AUDITLOG_READ',
  AUDITLOG_WRITE: 'AUDITLOG_WRITE',
  AUDITLOG_EXPORT: 'AUDITLOG_EXPORT',
  AUDITLOG_PURGE: 'AUDITLOG_PURGE',
  AUDITLOG_ANALYTICS: 'AUDITLOG_ANALYTICS'
};

/**
 * Generic permission checker for audit log operations
 * @param {string} requiredPermission - Permission name required
 * @returns {Function} Express middleware
 */
const requireAuditLogPermission = (requiredPermission) => {
  return async (req, res, next) => {
    try {
      if (!req.user?.id) {
        return res.status(401).json({ error: 'Authentication required' });
      }

      const result = await permissionService.userHasPermissionByName(req.user.id, requiredPermission);
      
      if (!result?.hasPermission) {
        return res.status(403).json({ 
          error: 'Insufficient permissions', 
          required: requiredPermission 
        });
      }

      next();
    } catch (err) {
      console.error('AuditLog permission check error:', err);
      return res.status(500).json({ error: 'Permission check failed' });
    }
  };
};

// Specific permission middleware for audit log management
export const canReadAuditLog = requireAuditLogPermission(AUDITLOG_PERMISSIONS.AUDITLOG_READ);
export const canWriteAuditLog = requireAuditLogPermission(AUDITLOG_PERMISSIONS.AUDITLOG_WRITE);
export const canExportAuditLog = requireAuditLogPermission(AUDITLOG_PERMISSIONS.AUDITLOG_EXPORT);
export const canPurgeAuditLog = requireAuditLogPermission(AUDITLOG_PERMISSIONS.AUDITLOG_PURGE);
export const canAnalyzeAuditLog = requireAuditLogPermission(AUDITLOG_PERMISSIONS.AUDITLOG_ANALYTICS);
