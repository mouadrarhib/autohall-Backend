// src/controllers/permission.controller.js

import { AppError, sendSuccess } from '../middlewares/responseHandler.js';
import * as permissionService from '../services/permission.service.js';

// ---------- Permission CRUD ----------

/**
 * @openapi
 * /api/permissions:
 *   post:
 *     summary: Create permission
 *     tags: [Permissions]
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
 *               active:
 *                 type: boolean
 *                 default: true
 *     responses:
 *       201:
 *         description: Created
 *       409:
 *         description: Name exists
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
 *     summary: Get permission by id
 *     tags: [Permissions]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: OK
 *       404:
 *         description: Not found
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
 *     parameters:
 *       - in: path
 *         name: name
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: OK
 *       404:
 *         description: Not found
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
 *     summary: List permissions (paged)
 *     tags: [Permissions]
 *     parameters:
 *       - in: query
 *         name: active
 *         schema:
 *           type: boolean
 *           nullable: true
 *       - in: query
 *         name: search
 *         schema:
 *           type: string
 *           nullable: true
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
 *     responses:
 *       200:
 *         description: OK
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
 *     summary: Update permission (name/active)
 *     tags: [Permissions]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *               active:
 *                 type: boolean
 *     responses:
 *       200:
 *         description: Updated
 *       404:
 *         description: Not found
 *       409:
 *         description: Name exists
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
 *     summary: Activate permission
 *     tags: [Permissions]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: OK
 *       404:
 *         description: Not found
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
 *     summary: Deactivate permission
 *     tags: [Permissions]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: OK
 *       404:
 *         description: Not found
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

// ---------- UserPermission Operations ----------

/**
 * @openapi
 * /api/permissions/user/{idUser}/list:
 *   get:
 *     summary: List permissions linked to a specific user (paginated)
 *     tags: [Permissions]
 *     parameters:
 *       - in: path
 *         name: idUser
 *         required: true
 *         schema:
 *           type: integer
 *           minimum: 1
 *         description: ID of the user
 *       - in: query
 *         name: active
 *         required: false
 *         schema:
 *           type: boolean
 *           nullable: true
 *         description: Filter by active status (true = active, false = inactive)
 *       - in: query
 *         name: page
 *         required: false
 *         schema:
 *           type: integer
 *           default: 1
 *         description: Page number
 *       - in: query
 *         name: pageSize
 *         required: false
 *         schema:
 *           type: integer
 *           default: 10
 *         description: Number of records per page
 *     responses:
 *       200:
 *         description: Paginated list of permissions
 *       400:
 *         description: Validation error
 */
export const listUserPermissions = async (req, res, next) => {
  try {
    // Parse and validate idUser
    const idUser = parseInt(req.params.idUser, 10);
    if (!idUser || idUser < 1) {
      return next(new AppError('ID must be a positive integer', 400));
    }
    
    // Parse active query parameter (optional)
    let { active } = req.query;
    if (active !== undefined) {
      active = active === 'true' || active === '1' ? 1 : 0;
    } else {
      active = null; // null means no filter
    }
    
    // Parse pagination parameters
    const page = Number(req.query.page || 1);
    const pageSize = Number(req.query.pageSize || 10);
    
    // Call service with pagination
    const result = await permissionService.listUserPermissions(idUser, active, page, pageSize);
    sendSuccess(res, result, 'User permissions retrieved successfully');
  } catch (err) {
    next(new AppError(err.message, 500));
  }
};

/**
 * @openapi
 * /api/permissions/{idPermission}/users:
 *   get:
 *     summary: List users attached to a specific permission (paginated)
 *     tags: [Permissions]
 *     parameters:
 *       - in: path
 *         name: idPermission
 *         required: true
 *         schema:
 *           type: integer
 *           minimum: 1
 *         description: ID of the permission
 *       - in: query
 *         name: active
 *         required: false
 *         schema:
 *           type: boolean
 *           nullable: true
 *         description: Filter by active status
 *       - in: query
 *         name: page
 *         required: false
 *         schema:
 *           type: integer
 *           default: 1
 *         description: Page number
 *       - in: query
 *         name: pageSize
 *         required: false
 *         schema:
 *           type: integer
 *           default: 10
 *         description: Number of records per page
 *     responses:
 *       200:
 *         description: Paginated list of users
 */
export const listUsersByPermission = async (req, res, next) => {
  try {
    const idPermission = Number(req.params.idPermission);
    const { active } = req.query;
    
    // Parse pagination parameters
    const page = Number(req.query.page || 1);
    const pageSize = Number(req.query.pageSize || 10);
    
    // Call service with pagination
    const result = await permissionService.listUsersByPermission(idPermission, active, page, pageSize);
    sendSuccess(res, result, 'Users by permission retrieved successfully');
  } catch (err) {
    next(new AppError(err.message, 500));
  }
};

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

export const userHasPermissionByName = async (req, res, next) => {
  try {
    const idUser = Number(req.params.idUser);
    const { permissionName } = req.params;
    const result = await permissionService.userHasPermissionByName(idUser, permissionName);
    sendSuccess(res, result, 'Permission check completed successfully');
  } catch (err) {
    next(new AppError(err.message, 500));
  }
};

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
