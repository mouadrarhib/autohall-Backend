// src/services/userRole.service.js

import { sequelize } from '../config/database.js';
import { SQL } from '../sql/snippets.js';
import { QueryTypes } from 'sequelize';
import { 
  getFirstResult, 
  prepareStoredProcParams 
} from '../helpers/databaseHelpers.js';
import { processPaginatedResult } from '../helpers/queryHelpers.js';

/**
 * Assign role to user
 * @param {number} userId - User ID
 * @param {number} roleId - Role ID
 * @param {boolean} active - Active status
 * @returns {Object} Assignment result
 */
export async function assignUserRole(userId, roleId, active = true) {
  const params = prepareStoredProcParams({
    userId: Number(userId),
    roleId: Number(roleId),
    active: active ? 1 : 0
  });

  try {
    const result = await sequelize.query(SQL.USER_ROLE.UR_ASSIGN, {
      replacements: params,
      type: QueryTypes.SELECT
    });
    
    return getFirstResult(result);
  } catch (error) {
    console.error('Error assigning user role:', error);
    throw error;
  }
}

/**
 * Remove role from user
 * @param {number} userId - User ID
 * @param {number} roleId - Role ID
 * @returns {Object} Removal result
 */
export async function removeUserRole(userId, roleId) {
  const params = prepareStoredProcParams({
    userId: Number(userId),
    roleId: Number(roleId)
  });

  try {
    const result = await sequelize.query(SQL.USER_ROLE.UR_REMOVE, {
      replacements: params,
      type: QueryTypes.SELECT
    });
    
    return getFirstResult(result);
  } catch (error) {
    console.error('Error removing user role:', error);
    throw error;
  }
}

/**
 * Get all roles for a user
 * @param {number} userId - User ID
 * @param {boolean} activeOnly - Filter active only
 * @returns {Array} List of roles
 */
export async function getRolesByUser(userId, activeOnly = true) {
  const params = prepareStoredProcParams({
    userId: Number(userId),
    activeOnly: activeOnly ? 1 : 0
  });

  try {
    const rows = await sequelize.query(SQL.USER_ROLE.UR_GET_ROLES_BY_USER, {
      replacements: params,
      type: QueryTypes.SELECT
    });
    
    return rows || [];
  } catch (error) {
    console.error('Error getting roles by user:', error);
    throw error;
  }
}

/**
 * Get all users for a role
 * @param {number} roleId - Role ID
 * @param {boolean} activeOnly - Filter active only
 * @returns {Array} List of users
 */
export async function getUsersByRole(roleId, activeOnly = true) {
  const params = prepareStoredProcParams({
    roleId: Number(roleId),
    activeOnly: activeOnly ? 1 : 0
  });

  try {
    const rows = await sequelize.query(SQL.USER_ROLE.UR_GET_USERS_BY_ROLE, {
      replacements: params,
      type: QueryTypes.SELECT
    });
    
    return rows || [];
  } catch (error) {
    console.error('Error getting users by role:', error);
    throw error;
  }
}

/**
 * Toggle active status
 * @param {number} userId - User ID
 * @param {number} roleId - Role ID
 * @returns {Object} Toggle result
 */
export async function toggleUserRole(userId, roleId) {
  const params = prepareStoredProcParams({
    userId: Number(userId),
    roleId: Number(roleId)
  });

  try {
    const result = await sequelize.query(SQL.USER_ROLE.UR_TOGGLE_ACTIVE, {
      replacements: params,
      type: QueryTypes.SELECT
    });
    
    return getFirstResult(result);
  } catch (error) {
    console.error('Error toggling user role:', error);
    throw error;
  }
}

/**
 * Sync roles for user (replace all)
 * @param {number} userId - User ID
 * @param {Array<number>} roleIds - Array of role IDs
 * @param {boolean} active - Active status
 * @returns {Array} Synced roles
 */
export async function syncRolesForUser(userId, roleIds, active = true) {
  const params = prepareStoredProcParams({
    userId: Number(userId),
    roleIds: Array.isArray(roleIds) ? roleIds.join(',') : String(roleIds),
    active: active ? 1 : 0
  });

  try {
    const rows = await sequelize.query(SQL.USER_ROLE.UR_SYNC_ROLES_FOR_USER, {
      replacements: params,
      type: QueryTypes.SELECT
    });
    
    return rows || [];
  } catch (error) {
    console.error('Error syncing roles for user:', error);
    throw error;
  }
}

/**
 * Sync users for role (replace all)
 * @param {number} roleId - Role ID
 * @param {Array<number>} userIds - Array of user IDs
 * @param {boolean} active - Active status
 * @returns {Array} Synced users
 */
export async function syncUsersForRole(roleId, userIds, active = true) {
  const params = prepareStoredProcParams({
    roleId: Number(roleId),
    userIds: Array.isArray(userIds) ? userIds.join(',') : String(userIds),
    active: active ? 1 : 0
  });

  try {
    const rows = await sequelize.query(SQL.USER_ROLE.UR_SYNC_USERS_FOR_ROLE, {
      replacements: params,
      type: QueryTypes.SELECT
    });
    
    return rows || [];
  } catch (error) {
    console.error('Error syncing users for role:', error);
    throw error;
  }
}

/**
 * Check if user has role
 * @param {number} userId - User ID
 * @param {number} roleId - Role ID
 * @param {boolean} activeOnly - Check active only
 * @returns {Object} Result with hasAccess boolean
 */
export async function checkUserAccess(userId, roleId, activeOnly = true) {
  const params = prepareStoredProcParams({
    userId: Number(userId),
    roleId: Number(roleId),
    activeOnly: activeOnly ? 1 : 0
  });

  try {
    const result = await sequelize.query(SQL.USER_ROLE.UR_CHECK_ACCESS, {
      replacements: params,
      type: QueryTypes.SELECT
    });
    
    return getFirstResult(result);
  } catch (error) {
    console.error('Error checking user access:', error);
    throw error;
  }
}

/**
 * Get statistics
 * @param {number|null} userId - User ID (optional)
 * @param {number|null} roleId - Role ID (optional)
 * @returns {Object} Statistics
 */
export async function getUserRoleStats(userId = null, roleId = null) {
  const params = prepareStoredProcParams({
    userId: userId ? Number(userId) : null,
    roleId: roleId ? Number(roleId) : null
  });

  try {
    const result = await sequelize.query(SQL.USER_ROLE.UR_GET_STATS, {
      replacements: params,
      type: QueryTypes.SELECT
    });
    
    return getFirstResult(result);
  } catch (error) {
    console.error('Error getting user role stats:', error);
    throw error;
  }
}

/**
 * Get all user-role assignments with pagination
 * @param {number} page - Page number
 * @param {number} pageSize - Records per page
 * @param {boolean} activeOnly - Filter active only
 * @returns {Object} Paginated results
 */
export async function getAllUserRoles(page = 1, pageSize = 50, activeOnly = false) {
  const params = prepareStoredProcParams({
    pageNumber: Number(page),
    pageSize: Number(pageSize),
    activeOnly: activeOnly ? 1 : 0
  });

  try {
    const rows = await sequelize.query(SQL.USER_ROLE.UR_GET_ALL, {
      replacements: params,
      type: QueryTypes.SELECT
    });
    
    return processPaginatedResult(rows, page, pageSize);
  } catch (error) {
    console.error('Error getting all user roles:', error);
    throw error;
  }
}
