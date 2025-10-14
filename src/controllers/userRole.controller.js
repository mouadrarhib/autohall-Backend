// src/controllers/userRole.controller.js

import { AppError, sendSuccess } from '../middlewares/responseHandler.js';
import * as userRoleService from '../services/userRole.service.js';

/**
 * @openapi
 * tags:
 *   - name: UserRole
 *     description: User-Role assignment management operations
 */

/**
 * @openapi
 * /api/user-roles/assign:
 *   post:
 *     summary: Assign role to user
 *     tags: [UserRole]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - userId
 *               - roleId
 *             properties:
 *               userId:
 *                 type: integer
 *                 example: 1
 *               roleId:
 *                 type: integer
 *                 example: 2
 *               active:
 *                 type: boolean
 *                 default: true
 *     responses:
 *       200:
 *         description: Role assigned successfully
 *       400:
 *         description: Validation error
 */
export const assignUserRole = async (req, res, next) => {
  try {
    const { userId, roleId, active = true } = req.body || {};
    const result = await userRoleService.assignUserRole(userId, roleId, active);
    sendSuccess(res, result, 'Role assigned successfully', 200);
  } catch (err) {
    next(new AppError(err.message, err.statusCode || 500));
  }
};

/**
 * @openapi
 * /api/user-roles/remove:
 *   delete:
 *     summary: Remove role from user
 *     tags: [UserRole]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - userId
 *               - roleId
 *             properties:
 *               userId:
 *                 type: integer
 *                 example: 1
 *               roleId:
 *                 type: integer
 *                 example: 2
 *     responses:
 *       200:
 *         description: Role removed successfully
 *       404:
 *         description: Assignment not found
 */
export const removeUserRole = async (req, res, next) => {
  try {
    const { userId, roleId } = req.body || {};
    const result = await userRoleService.removeUserRole(userId, roleId);
    sendSuccess(res, result, 'Role removed successfully', 200);
  } catch (err) {
    next(new AppError(err.message, err.statusCode || 500));
  }
};

/**
 * @openapi
 * /api/user-roles/users/{userId}/roles:
 *   get:
 *     summary: Get all roles for a user
 *     tags: [UserRole]
 *     parameters:
 *       - in: path
 *         name: userId
 *         required: true
 *         schema:
 *           type: integer
 *       - in: query
 *         name: activeOnly
 *         schema:
 *           type: boolean
 *           default: true
 *     responses:
 *       200:
 *         description: List of roles retrieved successfully
 */
export const getRolesByUser = async (req, res, next) => {
  try {
    const userId = Number(req.params.userId);
    const activeOnly = req.query.activeOnly !== 'false';
    const result = await userRoleService.getRolesByUser(userId, activeOnly);
    sendSuccess(res, result, 'Roles retrieved successfully', 200);
  } catch (err) {
    next(new AppError(err.message, err.statusCode || 500));
  }
};

/**
 * @openapi
 * /api/user-roles/roles/{roleId}/users:
 *   get:
 *     summary: Get all users for a role
 *     tags: [UserRole]
 *     parameters:
 *       - in: path
 *         name: roleId
 *         required: true
 *         schema:
 *           type: integer
 *       - in: query
 *         name: activeOnly
 *         schema:
 *           type: boolean
 *           default: true
 *     responses:
 *       200:
 *         description: List of users retrieved successfully
 */
export const getUsersByRole = async (req, res, next) => {
  try {
    const roleId = Number(req.params.roleId);
    const activeOnly = req.query.activeOnly !== 'false';
    const result = await userRoleService.getUsersByRole(roleId, activeOnly);
    sendSuccess(res, result, 'Users retrieved successfully', 200);
  } catch (err) {
    next(new AppError(err.message, err.statusCode || 500));
  }
};

/**
 * @openapi
 * /api/user-roles/toggle:
 *   patch:
 *     summary: Toggle active status
 *     tags: [UserRole]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - userId
 *               - roleId
 *             properties:
 *               userId:
 *                 type: integer
 *                 example: 1
 *               roleId:
 *                 type: integer
 *                 example: 2
 *     responses:
 *       200:
 *         description: Status toggled successfully
 */
export const toggleUserRole = async (req, res, next) => {
  try {
    const { userId, roleId } = req.body || {};
    const result = await userRoleService.toggleUserRole(userId, roleId);
    sendSuccess(res, result, 'Status toggled successfully', 200);
  } catch (err) {
    next(new AppError(err.message, err.statusCode || 500));
  }
};

/**
 * @openapi
 * /api/user-roles/users/{userId}/roles/sync:
 *   put:
 *     summary: Sync (replace) all roles for a user
 *     tags: [UserRole]
 *     parameters:
 *       - in: path
 *         name: userId
 *         required: true
 *         schema:
 *           type: integer
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - roleIds
 *             properties:
 *               roleIds:
 *                 type: array
 *                 items:
 *                   type: integer
 *                 example: [1, 2, 3]
 *               active:
 *                 type: boolean
 *                 default: true
 *     responses:
 *       200:
 *         description: Roles synced successfully
 */
export const syncRolesForUser = async (req, res, next) => {
  try {
    const userId = Number(req.params.userId);
    const { roleIds, active = true } = req.body || {};
    const result = await userRoleService.syncRolesForUser(userId, roleIds, active);
    sendSuccess(res, result, 'Roles synced successfully', 200);
  } catch (err) {
    next(new AppError(err.message, err.statusCode || 500));
  }
};

/**
 * @openapi
 * /api/user-roles/roles/{roleId}/users/sync:
 *   put:
 *     summary: Sync (replace) all users for a role
 *     tags: [UserRole]
 *     parameters:
 *       - in: path
 *         name: roleId
 *         required: true
 *         schema:
 *           type: integer
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - userIds
 *             properties:
 *               userIds:
 *                 type: array
 *                 items:
 *                   type: integer
 *                 example: [1, 2, 3]
 *               active:
 *                 type: boolean
 *                 default: true
 *     responses:
 *       200:
 *         description: Users synced successfully
 */
export const syncUsersForRole = async (req, res, next) => {
  try {
    const roleId = Number(req.params.roleId);
    const { userIds, active = true } = req.body || {};
    const result = await userRoleService.syncUsersForRole(roleId, userIds, active);
    sendSuccess(res, result, 'Users synced successfully', 200);
  } catch (err) {
    next(new AppError(err.message, err.statusCode || 500));
  }
};

/**
 * @openapi
 * /api/user-roles/check:
 *   get:
 *     summary: Check if user has a specific role
 *     tags: [UserRole]
 *     parameters:
 *       - in: query
 *         name: userId
 *         required: true
 *         schema:
 *           type: integer
 *       - in: query
 *         name: roleId
 *         required: true
 *         schema:
 *           type: integer
 *       - in: query
 *         name: activeOnly
 *         schema:
 *           type: boolean
 *           default: true
 *     responses:
 *       200:
 *         description: Access check completed
 */
export const checkUserAccess = async (req, res, next) => {
  try {
    const userId = Number(req.query.userId);
    const roleId = Number(req.query.roleId);
    const activeOnly = req.query.activeOnly !== 'false';
    const result = await userRoleService.checkUserAccess(userId, roleId, activeOnly);
    sendSuccess(res, result, 'Access check completed', 200);
  } catch (err) {
    next(new AppError(err.message, err.statusCode || 500));
  }
};

/**
 * @openapi
 * /api/user-roles/stats:
 *   get:
 *     summary: Get user-role statistics
 *     tags: [UserRole]
 *     parameters:
 *       - in: query
 *         name: userId
 *         schema:
 *           type: integer
 *       - in: query
 *         name: roleId
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Statistics retrieved successfully
 */
export const getUserRoleStats = async (req, res, next) => {
  try {
    const userId = req.query.userId ? Number(req.query.userId) : null;
    const roleId = req.query.roleId ? Number(req.query.roleId) : null;
    const result = await userRoleService.getUserRoleStats(userId, roleId);
    sendSuccess(res, result, 'Statistics retrieved successfully', 200);
  } catch (err) {
    next(new AppError(err.message, err.statusCode || 500));
  }
};

/**
 * @openapi
 * /api/user-roles:
 *   get:
 *     summary: Get all user-role assignments with pagination
 *     tags: [UserRole]
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *       - in: query
 *         name: pageSize
 *         schema:
 *           type: integer
 *           default: 50
 *       - in: query
 *         name: activeOnly
 *         schema:
 *           type: boolean
 *           default: false
 *     responses:
 *       200:
 *         description: Paginated list retrieved successfully
 */
export const getAllUserRoles = async (req, res, next) => {
  try {
    const page = Number(req.query.page || 1);
    const pageSize = Number(req.query.pageSize || 50);
    const activeOnly = req.query.activeOnly === 'true';
    const result = await userRoleService.getAllUserRoles(page, pageSize, activeOnly);
    sendSuccess(res, result, 'User roles retrieved successfully', 200);
  } catch (err) {
    next(new AppError(err.message, err.statusCode || 500));
  }
};
