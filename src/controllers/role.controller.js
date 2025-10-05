// src/controllers/role.controller.js

import { AppError, sendSuccess } from '../middlewares/responseHandler.js';
import * as roleService from '../services/role.service.js';

/**
 * @openapi
 * tags:
 *   - name: Roles
 *     description: Role management operations
 */

/**
 * @openapi
 * /api/roles:
 *   post:
 *     summary: Create a new role
 *     tags: [Roles]
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
 *                 example: "Admin"
 *               description:
 *                 type: string
 *                 example: "Full access to the system"
 *               active:
 *                 type: boolean
 *                 default: true
 *     responses:
 *       201:
 *         description: Role created successfully
 *       400:
 *         description: Validation error
 *       409:
 *         description: Role name already exists
 */
export const createRole = async (req, res, next) => {
  try {
    const { name, description = null, active = true } = req.body || {};
    const result = await roleService.createRole(name, description, active);
    sendSuccess(res, result, 'Role created successfully', 201);
  } catch (err) {
    next(new AppError(err.message, err.statusCode || 500));
  }
};

/**
 * @openapi
 * /api/roles/{id}:
 *   get:
 *     summary: Get role by ID
 *     tags: [Roles]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Role found
 *       404:
 *         description: Role not found
 */
export const getRoleById = async (req, res, next) => {
  try {
    const id = Number(req.params.id);
    const role = await roleService.getRoleById(id);
    
    if (!role) {
      return next(new AppError('Role not found', 404));
    }
    
    sendSuccess(res, role, 'Role retrieved successfully');
  } catch (err) {
    next(new AppError(err.message, 500));
  }
};

/**
 * @openapi
 * /api/roles:
 *   get:
 *     summary: List all roles
 *     tags: [Roles]
 *     responses:
 *       200:
 *         description: List of roles
 */
export const listRoles = async (req, res, next) => {
  try {
    const roles = await roleService.listRoles();
    sendSuccess(res, roles, 'Roles list retrieved successfully');
  } catch (err) {
    next(new AppError(err.message, 500));
  }
};

/**
 * @openapi
 * /api/roles/search:
 *   get:
 *     summary: Search roles by name
 *     tags: [Roles]
 *     parameters:
 *       - in: query
 *         name: q
 *         required: true
 *         schema:
 *           type: string
 *         description: Search term
 *     responses:
 *       200:
 *         description: Search results
 *       400:
 *         description: Invalid search query
 */
export const searchRoles = async (req, res, next) => {
  try {
    const { q } = req.query;
    const results = await roleService.searchRoles(q);
    sendSuccess(res, results, 'Search completed successfully');
  } catch (err) {
    next(new AppError(err.message, 500));
  }
};

/**
 * @openapi
 * /api/roles/{id}:
 *   patch:
 *     summary: Update role
 *     tags: [Roles]
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
 *             required:
 *               - name
 *               - active
 *             properties:
 *               name:
 *                 type: string
 *               description:
 *                 type: string
 *               active:
 *                 type: boolean
 *     responses:
 *       200:
 *         description: Role updated
 *       404:
 *         description: Role not found
 *       409:
 *         description: Role name already exists
 */
export const updateRole = async (req, res, next) => {
  try {
    const id = Number(req.params.id);
    const { name, description = null, active } = req.body || {};
    const result = await roleService.updateRole(id, name, description, active);
    
    if (!result) {
      return next(new AppError('Role not found', 404));
    }
    
    sendSuccess(res, result, 'Role updated successfully');
  } catch (err) {
    next(new AppError(err.message, err.statusCode || 500));
  }
};

/**
 * @openapi
 * /api/roles/{id}/activate:
 *   post:
 *     summary: Activate role
 *     tags: [Roles]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Role activated
 *       404:
 *         description: Role not found
 */
export const activateRole = async (req, res, next) => {
  try {
    const id = Number(req.params.id);
    const result = await roleService.activateRole(id);
    
    if (!result) {
      return next(new AppError('Role not found', 404));
    }
    
    sendSuccess(res, result, 'Role activated successfully');
  } catch (err) {
    next(new AppError(err.message, err.statusCode || 500));
  }
};

/**
 * @openapi
 * /api/roles/{id}/deactivate:
 *   post:
 *     summary: Deactivate role
 *     tags: [Roles]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Role deactivated
 *       404:
 *         description: Role not found
 */
export const deactivateRole = async (req, res, next) => {
  try {
    const id = Number(req.params.id);
    const result = await roleService.deactivateRole(id);
    
    if (!result) {
      return next(new AppError('Role not found', 404));
    }
    
    sendSuccess(res, result, 'Role deactivated successfully');
  } catch (err) {
    next(new AppError(err.message, err.statusCode || 500));
  }
};
