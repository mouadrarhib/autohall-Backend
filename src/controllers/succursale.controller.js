// src/controllers/succursale.controller.js

import { asyncHandler } from '../helpers/asyncHandler.js';
import { mapSqlError } from '../helpers/sqlErrorMapper.js';
import { parseBoolean } from '../helpers/queryHelpers.js';
import * as succursaleService from '../services/succursale.service.js';

/**
 * @openapi
 * tags:
 *   - name: Succursales
 *     description: Succursale management operations
 */

/**
 * @openapi
 * /api/succursales:
 *   post:
 *     summary: Create a new succursale
 *     tags: [Succursales]
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
 *                 example: "Casablanca Center"
 *               active:
 *                 type: boolean
 *                 default: true
 *     responses:
 *       201:
 *         description: Succursale created successfully
 *       400:
 *         description: Validation error
 *       409:
 *         description: Succursale name already exists
 */
export const createSuccursale = asyncHandler(async (req, res) => {
  const { name, active = true } = req.body || {};

  try {
    const result = await succursaleService.createSuccursale(name, active);
    res.locals.objectId = result.id; // for audit
    res.status(201).json({ data: result });
  } catch (err) {
    const { status, message } = mapSqlError(err);
    res.status(status).json({ error: message });
  }
});

/**
 * @openapi
 * /api/succursales/{id}:
 *   get:
 *     summary: Get succursale by ID
 *     tags: [Succursales]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Succursale found
 *       404:
 *         description: Succursale not found
 */
export const getSuccursaleById = asyncHandler(async (req, res) => {
  const id = Number(req.params.id);
  const succursale = await succursaleService.getSuccursaleById(id);
  
  if (!succursale) {
    return res.status(404).json({ error: 'Succursale not found' });
  }
  
  res.json({ data: succursale });
});

/**
 * @openapi
 * /api/succursales:
 *   get:
 *     summary: List succursales with pagination
 *     tags: [Succursales]
 *     parameters:
 *       - in: query
 *         name: onlyActive
 *         schema:
 *           type: boolean
 *           default: true
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *       - in: query
 *         name: pageSize
 *         schema:
 *           type: integer
 *           default: 10
 *     responses:
 *       200:
 *         description: Paginated list of succursales
 */
export const listSuccursales = asyncHandler(async (req, res) => {
  const onlyActive = parseBoolean(req.query.onlyActive) !== 0; // Default to true
  const page = Number(req.query.page || 1);
  const pageSize = Number(req.query.pageSize || 10);
  
  const result = await succursaleService.listSuccursales(onlyActive, page, pageSize);
  res.json(result);
});

/**
 * @openapi
 * /api/succursales/search:
 *   get:
 *     summary: Search succursales
 *     tags: [Succursales]
 *     parameters:
 *       - in: query
 *         name: q
 *         required: true
 *         schema:
 *           type: string
 *         description: Search term
 *       - in: query
 *         name: onlyActive
 *         schema:
 *           type: boolean
 *           default: true
 *     responses:
 *       200:
 *         description: Search results
 *       400:
 *         description: Invalid search query
 */
export const searchSuccursales = asyncHandler(async (req, res) => {
  const { q } = req.query;
  const onlyActive = parseBoolean(req.query.onlyActive) !== 0; // Default to true
  
  const results = await succursaleService.searchSuccursales(q, onlyActive);
  res.json({ data: results });
});

/**
 * @openapi
 * /api/succursales/{id}:
 *   patch:
 *     summary: Update succursale
 *     tags: [Succursales]
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
 *         description: Succursale updated
 *       404:
 *         description: Succursale not found
 */
export const updateSuccursale = asyncHandler(async (req, res) => {
  const id = Number(req.params.id);
  const { name = null, active = null } = req.body || {};

  try {
    const result = await succursaleService.updateSuccursale(id, name, active);
    
    if (!result) {
      return res.status(404).json({ error: 'Succursale not found' });
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
 * /api/succursales/{id}/activate:
 *   post:
 *     summary: Activate succursale
 *     tags: [Succursales]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Succursale activated
 *       404:
 *         description: Succursale not found
 */
export const activateSuccursale = asyncHandler(async (req, res) => {
  const id = Number(req.params.id);

  try {
    const result = await succursaleService.activateSuccursale(id);
    
    if (!result) {
      return res.status(404).json({ error: 'Succursale not found' });
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
 * /api/succursales/{id}/deactivate:
 *   post:
 *     summary: Deactivate succursale
 *     tags: [Succursales]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Succursale deactivated
 *       404:
 *         description: Succursale not found
 */
export const deactivateSuccursale = asyncHandler(async (req, res) => {
  const id = Number(req.params.id);

  try {
    const result = await succursaleService.deactivateSuccursale(id);
    
    if (!result) {
      return res.status(404).json({ error: 'Succursale not found' });
    }
    
    res.locals.objectId = id; // for audit
    res.json({ data: result });
  } catch (err) {
    const { status, message } = mapSqlError(err);
    res.status(status).json({ error: message });
  }
});
