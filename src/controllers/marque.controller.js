// src/controllers/marque.controller.js

import { asyncHandler } from '../helpers/asyncHandler.js';
import { mapSqlError } from '../helpers/sqlErrorMapper.js';
import { parseBoolean } from '../helpers/queryHelpers.js';
import * as marqueService from '../services/marque.service.js';

/**
 * @openapi
 * tags:
 *   - name: Marques
 *     description: Marque management operations
 */

/**
 * @openapi
 * /api/marques:
 *   post:
 *     summary: Create a new marque
 *     tags: [Marques]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - name
 *               - idFiliale
 *             properties:
 *               name:
 *                 type: string
 *                 example: "Toyota"
 *               idFiliale:
 *                 type: integer
 *                 example: 1
 *               active:
 *                 type: boolean
 *                 default: true
 *     responses:
 *       201:
 *         description: Marque created successfully
 *       400:
 *         description: Validation error or Filiale inactive
 *       404:
 *         description: Filiale not found
 */
export const createMarque = asyncHandler(async (req, res) => {
  const { name, idFiliale, active = true } = req.body || {};

  try {
    const result = await marqueService.createMarque(name, idFiliale, active);
    res.status(201).json({ data: result });
  } catch (err) {
    const { status, message } = mapSqlError(err);
    res.status(status).json({ error: message });
  }
});

/**
 * @openapi
 * /api/marques/{id}:
 *   get:
 *     summary: Get marque by ID
 *     tags: [Marques]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Marque found
 *       404:
 *         description: Marque not found
 */
export const getMarqueById = asyncHandler(async (req, res) => {
  const id = Number(req.params.id);
  const marque = await marqueService.getMarqueById(id);
  
  if (!marque) {
    return res.status(404).json({ error: 'Marque not found' });
  }
  
  res.json({ data: marque });
});

/**
 * @openapi
 * /api/marques:
 *   get:
 *     summary: List marques
 *     tags: [Marques]
 *     parameters:
 *       - in: query
 *         name: idFiliale
 *         schema:
 *           type: integer
 *           nullable: true
 *       - in: query
 *         name: onlyActive
 *         schema:
 *           type: boolean
 *           default: true
 *     responses:
 *       200:
 *         description: List of marques
 */
export const listMarques = asyncHandler(async (req, res) => {
  const { idFiliale } = req.query;
  const onlyActive = parseBoolean(req.query.onlyActive) !== 0; // Default to true
  
  const marques = await marqueService.listMarques(idFiliale, onlyActive);
  res.json({ data: marques });
});

/**
 * @openapi
 * /api/marques/by-filiale/{idFiliale}:
 *   get:
 *     summary: List marques by filiale
 *     tags: [Marques]
 *     parameters:
 *       - in: path
 *         name: idFiliale
 *         required: true
 *         schema:
 *           type: integer
 *       - in: query
 *         name: onlyActive
 *         schema:
 *           type: boolean
 *           default: true
 *     responses:
 *       200:
 *         description: List of marques for the filiale
 */
export const listMarquesByFiliale = asyncHandler(async (req, res) => {
  const idFiliale = Number(req.params.idFiliale);
  const onlyActive = parseBoolean(req.query.onlyActive) !== 0; // Default to true
  
  const marques = await marqueService.listMarquesByFiliale(idFiliale, onlyActive);
  res.json({ data: marques });
});

/**
 * @openapi
 * /api/marques/search:
 *   get:
 *     summary: Search marques
 *     tags: [Marques]
 *     parameters:
 *       - in: query
 *         name: search
 *         required: true
 *         schema:
 *           type: string
 *         description: |
 *           Search term (preferred).
 *           Example: toyota
 *       - in: query
 *         name: q
 *         required: false
 *         schema:
 *           type: string
 *         deprecated: true
 *         description: |
 *           Legacy short query parameter. Use parameter named "search" instead.
 *           If both are provided, the "search" parameter takes precedence.
 *       - in: query
 *         name: idFiliale
 *         schema:
 *           type: integer
 *           nullable: true
 *         description: Optional filiale ID to filter results.
 *       - in: query
 *         name: onlyActive
 *         schema:
 *           type: boolean
 *           default: true
 *         description: If true, return only active marques.
 *     responses:
 *       200:
 *         description: Search results
 *       400:
 *         description: Invalid or missing search query
 */

export const searchMarques = asyncHandler(async (req, res) => {
  // Prefer the explicit 'search' param; fall back to legacy 'q'
  const rawSearch = req.query.search ?? req.query.q ?? '';
  const search = String(rawSearch).trim();

  if (!search) {
    return res.status(400).json({
      error: 'Missing search query. Provide ?search=<term> (or legacy ?q=<term>).'
    });
  }

  // idFiliale: optional integer
  const idFiliale = req.query.idFiliale ? Number(req.query.idFiliale) : null;
  if (req.query.idFiliale && Number.isNaN(idFiliale)) {
    return res.status(400).json({ error: 'Invalid idFiliale. Must be an integer.' });
  }

  // onlyActive: parse using your helper (keeps previous behavior)
  const onlyActive = parseBoolean(req.query.onlyActive) !== 0; // default true

  const results = await marqueService.searchMarques(search, idFiliale, onlyActive);
  res.json({ data: results });
});


/**
 * @openapi
 * /api/marques/{id}:
 *   patch:
 *     summary: Update marque
 *     tags: [Marques]
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
 *               idFiliale:
 *                 type: integer
 *               active:
 *                 type: boolean
 *     responses:
 *       200:
 *         description: Marque updated
 *       404:
 *         description: Marque not found
 */
export const updateMarque = asyncHandler(async (req, res) => {
  const id = Number(req.params.id);
  const { name = null, idFiliale = null, active = null } = req.body || {};

  try {
    const result = await marqueService.updateMarque(id, name, idFiliale, active);
    
    if (!result) {
      return res.status(404).json({ error: 'Marque not found' });
    }
    
    res.json({ data: result });
  } catch (err) {
    const { status, message } = mapSqlError(err);
    res.status(status).json({ error: message });
  }
});

/**
 * @openapi
 * /api/marques/{id}/activate:
 *   post:
 *     summary: Activate marque
 *     tags: [Marques]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Marque activated
 *       404:
 *         description: Marque not found
 */
export const activateMarque = asyncHandler(async (req, res) => {
  const id = Number(req.params.id);

  try {
    const result = await marqueService.activateMarque(id);
    
    if (!result) {
      return res.status(404).json({ error: 'Marque not found' });
    }
    
    res.json({ data: result });
  } catch (err) {
    const { status, message } = mapSqlError(err);
    res.status(status).json({ error: message });
  }
});

/**
 * @openapi
 * /api/marques/{id}/deactivate:
 *   post:
 *     summary: Deactivate marque
 *     tags: [Marques]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Marque deactivated
 *       404:
 *         description: Marque not found
 */
export const deactivateMarque = asyncHandler(async (req, res) => {
  const id = Number(req.params.id);

  try {
    const result = await marqueService.deactivateMarque(id);
    
    if (!result) {
      return res.status(404).json({ error: 'Marque not found' });
    }
    
    res.json({ data: result });
  } catch (err) {
    const { status, message } = mapSqlError(err);
    res.status(status).json({ error: message });
  }
});
