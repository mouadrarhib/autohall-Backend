// src/controllers/typeobjectif.controller.js

import { asyncHandler } from '../helpers/asyncHandler.js';
import { mapSqlError } from '../helpers/sqlErrorMapper.js';
import * as typeObjectifService from '../services/typeobjectif.service.js';

/**
 * @openapi
 * tags:
 *   - name: TypeObjectifs
 *     description: TypeObjectif management operations
 */

/**
 * @openapi
 * /api/type-objectifs:
 *   post:
 *     summary: Create a new TypeObjectif
 *     tags: [TypeObjectifs]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [name]
 *             properties:
 *               name:
 *                 type: string
 *                 maxLength: 100
 *                 example: "Objectif annuel"
 *     responses:
 *       201:
 *         description: Created
 *       400:
 *         description: Validation error
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden
 */
export const createTypeObjectif = asyncHandler(async (req, res) => {
  const { name } = req.body || {};
  try {
    const result = await typeObjectifService.createTypeObjectif(name);
    res.status(201).json({ data: result });
  } catch (err) {
    const { status, message } = mapSqlError(err);
    res.status(status).json({ error: message });
  }
});

/**
 * @openapi
 * /api/type-objectifs/{id}:
 *   get:
 *     summary: Get active TypeObjectif by ID
 *     tags: [TypeObjectifs]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: integer }
 *     responses:
 *       200:
 *         description: Found
 *       404:
 *         description: Not found
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden
 */
export const getTypeObjectifById = asyncHandler(async (req, res) => {
  const id = Number(req.params.id);
  const row = await typeObjectifService.getActiveTypeObjectifById(id);
  if (!row) return res.status(404).json({ error: 'TypeObjectif not found' });
  res.json({ data: row });
});

/**
 * @openapi
 * /api/type-objectifs:
 *   get:
 *     summary: List active TypeObjectifs
 *     tags: [TypeObjectifs]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden
 */
export const listActiveTypeObjectifs = asyncHandler(async (_req, res) => {
  const rows = await typeObjectifService.listActiveTypeObjectifs();
  res.json({ data: rows });
});

/**
 * @openapi
 * /api/type-objectifs/{id}:
 *   patch:
 *     summary: Update TypeObjectif
 *     tags: [TypeObjectifs]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: integer }
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [name]
 *             properties:
 *               name:
 *                 type: string
 *                 maxLength: 100
 *     responses:
 *       200:
 *         description: Updated
 *       404:
 *         description: Not found
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden
 */
export const updateTypeObjectif = asyncHandler(async (req, res) => {
  const id = Number(req.params.id);
  const { name } = req.body || {};
  try {
    const result = await typeObjectifService.updateTypeObjectif(id, name);
    if (!result) return res.status(404).json({ error: 'TypeObjectif not found' });
    res.json({ data: result });
  } catch (err) {
    const { status, message } = mapSqlError(err);
    res.status(status).json({ error: message });
  }
});

/**
 * @openapi
 * /api/type-objectifs/{id}/activate:
 *   post:
 *     summary: Activate TypeObjectif
 *     tags: [TypeObjectifs]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: integer }
 *     responses:
 *       200:
 *         description: Activated
 *       404:
 *         description: Not found
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden
 */
export const activateTypeObjectif = asyncHandler(async (req, res) => {
  const id = Number(req.params.id);
  try {
    const result = await typeObjectifService.activateTypeObjectif(id);
    if (!result) return res.status(404).json({ error: 'TypeObjectif not found' });
    res.json({ data: result });
  } catch (err) {
    const { status, message } = mapSqlError(err);
    res.status(status).json({ error: message });
  }
});

/**
 * @openapi
 * /api/type-objectifs/{id}/deactivate:
 *   post:
 *     summary: Deactivate TypeObjectif
 *     tags: [TypeObjectifs]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: integer }
 *     responses:
 *       200:
 *         description: Deactivated
 *       404:
 *         description: Not found
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden
 */
export const deactivateTypeObjectif = asyncHandler(async (req, res) => {
  const id = Number(req.params.id);
  try {
    const result = await typeObjectifService.deactivateTypeObjectif(id);
    if (!result) return res.status(404).json({ error: 'TypeObjectif not found' });
    res.json({ data: result });
  } catch (err) {
    const { status, message } = mapSqlError(err);
    res.status(status).json({ error: message });
  }
});
