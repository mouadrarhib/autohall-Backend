// src/controllers/filiale.controller.js

import { asyncHandler } from '../helpers/asyncHandler.js';
import { mapSqlError } from '../helpers/sqlErrorMapper.js';
import * as filialeService from '../services/filiale.service.js';

/**
 * @openapi
 * tags:
 *   - name: Filiales
 *     description: Filiale management operations
 */

/**
 * @openapi
 * /api/filiales:
 *   post:
 *     summary: Create a new filiale
 *     tags: [Filiales]
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
 *                 example: "Casablanca"
 *               active:
 *                 type: boolean
 *                 default: true
 *     responses:
 *       201:
 *         description: Filiale created successfully
 *       400:
 *         description: Validation error
 *       409:
 *         description: Filiale name already exists
 */
export const createFiliale = asyncHandler(async (req, res) => {
  const { name, active = true } = req.body || {};
  try {
    const result = await filialeService.createFiliale(name, active);
    res.status(201).json({ data: result });
  } catch (err) {
    const { status, message } = mapSqlError(err);
    res.status(status).json({ error: message });
  }
});

/**
 * @openapi
 * /api/filiales/{id}:
 *   get:
 *     summary: Get filiale by ID
 *     tags: [Filiales]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Filiale found
 *       404:
 *         description: Filiale not found
 */
export const getFilialeById = asyncHandler(async (req, res) => {
  const id = Number(req.params.id);
  const filiale = await filialeService.getFilialeById(id);
  if (!filiale) {
    return res.status(404).json({ error: 'Filiale not found' });
  }
  res.json({ data: filiale });
});

/**
 * @openapi
 * /api/filiales:
 *   get:
 *     summary: List all filiales with pagination
 *     tags: [Filiales]
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
 *           default: 10
 *         description: Number of records per page
 *     responses:
 *       200:
 *         description: Paginated list of filiales
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
 */
export const listFiliales = asyncHandler(async (req, res) => {
  const page = Number(req.query.page || 1);
  const pageSize = Number(req.query.pageSize || 10);
  
  const result = await filialeService.listFiliales(page, pageSize);
  res.json(result);
});

/**
 * @openapi
 * /api/filiales/{id}:
 *   patch:
 *     summary: Update filiale
 *     tags: [Filiales]
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
 *         description: Filiale updated
 *       404:
 *         description: Filiale not found
 *       409:
 *         description: Filiale name already exists
 */
export const updateFiliale = asyncHandler(async (req, res) => {
  const id = Number(req.params.id);
  const { name = null, active = null } = req.body || {};
  try {
    const result = await filialeService.updateFiliale(id, name, active);
    if (!result) {
      return res.status(404).json({ error: 'Filiale not found' });
    }
    res.json({ data: result });
  } catch (err) {
    const { status, message } = mapSqlError(err);
    res.status(status).json({ error: message });
  }
});

/**
 * @openapi
 * /api/filiales/{id}/activate:
 *   post:
 *     summary: Activate filiale
 *     tags: [Filiales]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Filiale activated
 *       404:
 *         description: Filiale not found
 */
export const activateFiliale = asyncHandler(async (req, res) => {
  const id = Number(req.params.id);
  try {
    const result = await filialeService.activateFiliale(id);
    if (!result) {
      return res.status(404).json({ error: 'Filiale not found' });
    }
    res.json({ data: result });
  } catch (err) {
    const { status, message } = mapSqlError(err);
    res.status(status).json({ error: message });
  }
});

/**
 * @openapi
 * /api/filiales/{id}/deactivate:
 *   post:
 *     summary: Deactivate filiale
 *     tags: [Filiales]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Filiale deactivated
 *       404:
 *         description: Filiale not found
 */
export const deactivateFiliale = asyncHandler(async (req, res) => {
  const id = Number(req.params.id);
  try {
    const result = await filialeService.deactivateFiliale(id);
    if (!result) {
      return res.status(404).json({ error: 'Filiale not found' });
    }
    res.json({ data: result });
  } catch (err) {
    const { status, message } = mapSqlError(err);
    res.status(status).json({ error: message });
  }
});
