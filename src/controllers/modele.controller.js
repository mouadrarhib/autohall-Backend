// src/controllers/modele.controller.js

import { asyncHandler } from '../helpers/asyncHandler.js';
import { mapSqlError } from '../helpers/sqlErrorMapper.js';
import { parseBoolean } from '../helpers/queryHelpers.js';
import * as modeleService from '../services/modele.service.js';

/**
 * @openapi
 * tags:
 *   - name: Modeles
 *     description: Modele management operations
 */

/**
 * @openapi
 * /api/modeles:
 *   post:
 *     summary: Create a new modele
 *     tags: [Modeles]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - name
 *               - idMarque
 *             properties:
 *               name:
 *                 type: string
 *                 example: "Corolla"
 *               idMarque:
 *                 type: integer
 *                 example: 1
 *               active:
 *                 type: boolean
 *                 default: true
 *     responses:
 *       201:
 *         description: Modele created successfully
 *       400:
 *         description: Validation error or Marque inactive
 *       404:
 *         description: Marque not found
 */
export const createModele = asyncHandler(async (req, res) => {
  const { name, idMarque, active = true } = req.body || {};

  try {
    const result = await modeleService.createModele(name, idMarque, active);
    res.locals.objectId = result.id; // for audit
    res.status(201).json({ data: result });
  } catch (err) {
    const { status, message } = mapSqlError(err);
    res.status(status).json({ error: message });
  }
});

/**
 * @openapi
 * /api/modeles/{id}:
 *   get:
 *     summary: Get modele by ID
 *     tags: [Modeles]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Modele found
 *       404:
 *         description: Modele not found
 */
export const getModeleById = asyncHandler(async (req, res) => {
  const id = Number(req.params.id);
  const modele = await modeleService.getModeleById(id);
  
  if (!modele) {
    return res.status(404).json({ error: 'Modele not found' });
  }
  
  res.json({ data: modele });
});

/**
 * @openapi
 * /api/modeles:
 *   get:
 *     summary: List modeles with pagination
 *     tags: [Modeles]
 *     parameters:
 *       - in: query
 *         name: idMarque
 *         schema:
 *           type: integer
 *           nullable: true
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
 *         description: Paginated list of modeles
 */
export const listModeles = asyncHandler(async (req, res) => {
  const { idMarque } = req.query;
  const onlyActive = parseBoolean(req.query.onlyActive) !== 0; // Default to true
  const page = Number(req.query.page || 1);
  const pageSize = Number(req.query.pageSize || 10);
  
  const result = await modeleService.listModeles(idMarque, onlyActive, page, pageSize);
  res.json(result);
});

/**
 * @openapi
 * /api/modeles/by-marque/{idMarque}:
 *   get:
 *     summary: List modeles by marque with pagination
 *     tags: [Modeles]
 *     parameters:
 *       - in: path
 *         name: idMarque
 *         required: true
 *         schema:
 *           type: integer
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
 *         description: Paginated list of modeles for the marque
 */
export const listModelesByMarque = asyncHandler(async (req, res) => {
  const idMarque = Number(req.params.idMarque);
  const onlyActive = parseBoolean(req.query.onlyActive) !== 0; // Default to true
  const page = Number(req.query.page || 1);
  const pageSize = Number(req.query.pageSize || 10);
  
  const result = await modeleService.listModelesByMarque(idMarque, onlyActive, page, pageSize);
  res.json(result);
});

/**
 * @openapi
 * /api/modeles/search:
 *   get:
 *     summary: Search modeles with pagination
 *     tags: [Modeles]
 *     parameters:
 *       - in: query
 *         name: q
 *         required: true
 *         schema:
 *           type: string
 *         description: Search term
 *       - in: query
 *         name: idMarque
 *         schema:
 *           type: integer
 *           nullable: true
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
 *         description: Paginated search results
 *       400:
 *         description: Invalid search query
 */
export const searchModeles = asyncHandler(async (req, res) => {
  const { q, idMarque } = req.query;
  const onlyActive = parseBoolean(req.query.onlyActive) !== 0; // Default to true
  const page = Number(req.query.page || 1);
  const pageSize = Number(req.query.pageSize || 10);
  
  const result = await modeleService.searchModeles(q, idMarque, onlyActive, page, pageSize);
  res.json(result);
});

/**
 * @openapi
 * /api/modeles/{id}:
 *   patch:
 *     summary: Update modele
 *     tags: [Modeles]
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
 *               idMarque:
 *                 type: integer
 *               active:
 *                 type: boolean
 *     responses:
 *       200:
 *         description: Modele updated
 *       404:
 *         description: Modele not found
 */
export const updateModele = asyncHandler(async (req, res) => {
  const id = Number(req.params.id);
  const { name = null, idMarque = null, active = null } = req.body || {};

  try {
    const result = await modeleService.updateModele(id, name, idMarque, active);
    
    if (!result) {
      return res.status(404).json({ error: 'Modele not found' });
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
 * /api/modeles/{id}/activate:
 *   post:
 *     summary: Activate modele
 *     tags: [Modeles]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Modele activated
 *       404:
 *         description: Modele not found
 */
export const activateModele = asyncHandler(async (req, res) => {
  const id = Number(req.params.id);

  try {
    const result = await modeleService.activateModele(id);
    
    if (!result) {
      return res.status(404).json({ error: 'Modele not found' });
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
 * /api/modeles/{id}/deactivate:
 *   post:
 *     summary: Deactivate modele
 *     tags: [Modeles]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Modele deactivated
 *       404:
 *         description: Modele not found
 */
export const deactivateModele = asyncHandler(async (req, res) => {
  const id = Number(req.params.id);

  try {
    const result = await modeleService.deactivateModele(id);
    
    if (!result) {
      return res.status(404).json({ error: 'Modele not found' });
    }
    
    res.locals.objectId = id; // for audit
    res.json({ data: result });
  } catch (err) {
    const { status, message } = mapSqlError(err);
    res.status(status).json({ error: message });
  }
});
