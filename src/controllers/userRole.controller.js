// src/controllers/userRole.controller.js
import { AppError, sendSuccess } from '../middlewares/responseHandler.js';
import * as userRoleService from '../services/userRole.service.js';

/**
 * @openapi
 * tags:
 *   - name: UserRoles
 *     description: User–Role link operations
 */

/**
 * @openapi
 * /api/user-roles/link:
 *   post:
 *     summary: Link (or reactivate) a user to a role
 *     tags: [UserRoles]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [ userId, roleId ]
 *             properties:
 *               userId: { type: integer, example: 12 }
 *               roleId: { type: integer, example: 5 }
 *               active: { type: boolean, default: true }
 *     responses:
 *       200: { description: Link created/updated }
 *       400: { description: Validation error }
 *       401: { description: Unauthorized }
 *       403: { description: Forbidden }
 */
export const link = async (req, res, next) => {
  try {
    const { userId, roleId, active = true } = req.body || {};
    const result = await userRoleService.link(userId, roleId, active);
    sendSuccess(res, result, 'Link created/updated');
  } catch (err) { next(new AppError(err.message, err.statusCode || 500)); }
};

/**
 * @openapi
 * /api/user-roles/unlink:
 *   post:
 *     summary: Unlink a user from a role
 *     tags: [UserRoles]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [ userId, roleId ]
 *             properties:
 *               userId: { type: integer, example: 12 }
 *               roleId: { type: integer, example: 5 }
 *     responses:
 *       200: { description: Link removed }
 *       400: { description: Validation error }
 *       401: { description: Unauthorized }
 *       403: { description: Forbidden }
 */
export const unlink = async (req, res, next) => {
  try {
    const { userId, roleId } = req.body || {};
    const result = await userRoleService.unlink(userId, roleId);
    sendSuccess(res, result, 'Link removed');
  } catch (err) { next(new AppError(err.message, err.statusCode || 500)); }
};

/**
 * @openapi
 * /api/user-roles/set-active:
 *   post:
 *     summary: Set active on a specific link
 *     tags: [UserRoles]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [ userId, roleId, active ]
 *             properties:
 *               userId: { type: integer, example: 12 }
 *               roleId: { type: integer, example: 5 }
 *               active: { type: boolean, example: true }
 *     responses:
 *       200: { description: Link active updated }
 *       400: { description: Validation error }
 *       401: { description: Unauthorized }
 *       403: { description: Forbidden }
 */
export const setActive = async (req, res, next) => {
  try {
    const { userId, roleId, active } = req.body || {};
    const result = await userRoleService.setActive(userId, roleId, active);
    sendSuccess(res, result, 'Link active updated');
  } catch (err) { next(new AppError(err.message, err.statusCode || 500)); }
};

/**
 * @openapi
 * /api/user-roles/toggle:
 *   post:
 *     summary: Toggle active on a specific link
 *     tags: [UserRoles]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [ userId, roleId ]
 *             properties:
 *               userId: { type: integer, example: 12 }
 *               roleId: { type: integer, example: 5 }
 *     responses:
 *       200: { description: Link active toggled }
 *       400: { description: Validation error }
 *       401: { description: Unauthorized }
 *       403: { description: Forbidden }
 */
export const toggle = async (req, res, next) => {
  try {
    const { userId, roleId } = req.body || {};
    const result = await userRoleService.toggle(userId, roleId);
    sendSuccess(res, result, 'Link active toggled');
  } catch (err) { next(new AppError(err.message, err.statusCode || 500)); }
};

/**
 * @openapi
 * /api/users/{userId}/roles:
 *   get:
 *     summary: List roles by user
 *     tags: [UserRoles]
 *     parameters:
 *       - in: path
 *         name: userId
 *         required: true
 *         schema: { type: integer }
 *       - in: query
 *         name: activeOnly
 *         required: false
 *         schema: { type: boolean, default: true }
 *         description: If true, only active links are returned
 *     responses:
 *       200: { description: Roles by user retrieved }
 *       400: { description: Validation error }
 *       401: { description: Unauthorized }
 *       403: { description: Forbidden }
 */
export const listRolesByUser = async (req, res, next) => {
  try {
    const userId = Number(req.params.userId);
    const activeOnly = String(req.query.activeOnly ?? 'true') !== 'false';
    const rows = await userRoleService.listRolesByUser(userId, activeOnly);
    sendSuccess(res, rows, 'Roles by user retrieved');
  } catch (err) { next(new AppError(err.message, err.statusCode || 500)); }
};

/**
 * @openapi
 * /api/roles/{roleId}/users:
 *   get:
 *     summary: List users by role
 *     tags: [UserRoles]
 *     parameters:
 *       - in: path
 *         name: roleId
 *         required: true
 *         schema: { type: integer }
 *       - in: query
 *         name: activeOnly
 *         required: false
 *         schema: { type: boolean, default: true }
 *         description: If true, only active links are returned
 *     responses:
 *       200: { description: Users by role retrieved }
 *       400: { description: Validation error }
 *       401: { description: Unauthorized }
 *       403: { description: Forbidden }
 */
export const listUsersByRole = async (req, res, next) => {
  try {
    const roleId = Number(req.params.roleId);
    const activeOnly = String(req.query.activeOnly ?? 'true') !== 'false';
    const rows = await userRoleService.listUsersByRole(roleId, activeOnly);
    sendSuccess(res, rows, 'Users by role retrieved');
  } catch (err) { next(new AppError(err.message, err.statusCode || 500)); }
};

/**
 * @openapi
 * /api/user-roles/bulk/link-roles-to-user:
 *   post:
 *     summary: Bulk link roles to a user (idempotent upsert)
 *     tags: [UserRoles]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [ userId, roleIds ]
 *             properties:
 *               userId: { type: integer, example: 12 }
 *               roleIds:
 *                 type: array
 *                 items: { type: integer }
 *                 example: [1,2,3]
 *               active: { type: boolean, default: true }
 *     responses:
 *       200: { description: Roles linked to user }
 *       400: { description: Validation error }
 *       401: { description: Unauthorized }
 *       403: { description: Forbidden }
 */
export const bulkLinkRolesToUser = async (req, res, next) => {
  try {
    const { userId, roleIds, active = true } = req.body || {};
    const result = await userRoleService.bulkLinkRolesToUser(userId, roleIds, active);
    sendSuccess(res, result, 'Roles linked to user');
  } catch (err) { next(new AppError(err.message, err.statusCode || 500)); }
};

/**
 * @openapi
 * /api/user-roles/bulk/link-users-to-role:
 *   post:
 *     summary: Bulk link users to a role (idempotent upsert)
 *     tags: [UserRoles]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [ roleId, userIds ]
 *             properties:
 *               roleId: { type: integer, example: 5 }
 *               userIds:
 *                 type: array
 *                 items: { type: integer }
 *                 example: [10,11,12]
 *               active: { type: boolean, default: true }
 *     responses:
 *       200: { description: Users linked to role }
 *       400: { description: Validation error }
 *       401: { description: Unauthorized }
 *       403: { description: Forbidden }
 */
export const bulkLinkUsersToRole = async (req, res, next) => {
  try {
    const { roleId, userIds, active = true } = req.body || {};
    const result = await userRoleService.bulkLinkUsersToRole(roleId, userIds, active);
    sendSuccess(res, result, 'Users linked to role');
  } catch (err) { next(new AppError(err.message, err.statusCode || 500)); }
};

/**
 * @openapi
 * /api/user-roles/bulk/set-active-by-user:
 *   post:
 *     summary: Bulk set active by user for a subset of roles
 *     tags: [UserRoles]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [ userId, roleIds, active ]
 *             properties:
 *               userId: { type: integer, example: 12 }
 *               roleIds:
 *                 type: array
 *                 items: { type: integer }
 *                 example: [1,2,3]
 *               active: { type: boolean, example: false }
 *     responses:
 *       200: { description: Active flags updated for user/roles }
 *       400: { description: Validation error }
 *       401: { description: Unauthorized }
 *       403: { description: Forbidden }
 */
export const bulkSetActiveByUser = async (req, res, next) => {
  try {
    const { userId, roleIds, active } = req.body || {};
    const result = await userRoleService.bulkSetActiveByUser(userId, roleIds, active);
    sendSuccess(res, result, 'Active flags updated for user/roles');
  } catch (err) { next(new AppError(err.message, err.statusCode || 500)); }
};

/**
 * @openapi
 * /api/user-roles/bulk/set-active-by-role:
 *   post:
 *     summary: Bulk set active by role for a subset of users
 *     tags: [UserRoles]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [ roleId, userIds, active ]
 *             properties:
 *               roleId: { type: integer, example: 5 }
 *               userIds:
 *                 type: array
 *                 items: { type: integer }
 *                 example: [10,11,12]
 *               active: { type: boolean, example: true }
 *     responses:
 *       200: { description: Active flags updated for role/users }
 *       400: { description: Validation error }
 *       401: { description: Unauthorized }
 *       403: { description: Forbidden }
 */
export const bulkSetActiveByRole = async (req, res, next) => {
  try {
    const { roleId, userIds, active } = req.body || {};
    const result = await userRoleService.bulkSetActiveByRole(roleId, userIds, active);
    sendSuccess(res, result, 'Active flags updated for role/users');
  } catch (err) { next(new AppError(err.message, err.statusCode || 500)); }
};

/**
 * @openapi
 * /api/user-roles/sync/roles-for-user:
 *   post:
 *     summary: Replace a user's roles (sync to exactly a given set)
 *     tags: [UserRoles]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [ userId, roleIds ]
 *             properties:
 *               userId: { type: integer, example: 12 }
 *               roleIds:
 *                 type: array
 *                 items: { type: integer }
 *                 example: [1,2,3]
 *               active: { type: boolean, default: true }
 *     responses:
 *       200: { description: User roles synchronized }
 *       400: { description: Validation error }
 *       401: { description: Unauthorized }
 *       403: { description: Forbidden }
 */
export const syncRolesForUser = async (req, res, next) => {
  try {
    const { userId, roleIds, active = true } = req.body || {};
    const result = await userRoleService.syncRolesForUser(userId, roleIds, active);
    sendSuccess(res, result, 'User roles synchronized');
  } catch (err) { next(new AppError(err.message, err.statusCode || 500)); }
};

/**
 * @openapi
 * /api/user-roles/sync/users-for-role:
 *   post:
 *     summary: Replace a role's users (sync to exactly a given set)
 *     tags: [UserRoles]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [ roleId, userIds ]
 *             properties:
 *               roleId: { type: integer, example: 5 }
 *               userIds:
 *                 type: array
 *                 items: { type: integer }
 *                 example: [10,11,12]
 *               active: { type: boolean, default: true }
 *     responses:
 *       200: { description: Role users synchronized }
 *       400: { description: Validation error }
 *       401: { description: Unauthorized }
 *       403: { description: Forbidden }
 */
export const syncUsersForRole = async (req, res, next) => {
  try {
    const { roleId, userIds, active = true } = req.body || {};
    const result = await userRoleService.syncUsersForRole(roleId, userIds, active);
    sendSuccess(res, result, 'Role users synchronized');
  } catch (err) { next(new AppError(err.message, err.statusCode || 500)); }
};

/**
 * @openapi
 * /api/user-roles/has:
 *   get:
 *     summary: Check if a user has a role
 *     tags: [UserRoles]
 *     parameters:
 *       - in: query
 *         name: userId
 *         required: true
 *         schema: { type: integer }
 *       - in: query
 *         name: roleId
 *         required: true
 *         schema: { type: integer }
 *       - in: query
 *         name: activeOnly
 *         required: false
 *         schema: { type: boolean, default: true }
 *     responses:
 *       200: { description: HasRole check completed }
 *       400: { description: Validation error }
 *       401: { description: Unauthorized }
 *       403: { description: Forbidden }
 */
export const hasRole = async (req, res, next) => {
  try {
    const { userId, roleId, activeOnly = true } = req.query || {};
    const result = await userRoleService.hasRole(userId, roleId, String(activeOnly) !== 'false');
    sendSuccess(res, result, 'HasRole check completed');
  } catch (err) { next(new AppError(err.message, err.statusCode || 500)); }
};

/**
 * @openapi
 * /api/roles/{roleId}/users/count:
 *   get:
 *     summary: Count users for a role
 *     tags: [UserRoles]
 *     parameters:
 *       - in: path
 *         name: roleId
 *         required: true
 *         schema: { type: integer }
 *       - in: query
 *         name: activeOnly
 *         required: false
 *         schema: { type: boolean, default: true }
 *     responses:
 *       200: { description: Users count per role }
 *       400: { description: Validation error }
 *       401: { description: Unauthorized }
 *       403: { description: Forbidden }
 */
export const countUsersForRole = async (req, res, next) => {
  try {
    const roleId = Number(req.params.roleId);
    const activeOnly = String(req.query.activeOnly ?? 'true') !== 'false';
    const result = await userRoleService.countUsersForRole(roleId, activeOnly);
    sendSuccess(res, result, 'Users count per role');
  } catch (err) { next(new AppError(err.message, err.statusCode || 500)); }
};
