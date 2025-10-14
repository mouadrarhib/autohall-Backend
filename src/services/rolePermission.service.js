// src/services/rolePermission.service.js
import { sequelize } from '../config/database.js';
import { SQL } from '../sql/snippets.js';
import { QueryTypes } from 'sequelize';
import {
  getFirstResult,
  hasResults,
  prepareStoredProcParams
} from '../helpers/databaseHelpers.js';
import { processPaginatedResult } from '../helpers/queryHelpers.js';

/**
 * Assign permission to role
 * @param {number} idRole - Role ID
 * @param {number} idPermission - Permission ID
 * @param {boolean} active - Active status
 * @returns {Object} Assignment result
 */
export async function assignRolePermission(idRole, idPermission, active = true) {
  const params = prepareStoredProcParams({
    idRole: Number(idRole),
    idPermission: Number(idPermission),
    active: active ? 1 : 0
  });

  try {
    const result = await sequelize.query(SQL.ROLE_PERMISSION.RP_ASSIGN, {
      replacements: params,
      type: QueryTypes.SELECT
    });
    return getFirstResult(result);
  } catch (error) {
    console.error('Error assigning role permission:', error);
    throw error;
  }
}

/**
 * Remove permission from role
 * @param {number} idRole - Role ID
 * @param {number} idPermission - Permission ID
 * @returns {Object} Removal result
 */
export async function removeRolePermission(idRole, idPermission) {
  const params = prepareStoredProcParams({
    idRole: Number(idRole),
    idPermission: Number(idPermission)
  });

  try {
    const result = await sequelize.query(SQL.ROLE_PERMISSION.RP_REMOVE, {
      replacements: params,
      type: QueryTypes.SELECT
    });
    return getFirstResult(result);
  } catch (error) {
    console.error('Error removing role permission:', error);
    throw error;
  }
}

/**
 * Toggle role permission active status
 * @param {number} idRole - Role ID
 * @param {number} idPermission - Permission ID
 * @returns {Object} Updated assignment
 */
export async function toggleRolePermission(idRole, idPermission) {
  const params = prepareStoredProcParams({
    idRole: Number(idRole),
    idPermission: Number(idPermission)
  });

  try {
    const result = await sequelize.query(SQL.ROLE_PERMISSION.RP_TOGGLE, {
      replacements: params,
      type: QueryTypes.SELECT
    });
    return getFirstResult(result);
  } catch (error) {
    console.error('Error toggling role permission:', error);
    throw error;
  }
}

/**
 * Get permissions by role
 * @param {number} idRole - Role ID
 * @param {boolean} activeOnly - Return only active permissions
 * @returns {Array} List of permissions
 */
export async function getPermissionsByRole(idRole, activeOnly = true) {
  const params = prepareStoredProcParams({
    idRole: Number(idRole),
    activeOnly: activeOnly ? 1 : 0
  });

  try {
    const rows = await sequelize.query(SQL.ROLE_PERMISSION.RP_GET_PERMISSIONS_BY_ROLE, {
      replacements: params,
      type: QueryTypes.SELECT
    });
    return rows;
  } catch (error) {
    console.error('Error getting permissions by role:', error);
    throw error;
  }
}

/**
 * Get roles by permission
 * @param {number} idPermission - Permission ID
 * @param {boolean} activeOnly - Return only active roles
 * @returns {Array} List of roles
 */
export async function getRolesByPermission(idPermission, activeOnly = true) {
  const params = prepareStoredProcParams({
    idPermission: Number(idPermission),
    activeOnly: activeOnly ? 1 : 0
  });

  try {
    const rows = await sequelize.query(SQL.ROLE_PERMISSION.RP_GET_ROLES_BY_PERMISSION, {
      replacements: params,
      type: QueryTypes.SELECT
    });
    return rows;
  } catch (error) {
    console.error('Error getting roles by permission:', error);
    throw error;
  }
}

/**
 * Sync permissions for role (replace all)
 * @param {number} idRole - Role ID
 * @param {Array<number>} permissionIds - Array of permission IDs
 * @param {boolean} active - Active status for assignments
 * @returns {Array} Updated permissions
 */
export async function syncPermissionsForRole(idRole, permissionIds, active = true) {
  const permissionIdsStr = Array.isArray(permissionIds) ? permissionIds.join(',') : String(permissionIds);
  
  const params = prepareStoredProcParams({
    idRole: Number(idRole),
    permissionIds: permissionIdsStr,
    active: active ? 1 : 0
  });

  try {
    const rows = await sequelize.query(SQL.ROLE_PERMISSION.RP_SYNC_PERMISSIONS_FOR_ROLE, {
      replacements: params,
      type: QueryTypes.SELECT
    });
    return rows;
  } catch (error) {
    console.error('Error syncing permissions for role:', error);
    throw error;
  }
}

/**
 * Sync roles for permission (replace all)
 * @param {number} idPermission - Permission ID
 * @param {Array<number>} roleIds - Array of role IDs
 * @param {boolean} active - Active status for assignments
 * @returns {Array} Updated roles
 */
export async function syncRolesForPermission(idPermission, roleIds, active = true) {
  const roleIdsStr = Array.isArray(roleIds) ? roleIds.join(',') : String(roleIds);
  
  const params = prepareStoredProcParams({
    idPermission: Number(idPermission),
    roleIds: roleIdsStr,
    active: active ? 1 : 0
  });

  try {
    const rows = await sequelize.query(SQL.ROLE_PERMISSION.RP_SYNC_ROLES_FOR_PERMISSION, {
      replacements: params,
      type: QueryTypes.SELECT
    });
    return rows;
  } catch (error) {
    console.error('Error syncing roles for permission:', error);
    throw error;
  }
}

/**
 * Check if role has permission
 * @param {number} idRole - Role ID
 * @param {number} idPermission - Permission ID
 * @param {boolean} activeOnly - Check only active assignments
 * @returns {Object} Check result
 */
export async function checkRolePermission(idRole, idPermission, activeOnly = true) {
  const params = prepareStoredProcParams({
    idRole: Number(idRole),
    idPermission: Number(idPermission),
    activeOnly: activeOnly ? 1 : 0
  });

  try {
    const result = await sequelize.query(SQL.ROLE_PERMISSION.RP_CHECK, {
      replacements: params,
      type: QueryTypes.SELECT
    });
    return getFirstResult(result);
  } catch (error) {
    console.error('Error checking role permission:', error);
    throw error;
  }
}

/**
 * Get role-permission statistics
 * @param {number|null} idRole - Role ID (optional)
 * @param {number|null} idPermission - Permission ID (optional)
 * @returns {Object} Statistics
 */
export async function getRolePermissionStats(idRole = null, idPermission = null) {
  const params = prepareStoredProcParams({
    idRole: idRole ? Number(idRole) : null,
    idPermission: idPermission ? Number(idPermission) : null
  });

  try {
    const result = await sequelize.query(SQL.ROLE_PERMISSION.RP_GET_STATS, {
      replacements: params,
      type: QueryTypes.SELECT
    });
    return getFirstResult(result);
  } catch (error) {
    console.error('Error getting role permission stats:', error);
    throw error;
  }
}

/**
 * List all role-permission assignments with pagination
 * @param {number} page - Page number
 * @param {number} pageSize - Records per page
 * @param {boolean} activeOnly - Return only active assignments
 * @returns {Object} Paginated results
 */
export async function listRolePermissions(page = 1, pageSize = 50, activeOnly = false) {
  const params = prepareStoredProcParams({
    page: Number(page),
    pageSize: Number(pageSize),
    activeOnly: activeOnly ? 1 : 0
  });

  try {
    const rows = await sequelize.query(SQL.ROLE_PERMISSION.RP_LIST, {
      replacements: params,
      type: QueryTypes.SELECT
    });
    return processPaginatedResult(rows, page, pageSize);
  } catch (error) {
    console.error('Error listing role permissions:', error);
    throw error;
  }
}
