// src/controllers/rolePermission.controller.js
import { AppError, sendSuccess } from '../middlewares/responseHandler.js';
import * as rolePermissionService from '../services/rolePermission.service.js';

/**
 * @openapi
 * tags:
 *   - name: RolePermission
 *     description: Role-Permission assignment management operations
 */

/**
 * @openapi
 * /api/role-permissions/assign:
 *   post:
 *     summary: Assign permission to role
 *     tags: [RolePermission]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - idRole
 *               - idPermission
 *             properties:
 *               idRole:
 *                 type: integer
 *                 example: 1
 *                 description: ID of the role
 *               idPermission:
 *                 type: integer
 *                 example: 2
 *                 description: ID of the permission
 *               active:
 *                 type: boolean
 *                 default: true
 *                 description: Active status of the assignment
 *     responses:
 *       200:
 *         description: Permission assigned successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 message:
 *                   type: string
 *                 data:
 *                   type: object
 *       400:
 *         description: Validation error
 *       404:
 *         description: Role or Permission not found
 */
export const assignRolePermission = async (req, res, next) => {
  try {
    const { idRole, idPermission, active = true } = req.body || {};
    const result = await rolePermissionService.assignRolePermission(idRole, idPermission, active);
    sendSuccess(res, result, 'Permission assigned to role successfully');
  } catch (err) {
    next(new AppError(err.message, err.statusCode || 500));
  }
};

/**
 * @openapi
 * /api/role-permissions/remove:
 *   delete:
 *     summary: Remove permission from role
 *     tags: [RolePermission]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - idRole
 *               - idPermission
 *             properties:
 *               idRole:
 *                 type: integer
 *                 example: 1
 *                 description: ID of the role
 *               idPermission:
 *                 type: integer
 *                 example: 2
 *                 description: ID of the permission
 *     responses:
 *       200:
 *         description: Permission removed successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 message:
 *                   type: string
 *                 data:
 *                   type: object
 *       404:
 *         description: Role-Permission link not found
 */
export const removeRolePermission = async (req, res, next) => {
  try {
    const { idRole, idPermission } = req.body || {};
    const result = await rolePermissionService.removeRolePermission(idRole, idPermission);
    sendSuccess(res, result, 'Permission removed from role successfully');
  } catch (err) {
    next(new AppError(err.message, err.statusCode || 500));
  }
};

/**
 * @openapi
 * /api/role-permissions/toggle:
 *   patch:
 *     summary: Toggle active status of role-permission assignment
 *     tags: [RolePermission]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - idRole
 *               - idPermission
 *             properties:
 *               idRole:
 *                 type: integer
 *                 example: 1
 *                 description: ID of the role
 *               idPermission:
 *                 type: integer
 *                 example: 2
 *                 description: ID of the permission
 *     responses:
 *       200:
 *         description: Status toggled successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 message:
 *                   type: string
 *                 data:
 *                   type: object
 *                   properties:
 *                     idRole:
 *                       type: integer
 *                     idPermission:
 *                       type: integer
 *                     active:
 *                       type: boolean
 *       404:
 *         description: Role-Permission link not found
 */
export const toggleRolePermission = async (req, res, next) => {
  try {
    const { idRole, idPermission } = req.body || {};
    const result = await rolePermissionService.toggleRolePermission(idRole, idPermission);
    sendSuccess(res, result, 'Role-Permission status toggled successfully');
  } catch (err) {
    next(new AppError(err.message, err.statusCode || 500));
  }
};

/**
 * @openapi
 * /api/role-permissions/roles/{idRole}/permissions:
 *   get:
 *     summary: Get all permissions assigned to a role
 *     tags: [RolePermission]
 *     parameters:
 *       - in: path
 *         name: idRole
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID of the role
 *       - in: query
 *         name: activeOnly
 *         schema:
 *           type: boolean
 *           default: true
 *         description: Return only active permissions
 *     responses:
 *       200:
 *         description: List of permissions retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 message:
 *                   type: string
 *                 data:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       idRole:
 *                         type: integer
 *                       idPermission:
 *                         type: integer
 *                       active:
 *                         type: boolean
 *                       permissionName:
 *                         type: string
 *                       permissionActive:
 *                         type: boolean
 *       404:
 *         description: Role not found
 */
export const getPermissionsByRole = async (req, res, next) => {
  try {
    const { idRole } = req.params;
    const { activeOnly = 'true' } = req.query;
    const result = await rolePermissionService.getPermissionsByRole(
      Number(idRole),
      activeOnly === 'true'
    );
    sendSuccess(res, result, 'Permissions retrieved successfully');
  } catch (err) {
    next(new AppError(err.message, err.statusCode || 500));
  }
};

/**
 * @openapi
 * /api/role-permissions/permissions/{idPermission}/roles:
 *   get:
 *     summary: Get all roles that have a specific permission
 *     tags: [RolePermission]
 *     parameters:
 *       - in: path
 *         name: idPermission
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID of the permission
 *       - in: query
 *         name: activeOnly
 *         schema:
 *           type: boolean
 *           default: true
 *         description: Return only active roles
 *     responses:
 *       200:
 *         description: List of roles retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 message:
 *                   type: string
 *                 data:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       idRole:
 *                         type: integer
 *                       idPermission:
 *                         type: integer
 *                       active:
 *                         type: boolean
 *                       roleName:
 *                         type: string
 *                       roleDescription:
 *                         type: string
 *                       roleActive:
 *                         type: boolean
 *       404:
 *         description: Permission not found
 */
export const getRolesByPermission = async (req, res, next) => {
  try {
    const { idPermission } = req.params;
    const { activeOnly = 'true' } = req.query;
    const result = await rolePermissionService.getRolesByPermission(
      Number(idPermission),
      activeOnly === 'true'
    );
    sendSuccess(res, result, 'Roles retrieved successfully');
  } catch (err) {
    next(new AppError(err.message, err.statusCode || 500));
  }
};

/**
 * @openapi
 * /api/role-permissions/roles/{idRole}/permissions/sync:
 *   put:
 *     summary: Sync (replace all) permissions for a role
 *     description: Removes all existing permissions and assigns the provided permissions to the role
 *     tags: [RolePermission]
 *     parameters:
 *       - in: path
 *         name: idRole
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID of the role
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - permissionIds
 *             properties:
 *               permissionIds:
 *                 type: array
 *                 items:
 *                   type: integer
 *                 example: [1, 2, 3, 4]
 *                 description: Array of permission IDs to assign
 *               active:
 *                 type: boolean
 *                 default: true
 *                 description: Active status for all assignments
 *     responses:
 *       200:
 *         description: Permissions synced successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 message:
 *                   type: string
 *                 data:
 *                   type: array
 *                   items:
 *                     type: object
 *       400:
 *         description: Validation error
 *       404:
 *         description: Role not found
 */
export const syncPermissionsForRole = async (req, res, next) => {
  try {
    const { idRole } = req.params;
    const { permissionIds, active = true } = req.body || {};
    const result = await rolePermissionService.syncPermissionsForRole(
      Number(idRole),
      permissionIds,
      active
    );
    sendSuccess(res, result, 'Permissions synced for role successfully');
  } catch (err) {
    next(new AppError(err.message, err.statusCode || 500));
  }
};

/**
 * @openapi
 * /api/role-permissions/permissions/{idPermission}/roles/sync:
 *   put:
 *     summary: Sync (replace all) roles for a permission
 *     description: Removes all existing roles and assigns the provided roles to the permission
 *     tags: [RolePermission]
 *     parameters:
 *       - in: path
 *         name: idPermission
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID of the permission
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
 *                 description: Array of role IDs to assign
 *               active:
 *                 type: boolean
 *                 default: true
 *                 description: Active status for all assignments
 *     responses:
 *       200:
 *         description: Roles synced successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 message:
 *                   type: string
 *                 data:
 *                   type: array
 *                   items:
 *                     type: object
 *       400:
 *         description: Validation error
 *       404:
 *         description: Permission not found
 */
export const syncRolesForPermission = async (req, res, next) => {
  try {
    const { idPermission } = req.params;
    const { roleIds, active = true } = req.body || {};
    const result = await rolePermissionService.syncRolesForPermission(
      Number(idPermission),
      roleIds,
      active
    );
    sendSuccess(res, result, 'Roles synced for permission successfully');
  } catch (err) {
    next(new AppError(err.message, err.statusCode || 500));
  }
};

/**
 * @openapi
 * /api/role-permissions/check:
 *   get:
 *     summary: Check if a role has a specific permission
 *     tags: [RolePermission]
 *     parameters:
 *       - in: query
 *         name: idRole
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID of the role
 *       - in: query
 *         name: idPermission
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID of the permission
 *       - in: query
 *         name: activeOnly
 *         schema:
 *           type: boolean
 *           default: true
 *         description: Check only active assignments
 *     responses:
 *       200:
 *         description: Check completed
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 message:
 *                   type: string
 *                 data:
 *                   type: object
 *                   properties:
 *                     hasPermission:
 *                       type: boolean
 *                     idRole:
 *                       type: integer
 *                     idPermission:
 *                       type: integer
 *                     active:
 *                       type: boolean
 *       400:
 *         description: Validation error
 */
export const checkRolePermission = async (req, res, next) => {
  try {
    const { idRole, idPermission, activeOnly = 'true' } = req.query;
    const result = await rolePermissionService.checkRolePermission(
      Number(idRole),
      Number(idPermission),
      activeOnly === 'true'
    );
    sendSuccess(res, result, 'Check completed');
  } catch (err) {
    next(new AppError(err.message, err.statusCode || 500));
  }
};

/**
 * @openapi
 * /api/role-permissions/stats:
 *   get:
 *     summary: Get role-permission assignment statistics
 *     tags: [RolePermission]
 *     parameters:
 *       - in: query
 *         name: idRole
 *         schema:
 *           type: integer
 *         description: ID of the role (optional, for role-specific stats)
 *       - in: query
 *         name: idPermission
 *         schema:
 *           type: integer
 *         description: ID of the permission (optional, for permission-specific stats)
 *     responses:
 *       200:
 *         description: Statistics retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 message:
 *                   type: string
 *                 data:
 *                   type: object
 *                   properties:
 *                     totalAssignments:
 *                       type: integer
 *                     activeAssignments:
 *                       type: integer
 *                     inactiveAssignments:
 *                       type: integer
 *                     totalRoles:
 *                       type: integer
 *                     totalPermissions:
 *                       type: integer
 */
export const getRolePermissionStats = async (req, res, next) => {
  try {
    const { idRole, idPermission } = req.query;
    const result = await rolePermissionService.getRolePermissionStats(
      idRole ? Number(idRole) : null,
      idPermission ? Number(idPermission) : null
    );
    sendSuccess(res, result, 'Statistics retrieved successfully');
  } catch (err) {
    next(new AppError(err.message, err.statusCode || 500));
  }
};

/**
 * @openapi
 * /api/role-permissions:
 *   get:
 *     summary: List all role-permission assignments with pagination
 *     tags: [RolePermission]
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *         description: Page number
 *       - in: query
 *         name: pageSize
 *         schema:
 *           type: integer
 *           default: 50
 *         description: Number of records per page
 *       - in: query
 *         name: activeOnly
 *         schema:
 *           type: boolean
 *           default: false
 *         description: Return only active assignments
 *     responses:
 *       200:
 *         description: Paginated list retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 message:
 *                   type: string
 *                 data:
 *                   type: object
 *                   properties:
 *                     data:
 *                       type: array
 *                       items:
 *                         type: object
 *                         properties:
 *                           idRole:
 *                             type: integer
 *                           idPermission:
 *                             type: integer
 *                           active:
 *                             type: boolean
 *                           roleName:
 *                             type: string
 *                           roleDescription:
 *                             type: string
 *                           roleActive:
 *                             type: boolean
 *                           permissionName:
 *                             type: string
 *                           permissionActive:
 *                             type: boolean
 *                     pagination:
 *                       type: object
 *                       properties:
 *                         page:
 *                           type: integer
 *                         pageSize:
 *                           type: integer
 *                         totalCount:
 *                           type: integer
 *                         totalPages:
 *                           type: integer
 *                         hasNext:
 *                           type: boolean
 *                         hasPrevious:
 *                           type: boolean
 */
export const listRolePermissions = async (req, res, next) => {
  try {
    const page = Number(req.query.page || 1);
    const pageSize = Number(req.query.pageSize || 50);
    const activeOnly = req.query.activeOnly === 'true';
    const result = await rolePermissionService.listRolePermissions(page, pageSize, activeOnly);
    sendSuccess(res, result, 'Role-Permission assignments retrieved successfully');
  } catch (err) {
    next(new AppError(err.message, err.statusCode || 500));
  }
};
