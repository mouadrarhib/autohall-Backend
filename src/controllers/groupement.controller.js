// src/controllers/groupement.controller.js

import { asyncHandler } from '../helpers/asyncHandler.js';
import { mapSqlError } from '../helpers/sqlErrorMapper.js';
import * as groupementService from '../services/groupement.service.js';

/**
 * @openapi
 * tags:
 *   - name: Groupements
 *     description: Groupement management operations
 */

/**
 * @openapi
 * /api/groupements:
 *   post:
 *     summary: Create a new groupement
 *     tags: [Groupements]
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
 *                 example: "Groupe Nord"
 *               active:
 *                 type: boolean
 *                 default: true
 *     responses:
 *       201:
 *         description: Groupement created successfully
 *       400:
 *         description: Validation error
 *       409:
 *         description: Groupement name already exists
 */
export const createGroupement = asyncHandler(async (req, res) => {
  const { name, active = true } = req.body || {};
  try {
    const result = await groupementService.createGroupement(name, active);
    res.locals.objectId = result.id; // for audit
    res.status(201).json({ data: result });
  } catch (err) {
    const { status, message } = mapSqlError(err);
    res.status(status).json({ error: message });
  }
});

/**
 * @openapi
 * /api/groupements/{id}:
 *   get:
 *     summary: Get groupement by ID
 *     tags: [Groupements]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Groupement found
 *       404:
 *         description: Groupement not found
 */
export const getGroupementById = asyncHandler(async (req, res) => {
  const id = Number(req.params.id);
  const groupement = await groupementService.getGroupementById(id);
  if (!groupement) {
    return res.status(404).json({ error: 'Groupement not found' });
  }
  res.json({ data: groupement });
});

/**
 * @openapi
 * /api/groupements:
 *   get:
 *     summary: List all groupements
 *     tags: [Groupements]
 *     responses:
 *       200:
 *         description: List of groupements
 */
export const listGroupements = asyncHandler(async (req, res) => {
  const groupements = await groupementService.listGroupements();
  res.json({ data: groupements });
});

/**
 * @openapi
 * /api/groupements/search:
 *   get:
 *     summary: Search groupements by name
 *     tags: [Groupements]
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
export const searchGroupements = asyncHandler(async (req, res) => {
  const { q } = req.query;
  const results = await groupementService.searchGroupements(q);
  res.json({ data: results });
});

/**
 * @openapi
 * /api/groupements/{id}:
 *   patch:
 *     summary: Update groupement
 *     tags: [Groupements]
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
 *         description: Groupement updated
 *       404:
 *         description: Groupement not found
 *       409:
 *         description: Groupement name already exists
 */
export const updateGroupement = asyncHandler(async (req, res) => {
  const id = Number(req.params.id);
  const { name = null, active = null } = req.body || {};
  try {
    const result = await groupementService.updateGroupement(id, name, active);
    if (!result) {
      return res.status(404).json({ error: 'Groupement not found' });
    }
    res.locals.objectId = id; // for audit
    res.json({ data: result });
  } catch (err) {
    const { status, message } = mapSqlError(err);
    res.status(status).json({ error: message });
  }
});

/**
 * @openapi
 * /api/groupements/{id}/activate:
 *   post:
 *     summary: Activate groupement
 *     tags: [Groupements]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Groupement activated
 *       404:
 *         description: Groupement not found
 */
export const activateGroupement = asyncHandler(async (req, res) => {
  const id = Number(req.params.id);
  try {
    const result = await groupementService.activateGroupement(id);
    if (!result) {
      return res.status(404).json({ error: 'Groupement not found' });
    }
    res.locals.objectId = id; // for audit
    res.json({ data: result });
  } catch (err) {
    const { status, message } = mapSqlError(err);
    res.status(status).json({ error: message });
  }
});

/**
 * @openapi
 * /api/groupements/{id}/deactivate:
 *   post:
 *     summary: Deactivate groupement
 *     tags: [Groupements]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Groupement deactivated
 *       404:
 *         description: Groupement not found
 */
export const deactivateGroupement = asyncHandler(async (req, res) => {
  const id = Number(req.params.id);
  try {
    const result = await groupementService.deactivateGroupement(id);
    if (!result) {
      return res.status(404).json({ error: 'Groupement not found' });
    }
    res.locals.objectId = id; // for audit
    res.json({ data: result });
  } catch (err) {
    const { status, message } = mapSqlError(err);
    res.status(status).json({ error: message });
  }
});

/**
 * @openapi
 * /api/groupements/{id}/users:
 *   get:
 *     summary: List active users in a groupement (paginated)
 *     tags: [Groupements]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: Groupement ID
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
 *           default: 10
 *         description: Number of records per page
 *     responses:
 *       200:
 *         description: Paginated list of users
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 data:
 *                   type: array
 *                   items:
 *                     type: object
 *                 pagination:
 *                   type: object
 *                   properties:
 *                     page:
 *                       type: integer
 *                     pageSize:
 *                       type: integer
 *                     totalRecords:
 *                       type: integer
 *                     totalPages:
 *                       type: integer
 *       404:
 *         description: Groupement not found
 */
export const listUsersByGroupement = asyncHandler(async (req, res) => {
  const idGroupement = Number(req.params.id);
  
  // Parse pagination parameters
  const page = Number(req.query.page || 1);
  const pageSize = Number(req.query.pageSize || 10);
  
  // Call service with pagination
  const result = await groupementService.listUsersByGroupement(idGroupement, page, pageSize);
  
  res.json(result);
});
