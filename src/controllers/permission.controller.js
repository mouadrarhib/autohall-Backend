// src/controllers/permission.controller.js

import { asyncHandler } from '../helpers/asyncHandler.js';
import { mapSqlError } from '../helpers/sqlErrorMapper.js';
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
export const createPermission = asyncHandler(async (req, res) => {
  const { name, active = true } = req.body || {};

  try {
    const result = await permissionService.createPermission(name, active);
    res.status(201).json({ data: result });
  } catch (err) {
    const { status, message } = mapSqlError(err);
    res.status(status).json({ error: message });
  }
});

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
export const getPermissionById = asyncHandler(async (req, res) => {
  const id = Number(req.params.id);
  const permission = await permissionService.getPermissionById(id);
  
  if (!permission) {
    return res.status(404).json({ error: 'Permission not found.' });
  }
  
  res.json({ data: permission });
});

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
export const getPermissionByName = asyncHandler(async (req, res) => {
  const { name } = req.params;
  const permission = await permissionService.getPermissionByName(name);
  
  if (!permission) {
    return res.status(404).json({ error: 'Permission not found.' });
  }
  
  res.json({ data: permission });
});

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
export const listPermissions = asyncHandler(async (req, res) => {
  const { active, search } = req.query;
  const page = Number(req.query.page || 1);
  const pageSize = Number(req.query.pageSize || 50);
  
  const result = await permissionService.listPermissions(active, search, page, pageSize);
  res.json(result);
});

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
export const updatePermission = asyncHandler(async (req, res) => {
  const id = Number(req.params.id);
  const { name, active } = req.body || {};

  try {
    const result = await permissionService.updatePermission(id, name, active);
    
    if (!result) {
      return res.status(404).json({ error: 'Permission not found.' });
    }
    
    res.json({ data: result });
  } catch (err) {
    const { status, message } = mapSqlError(err);
    res.status(status).json({ error: message });
  }
});

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
export const activatePermission = asyncHandler(async (req, res) => {
  const id = Number(req.params.id);

  try {
    const result = await permissionService.activatePermission(id);
    
    if (!result) {
      return res.status(404).json({ error: 'Permission not found.' });
    }
    
    res.json({ data: result });
  } catch (err) {
    const { status, message } = mapSqlError(err);
    res.status(status).json({ error: message });
  }
});

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
export const deactivatePermission = asyncHandler(async (req, res) => {
  const id = Number(req.params.id);

  try {
    const result = await permissionService.deactivatePermission(id);
    
    if (!result) {
      return res.status(404).json({ error: 'Permission not found.' });
    }
    
    res.json({ data: result });
  } catch (err) {
    const { status, message } = mapSqlError(err);
    res.status(status).json({ error: message });
  }
});

// ---------- UserPermission Operations ----------

/**
 * @openapi
 * /api/permissions/user/{idUser}/list:
 *   get:
 *     summary: List permissions linked to a specific user
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
 *     responses:
 *       200:
 *         description: List of permissions
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 data:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       id:
 *                         type: integer
 *                         description: Permission ID
 *                       name:
 *                         type: string
 *                         description: Permission name
 *                       active:
 *                         type: boolean
 *                         description: Whether the permission is active
 *       400:
 *         description: Validation error (invalid idUser)
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                 details:
 *                   type: object
 *                   additionalProperties: true
 */

export const listUserPermissions = asyncHandler(async (req, res) => {
  // Parse and validate idUser
  const idUser = parseInt(req.params.idUser, 10);
  if (!idUser || idUser < 1) {
    return res.status(400).json({
      error: "Validation failed",
      details: { id: "ID must be a positive integer" }
    });
  }

  // Parse active query parameter (optional)
  let { active } = req.query;
  if (active !== undefined) {
    active = active === 'true' || active === '1' ? 1 : 0;
  } else {
    active = null; // null means no filter
  }

  // Call service
  const data = await permissionService.listUserPermissions(idUser, active);

  // Return response
  res.json({ data });
});

/**
 * @openapi
 * /api/permissions/{idPermission}/users:
 *   get:
 *     summary: List users attached to a specific permission
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
 *         description: Filter by active status (true = active, false = inactive)
 *     responses:
 *       200:
 *         description: List of users attached to the permission
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 data:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       id:
 *                         type: integer
 *                         description: User ID
 *                       username:
 *                         type: string
 *                         description: Username
 *                       email:
 *                         type: string
 *                         description: User email
 *                       active:
 *                         type: boolean
 *                         description: Whether the user-permission link is active
 *       400:
 *         description: Validation error (invalid idPermission)
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                 details:
 *                   type: object
 *                   additionalProperties: true
 */

export const listUsersByPermission = asyncHandler(async (req, res) => {
  const idPermission = Number(req.params.idPermission);
  const { active } = req.query;

  const data = await permissionService.listUsersByPermission(idPermission, active);
  res.json({ data });
});

/**
 * @openapi
 * /api/permissions/user/{idUser}/add:
 *   post:
 *     summary: Link permission to user (upsert)
 *     tags: [Permissions]
 *     parameters:
 *       - in: path
 *         name: idUser
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
 *               - idPermission
 *             properties:
 *               idPermission:
 *                 type: integer
 *     responses:
 *       201:
 *         description: Created
 */
export const addUserPermission = asyncHandler(async (req, res) => {
  const idUser = Number(req.params.idUser);
  const idPermission = Number(req.body?.idPermission);

  try {
    const result = await permissionService.addUserPermission(idUser, idPermission);
    res.status(201).json({ data: result });
  } catch (err) {
    const { status, message } = mapSqlError(err);
    res.status(status).json({ error: message });
  }
});

/**
 * @openapi
 * /api/permissions/user/{idUser}/activate:
 *   post:
 *     summary: Activate a user-permission link
 *     tags: [Permissions]
 *     parameters:
 *       - in: path
 *         name: idUser
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
 *               - idPermission
 *             properties:
 *               idPermission:
 *                 type: integer
 *     responses:
 *       200:
 *         description: OK
 */
export const activateUserPermission = asyncHandler(async (req, res) => {
  const idUser = Number(req.params.idUser);
  const idPermission = Number(req.body?.idPermission);

  try {
    const result = await permissionService.activateUserPermission(idUser, idPermission);
    res.json({ data: result });
  } catch (err) {
    const { status, message } = mapSqlError(err);
    res.status(status).json({ error: message });
  }
});

/**
 * @openapi
 * /api/permissions/user/{idUser}/deactivate:
 *   post:
 *     summary: Deactivate a user-permission link
 *     tags: [Permissions]
 *     parameters:
 *       - in: path
 *         name: idUser
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
 *               - idPermission
 *             properties:
 *               idPermission:
 *                 type: integer
 *     responses:
 *       200:
 *         description: OK
 */
export const deactivateUserPermission = asyncHandler(async (req, res) => {
  const idUser = Number(req.params.idUser);
  const idPermission = Number(req.body?.idPermission);

  try {
    const result = await permissionService.deactivateUserPermission(idUser, idPermission);
    res.json({ data: result });
  } catch (err) {
    const { status, message } = mapSqlError(err);
    res.status(status).json({ error: message });
  }
});

/**
 * @openapi
 * /api/permissions/user/{idUser}/remove:
 *   post:
 *     summary: Remove (or soft-remove) a user-permission link
 *     tags: [Permissions]
 *     parameters:
 *       - in: path
 *         name: idUser
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
 *               - idPermission
 *             properties:
 *               idPermission:
 *                 type: integer
 *               hardDelete:
 *                 type: boolean
 *                 default: false
 *     responses:
 *       200:
 *         description: OK
 */
export const removeUserPermission = asyncHandler(async (req, res) => {
  const idUser = Number(req.params.idUser);
  const idPermission = Number(req.body?.idPermission);
  const hardDelete = !!req.body?.hardDelete;

  try {
    const result = await permissionService.removeUserPermission(idUser, idPermission, hardDelete);
    res.json({ data: result });
  } catch (err) {
    const { status, message } = mapSqlError(err);
    res.status(status).json({ error: message });
  }
});

/**
 * @openapi
 * /api/permissions/user/{idUser}/has/{permissionName}:
 *   get:
 *     summary: Returns hasPermission (1/0)
 *     tags: [Permissions]
 *     parameters:
 *       - in: path
 *         name: idUser
 *         required: true
 *         schema:
 *           type: integer
 *       - in: path
 *         name: permissionName
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: OK
 */
export const userHasPermissionByName = asyncHandler(async (req, res) => {
  const idUser = Number(req.params.idUser);
  const { permissionName } = req.params;

  const result = await permissionService.userHasPermissionByName(idUser, permissionName);
  res.json({ data: result });
});

export const setPermissionActive = asyncHandler(async (req, res) => {
  const id = Number(req.params.id);
  // expecting body like { active: true/false }
  const { active } = req.body ?? {};

  // validate body presence (optional, you already have validateSetActive middleware)
  if (typeof active === 'undefined') {
    return res.status(400).json({ error: 'Missing active in request body' });
  }

  try {
    const result = await permissionService.setPermissionActive(id, !!active);

    if (!result) {
      return res.status(404).json({ error: 'Permission not found.' });
    }

    res.json({ data: result });
  } catch (err) {
    const { status, message } = mapSqlError(err);
    res.status(status).json({ error: message });
  }
});

