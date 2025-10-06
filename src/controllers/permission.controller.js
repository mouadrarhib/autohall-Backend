// src/controllers/permission.controller.js

import { AppError, sendSuccess } from '../middlewares/responseHandler.js';
import * as permissionService from '../services/permission.service.js';

// ---------- Permission CRUD ----------

/**
 * @openapi
 * /api/permissions:
 *   post:
 *     summary: Create a new permission
 *     tags: [Permissions]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - name
 *             properties:
 *               name:
 *                 type: string
 *                 example: MODELE_READ
 *                 description: Permission name (should be unique)
 *               active:
 *                 type: boolean
 *                 default: true
 *                 description: Whether the permission is active
 *     responses:
 *       201:
 *         description: Permission created successfully
 *       400:
 *         description: Validation error
 *       409:
 *         description: Permission name already exists
 */
export const createPermission = async (req, res, next) => {
  try {
    const { name, active = true } = req.body || {};
    const result = await permissionService.createPermission(name, active);
    sendSuccess(res, result, 'Permission created successfully', 201);
  } catch (err) {
    next(new AppError(err.message, err.statusCode || 500));
  }
};

/**
 * @openapi
 * /api/permissions/{id}:
 *   get:
 *     summary: Get permission by ID
 *     tags: [Permissions]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *           minimum: 1
 *         description: Permission ID
 *     responses:
 *       200:
 *         description: Permission retrieved successfully
 *       404:
 *         description: Permission not found
 */
export const getPermissionById = async (req, res, next) => {
  try {
    const id = Number(req.params.id);
    const permission = await permissionService.getPermissionById(id);
    if (!permission) {
      return next(new AppError('Permission not found', 404));
    }
    sendSuccess(res, permission, 'Permission retrieved successfully');
  } catch (err) {
    next(new AppError(err.message, 500));
  }
};

/**
 * @openapi
 * /api/permissions/by-name/{name}:
 *   get:
 *     summary: Get permission by name
 *     tags: [Permissions]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: name
 *         required: true
 *         schema:
 *           type: string
 *         description: Permission name
 *         example: MODELE_READ
 *     responses:
 *       200:
 *         description: Permission retrieved successfully
 *       404:
 *         description: Permission not found
 */
export const getPermissionByName = async (req, res, next) => {
  try {
    const { name } = req.params;
    const permission = await permissionService.getPermissionByName(name);
    if (!permission) {
      return next(new AppError('Permission not found', 404));
    }
    sendSuccess(res, permission, 'Permission retrieved successfully');
  } catch (err) {
    next(new AppError(err.message, 500));
  }
};

/**
 * @openapi
 * /api/permissions:
 *   get:
 *     summary: List all permissions with pagination and filters
 *     tags: [Permissions]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: active
 *         schema:
 *           type: boolean
 *         description: Filter by active status
 *       - in: query
 *         name: search
 *         schema:
 *           type: string
 *         description: Search by permission name
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *           minimum: 1
 *         description: Page number
 *       - in: query
 *         name: pageSize
 *         schema:
 *           type: integer
 *           default: 50
 *           minimum: 1
 *           maximum: 100
 *         description: Number of records per page
 *     responses:
 *       200:
 *         description: Permissions list retrieved successfully
 */
export const listPermissions = async (req, res, next) => {
  try {
    const { active, search } = req.query;
    const page = Number(req.query.page || 1);
    const pageSize = Number(req.query.pageSize || 50);
    const result = await permissionService.listPermissions(active, search, page, pageSize);
    sendSuccess(res, result, 'Permissions list retrieved successfully');
  } catch (err) {
    next(new AppError(err.message, 500));
  }
};

/**
 * @openapi
 * /api/permissions/{id}:
 *   patch:
 *     summary: Update permission details
 *     tags: [Permissions]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *           minimum: 1
 *         description: Permission ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *                 description: New permission name
 *               active:
 *                 type: boolean
 *                 description: Active status
 *     responses:
 *       200:
 *         description: Permission updated successfully
 *       404:
 *         description: Permission not found
 *       409:
 *         description: Permission name already exists
 */
export const updatePermission = async (req, res, next) => {
  try {
    const id = Number(req.params.id);
    const { name, active } = req.body || {};
    const result = await permissionService.updatePermission(id, name, active);
    if (!result) {
      return next(new AppError('Permission not found', 404));
    }
    sendSuccess(res, result, 'Permission updated successfully');
  } catch (err) {
    next(new AppError(err.message, err.statusCode || 500));
  }
};

/**
 * @openapi
 * /api/permissions/{id}/activate:
 *   post:
 *     summary: Activate a permission
 *     tags: [Permissions]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *           minimum: 1
 *         description: Permission ID
 *     responses:
 *       200:
 *         description: Permission activated successfully
 *       404:
 *         description: Permission not found
 */
export const activatePermission = async (req, res, next) => {
  try {
    const id = Number(req.params.id);
    const result = await permissionService.activatePermission(id);
    if (!result) {
      return next(new AppError('Permission not found', 404));
    }
    sendSuccess(res, result, 'Permission activated successfully');
  } catch (err) {
    next(new AppError(err.message, err.statusCode || 500));
  }
};

/**
 * @openapi
 * /api/permissions/{id}/deactivate:
 *   post:
 *     summary: Deactivate a permission
 *     tags: [Permissions]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *           minimum: 1
 *         description: Permission ID
 *     responses:
 *       200:
 *         description: Permission deactivated successfully
 *       404:
 *         description: Permission not found
 */
export const deactivatePermission = async (req, res, next) => {
  try {
    const id = Number(req.params.id);
    const result = await permissionService.deactivatePermission(id);
    if (!result) {
      return next(new AppError('Permission not found', 404));
    }
    sendSuccess(res, result, 'Permission deactivated successfully');
  } catch (err) {
    next(new AppError(err.message, err.statusCode || 500));
  }
};

/**
 * @openapi
 * /api/permissions/{id}/set-active:
 *   patch:
 *     summary: Set permission active status
 *     tags: [Permissions]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *           minimum: 1
 *         description: Permission ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - active
 *             properties:
 *               active:
 *                 type: boolean
 *                 description: Set to true to activate or false to deactivate
 *     responses:
 *       200:
 *         description: Permission active status updated successfully
 *       400:
 *         description: Missing active field in request body
 *       404:
 *         description: Permission not found
 */
export const setPermissionActive = async (req, res, next) => {
  try {
    const id = Number(req.params.id);
    const { active } = req.body ?? {};
    if (typeof active === 'undefined') {
      return next(new AppError('Missing active in request body', 400));
    }
    const result = await permissionService.setPermissionActive(id, !!active);
    if (!result) {
      return next(new AppError('Permission not found', 404));
    }
    sendSuccess(res, result, 'Permission active status updated successfully');
  } catch (err) {
    next(new AppError(err.message, err.statusCode || 500));
  }
};

// ---------- User-Permission Link Management ----------

/**
 * @openapi
 * /api/permissions/user/{idUser}/list:
 *   get:
 *     summary: List all permissions assigned to a specific user
 *     tags: [User Permissions]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: idUser
 *         required: true
 *         schema:
 *           type: integer
 *           minimum: 1
 *         description: User ID
 *       - in: query
 *         name: active
 *         schema:
 *           type: boolean
 *         description: Filter by active status
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *           minimum: 1
 *         description: Page number
 *       - in: query
 *         name: pageSize
 *         schema:
 *           type: integer
 *           default: 10
 *           minimum: 1
 *           maximum: 100
 *         description: Number of records per page
 *     responses:
 *       200:
 *         description: User permissions retrieved successfully
 *       400:
 *         description: Validation error
 */
export const listUserPermissions = async (req, res, next) => {
  try {
    const idUser = parseInt(req.params.idUser, 10);
    if (!idUser || idUser < 1) {
      return next(new AppError('ID must be a positive integer', 400));
    }

    let { active } = req.query;
    if (active !== undefined) {
      active = active === 'true' || active === '1' ? 1 : 0;
    } else {
      active = null;
    }

    const page = Number(req.query.page || 1);
    const pageSize = Number(req.query.pageSize || 10);

    const result = await permissionService.listUserPermissions(idUser, active, page, pageSize);
    sendSuccess(res, result, 'User permissions retrieved successfully');
  } catch (err) {
    next(new AppError(err.message, 500));
  }
};

/**
 * @openapi
 * /api/permissions/{id}/users:
 *   get:
 *     summary: List all users assigned to a specific permission
 *     tags: [User Permissions]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *           minimum: 1
 *         description: Permission ID
 *       - in: query
 *         name: active
 *         schema:
 *           type: boolean
 *         description: Filter by active status
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *           minimum: 1
 *         description: Page number
 *       - in: query
 *         name: pageSize
 *         schema:
 *           type: integer
 *           default: 10
 *           minimum: 1
 *           maximum: 100
 *         description: Number of records per page
 *     responses:
 *       200:
 *         description: Users retrieved successfully
 *       400:
 *         description: Validation error
 */
export const listUsersByPermission = async (req, res, next) => {
  try {
    const idPermission = Number(req.params.id);
    const { active } = req.query;

    const page = Number(req.query.page || 1);
    const pageSize = Number(req.query.pageSize || 10);

    const result = await permissionService.listUsersByPermission(idPermission, active, page, pageSize);
    sendSuccess(res, result, 'Users by permission retrieved successfully');
  } catch (err) {
    next(new AppError(err.message, 500));
  }
};

/**
 * @openapi
 * /api/permissions/user/{idUser}/add:
 *   post:
 *     summary: Assign a permission to a user
 *     tags: [User Permissions]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: idUser
 *         required: true
 *         schema:
 *           type: integer
 *           minimum: 1
 *         description: User ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - idPermission
 *             properties:
 *               idPermission:
 *                 type: integer
 *                 minimum: 1
 *                 example: 1
 *                 description: Permission ID to assign
 *     responses:
 *       201:
 *         description: Permission added to user successfully
 *       400:
 *         description: Validation error
 *       409:
 *         description: Permission already assigned to user
 */
export const addUserPermission = async (req, res, next) => {
  try {
    const idUser = Number(req.params.idUser);
    const idPermission = Number(req.body?.idPermission);
    const result = await permissionService.addUserPermission(idUser, idPermission);
    sendSuccess(res, result, 'User permission added successfully', 201);
  } catch (err) {
    next(new AppError(err.message, err.statusCode || 500));
  }
};

/**
 * @openapi
 * /api/permissions/user/{idUser}/activate:
 *   post:
 *     summary: Activate a user's permission
 *     tags: [User Permissions]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: idUser
 *         required: true
 *         schema:
 *           type: integer
 *           minimum: 1
 *         description: User ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - idPermission
 *             properties:
 *               idPermission:
 *                 type: integer
 *                 minimum: 1
 *                 example: 1
 *                 description: Permission ID to activate
 *     responses:
 *       200:
 *         description: User permission activated successfully
 *       404:
 *         description: User permission not found
 */
export const activateUserPermission = async (req, res, next) => {
  try {
    const idUser = Number(req.params.idUser);
    const idPermission = Number(req.body?.idPermission);
    const result = await permissionService.activateUserPermission(idUser, idPermission);
    sendSuccess(res, result, 'User permission activated successfully');
  } catch (err) {
    next(new AppError(err.message, err.statusCode || 500));
  }
};

/**
 * @openapi
 * /api/permissions/user/{idUser}/deactivate:
 *   post:
 *     summary: Deactivate a user's permission
 *     tags: [User Permissions]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: idUser
 *         required: true
 *         schema:
 *           type: integer
 *           minimum: 1
 *         description: User ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - idPermission
 *             properties:
 *               idPermission:
 *                 type: integer
 *                 minimum: 1
 *                 example: 1
 *                 description: Permission ID to deactivate
 *     responses:
 *       200:
 *         description: User permission deactivated successfully
 *       404:
 *         description: User permission not found
 */
export const deactivateUserPermission = async (req, res, next) => {
  try {
    const idUser = Number(req.params.idUser);
    const idPermission = Number(req.body?.idPermission);
    const result = await permissionService.deactivateUserPermission(idUser, idPermission);
    sendSuccess(res, result, 'User permission deactivated successfully');
  } catch (err) {
    next(new AppError(err.message, err.statusCode || 500));
  }
};

/**
 * @openapi
 * /api/permissions/user/{idUser}/remove:
 *   delete:
 *     summary: Remove a permission from a user
 *     tags: [User Permissions]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: idUser
 *         required: true
 *         schema:
 *           type: integer
 *           minimum: 1
 *         description: User ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - idPermission
 *             properties:
 *               idPermission:
 *                 type: integer
 *                 minimum: 1
 *                 example: 1
 *                 description: Permission ID to remove
 *               hardDelete:
 *                 type: boolean
 *                 default: false
 *                 description: If true, permanently delete; if false, soft delete
 *     responses:
 *       200:
 *         description: User permission removed successfully
 *       404:
 *         description: User permission not found
 */
export const removeUserPermission = async (req, res, next) => {
  try {
    const idUser = Number(req.params.idUser);
    const idPermission = Number(req.body?.idPermission);
    const hardDelete = !!req.body?.hardDelete;
    const result = await permissionService.removeUserPermission(idUser, idPermission, hardDelete);
    sendSuccess(res, result, 'User permission removed successfully');
  } catch (err) {
    next(new AppError(err.message, err.statusCode || 500));
  }
};

/**
 * @openapi
 * /api/permissions/user/{idUser}/check/{permissionName}:
 *   get:
 *     summary: Check if a user has a specific permission
 *     tags: [User Permissions]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: idUser
 *         required: true
 *         schema:
 *           type: integer
 *           minimum: 1
 *         description: User ID
 *       - in: path
 *         name: permissionName
 *         required: true
 *         schema:
 *           type: string
 *         description: Permission name to check
 *         example: MODELE_READ
 *     responses:
 *       200:
 *         description: Permission check completed successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: User has this permission
 *                 data:
 *                   type: object
 *                   properties:
 *                     hasPermission:
 *                       type: boolean
 *                       example: true
 *                     idUser:
 *                       type: integer
 *                       example: 1
 *                     permissionName:
 *                       type: string
 *                       example: MODELE_READ
 *       404:
 *         description: User or permission not found
 *       400:
 *         description: Validation error
 */
export const userHasPermissionByName = async (req, res, next) => {
  try {
    const idUser = Number(req.params.idUser);
    const { permissionName } = req.params;

    // Check if permission exists first
    const permissionExists = await permissionService.getPermissionByName(permissionName);
    if (!permissionExists) {
      return next(new AppError(`Permission '${permissionName}' does not exist`, 404));
    }

    // Check if user has the permission
    const result = await permissionService.userHasPermissionByName(idUser, permissionName);
    
    // Create a more descriptive response
    const response = {
      hasPermission: !!result.hasPermission,
      idUser: idUser,
      permissionName: permissionName
    };

    const message = result.hasPermission 
      ? `User has the permission '${permissionName}'`
      : `User does not have the permission '${permissionName}'`;

    sendSuccess(res, response, message);
  } catch (err) {
    next(new AppError(err.message, 500));
  }
};
