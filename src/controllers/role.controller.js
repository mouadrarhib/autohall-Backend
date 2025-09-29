// src/controllers/role.controller.js

import { asyncHandler } from '../helpers/asyncHandler.js';
import { mapSqlError } from '../helpers/sqlErrorMapper.js';
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
export const createRole = asyncHandler(async (req, res) => {
  const { name, description = null, active = true } = req.body || {};

  try {
    const result = await roleService.createRole(name, description, active);
    res.status(201).json({ data: result });
  } catch (err) {
    const { status, message } = mapSqlError(err);
    res.status(status).json({ error: message });
  }
});

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
export const getRoleById = asyncHandler(async (req, res) => {
  const id = Number(req.params.id);
  const role = await roleService.getRoleById(id);
  
  if (!role) {
    return res.status(404).json({ error: 'Role not found' });
  }
  
  res.json({ data: role });
});

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
export const listRoles = asyncHandler(async (req, res) => {
  const roles = await roleService.listRoles();
  res.json({ data: roles });
});

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
export const searchRoles = asyncHandler(async (req, res) => {
  const { q } = req.query;
  const results = await roleService.searchRoles(q);
  res.json({ data: results });
});

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
export const updateRole = asyncHandler(async (req, res) => {
  const id = Number(req.params.id);
  const { name, description = null, active } = req.body || {};

  try {
    const result = await roleService.updateRole(id, name, description, active);
    
    if (!result) {
      return res.status(404).json({ error: 'Role not found' });
    }
    
    res.json({ data: result });
  } catch (err) {
    const { status, message } = mapSqlError(err);
    res.status(status).json({ error: message });
  }
});

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
export const activateRole = asyncHandler(async (req, res) => {
  const id = Number(req.params.id);

  try {
    const result = await roleService.activateRole(id);
    
    if (!result) {
      return res.status(404).json({ error: 'Role not found' });
    }
    
    res.json({ data: result });
  } catch (err) {
    const { status, message } = mapSqlError(err);
    res.status(status).json({ error: message });
  }
});

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
export const deactivateRole = asyncHandler(async (req, res) => {
  const id = Number(req.params.id);

  try {
    const result = await roleService.deactivateRole(id);
    
    if (!result) {
      return res.status(404).json({ error: 'Role not found' });
    }
    
    res.json({ data: result });
  } catch (err) {
    const { status, message } = mapSqlError(err);
    res.status(status).json({ error: message });
  }
});
