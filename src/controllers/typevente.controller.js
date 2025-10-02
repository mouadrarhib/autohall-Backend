// src/controllers/typevente.controller.js

import { asyncHandler } from '../helpers/asyncHandler.js';
import { mapSqlError } from '../helpers/sqlErrorMapper.js';
import * as typeVenteService from '../services/typevente.service.js';

/**
 * @openapi
 * tags:
 *   - name: TypeVentes
 *     description: TypeVente management operations
 */

/**
 * @openapi
 * /api/type-ventes:
 *   post:
 *     summary: Create a new TypeVente
 *     tags: [TypeVentes]
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
 *                 example: "Vente directe"
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
export const createTypeVente = asyncHandler(async (req, res) => {
  const { name } = req.body || {};
  try {
    const result = await typeVenteService.createTypeVente(name);
    res.status(201).json({ data: result });
  } catch (err) {
    const { status, message } = mapSqlError(err);
    res.status(status).json({ error: message });
  }
});

/**
 * @openapi
 * /api/type-ventes/{id}:
 *   get:
 *     summary: Get active TypeVente by ID
 *     tags: [TypeVentes]
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
export const getTypeVenteById = asyncHandler(async (req, res) => {
  const id = Number(req.params.id);
  const row = await typeVenteService.getActiveTypeVenteById(id);
  if (!row) return res.status(404).json({ error: 'TypeVente not found' });
  res.json({ data: row });
});

/**
 * @openapi
 * /api/type-ventes:
 *   get:
 *     summary: List active TypeVentes
 *     tags: [TypeVentes]
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
export const listActiveTypeVentes = asyncHandler(async (_req, res) => {
  const rows = await typeVenteService.listActiveTypeVentes();
  res.json({ data: rows });
});

/**
 * @openapi
 * /api/type-ventes/{id}:
 *   patch:
 *     summary: Update TypeVente
 *     tags: [TypeVentes]
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
export const updateTypeVente = asyncHandler(async (req, res) => {
  const id = Number(req.params.id);
  const { name } = req.body || {};
  try {
    const result = await typeVenteService.updateTypeVente(id, name);
    if (!result) return res.status(404).json({ error: 'TypeVente not found' });
    res.json({ data: result });
  } catch (err) {
    const { status, message } = mapSqlError(err);
    res.status(status).json({ error: message });
  }
});

/**
 * @openapi
 * /api/type-ventes/{id}/activate:
 *   post:
 *     summary: Activate TypeVente
 *     tags: [TypeVentes]
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
export const activateTypeVente = asyncHandler(async (req, res) => {
  const id = Number(req.params.id);
  try {
    const result = await typeVenteService.activateTypeVente(id);
    if (!result) return res.status(404).json({ error: 'TypeVente not found' });
    res.json({ data: result });
  } catch (err) {
    const { status, message } = mapSqlError(err);
    res.status(status).json({ error: message });
  }
});

/**
 * @openapi
 * /api/type-ventes/{id}/deactivate:
 *   post:
 *     summary: Deactivate TypeVente
 *     tags: [TypeVentes]
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
export const deactivateTypeVente = asyncHandler(async (req, res) => {
  const id = Number(req.params.id);
  try {
    const result = await typeVenteService.deactivateTypeVente(id);
    if (!result) return res.status(404).json({ error: 'TypeVente not found' });
    res.json({ data: result });
  } catch (err) {
    const { status, message } = mapSqlError(err);
    res.status(status).json({ error: message });
  }
});
