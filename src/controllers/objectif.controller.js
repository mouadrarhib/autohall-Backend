// src/controllers/objectif.controller.js

import { asyncHandler } from '../helpers/asyncHandler.js';
import { mapSqlError } from '../helpers/sqlErrorMapper.js';
import * as objectifService from '../services/objectif.service.js';

/**
 * @openapi
 * tags:
 *   - name: Objectifs
 *     description: Objectif management operations
 */

/**
 * @openapi
 * /api/objectifs:
 *   post:
 *     summary: Create a new Objectif
 *     tags: [Objectifs]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [userId, groupementId, siteId, periodeId, typeVenteId, typeObjectifId, volume, SalePrice, TMDirect, MargeInterGroupe]
 *             properties:
 *               userId: { type: integer }
 *               groupementId: { type: integer }
 *               siteId: { type: integer }
 *               periodeId: { type: integer }
 *               typeVenteId: { type: integer }
 *               typeObjectifId: { type: integer }
 *               marqueId: { type: integer, nullable: true }
 *               modeleId: { type: integer, nullable: true }
 *               versionId: { type: integer, nullable: true }
 *               volume: { type: integer }
 *               SalePrice: { type: number, format: decimal }
 *               TMDirect: { type: number, format: decimal, maximum: 0.40 }
 *               MargeInterGroupe: { type: number, format: decimal, maximum: 0.40 }
 *     responses:
 *       201: { description: Created }
 *       400: { description: Validation error }
 */
export const createObjectif = asyncHandler(async (req, res) => {
  try {
    const result = await objectifService.createObjectif(req.body);
    res.status(201).json({ data: result });
  } catch (err) {
    const { status, message } = mapSqlError(err);
    res.status(status).json({ error: message });
  }
});

/**
 * @openapi
 * /api/objectifs/{id}:
 *   get:
 *     summary: Get active Objectif by ID
 *     tags: [Objectifs]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: integer }
 *     responses:
 *       200: { description: Found }
 *       404: { description: Not found }
 */
export const getObjectifById = asyncHandler(async (req, res) => {
  const id = Number(req.params.id);
  const row = await objectifService.getActiveObjectifById(id);
  if (!row) return res.status(404).json({ error: 'Objectif not found' });
  res.json({ data: row });
});

/**
 * @openapi
 * /api/objectifs:
 *   get:
 *     summary: List active Objectifs with optional filters
 *     tags: [Objectifs]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: userId
 *         schema: { type: integer }
 *       - in: query
 *         name: periodeId
 *         schema: { type: integer }
 *       - in: query
 *         name: groupementId
 *         schema: { type: integer }
 *       - in: query
 *         name: siteId
 *         schema: { type: integer }
 *     responses:
 *       200: { description: List }
 */
export const listActiveObjectifs = asyncHandler(async (req, res) => {
  const filters = {
    userId: req.query.userId,
    periodeId: req.query.periodeId,
    groupementId: req.query.groupementId,
    siteId: req.query.siteId
  };
  const rows = await objectifService.listActiveObjectifs(filters);
  res.json({ data: rows });
});

/**
 * @openapi
 * /api/objectifs/view:
 *   get:
 *     summary: List Objectifs with enriched view data
 *     tags: [Objectifs]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: userId
 *         schema: { type: integer }
 *       - in: query
 *         name: periodeId
 *         schema: { type: integer }
 *       - in: query
 *         name: groupementId
 *         schema: { type: integer }
 *       - in: query
 *         name: siteId
 *         schema: { type: integer }
 *     responses:
 *       200: { description: Enriched list }
 */
export const listObjectifsView = asyncHandler(async (req, res) => {
  const filters = {
    userId: req.query.userId,
    periodeId: req.query.periodeId,
    groupementId: req.query.groupementId,
    siteId: req.query.siteId
  };
  const rows = await objectifService.listObjectifsView(filters);
  res.json({ data: rows });
});

/**
 * @openapi
 * /api/objectifs/{id}:
 *   patch:
 *     summary: Update Objectif
 *     tags: [Objectifs]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: integer }
 *     responses:
 *       200: { description: Updated }
 */
export const updateObjectif = asyncHandler(async (req, res) => {
  const id = Number(req.params.id);
  const updatedUserId = req.user?.id || null;
  try {
    const result = await objectifService.updateObjectif(id, req.body, updatedUserId);
    if (!result) return res.status(404).json({ error: 'Objectif not found' });
    res.json({ data: result });
  } catch (err) {
    const { status, message } = mapSqlError(err);
    res.status(status).json({ error: message });
  }
});

/**
 * @openapi
 * /api/objectifs/{id}/activate:
 *   post:
 *     summary: Activate Objectif
 *     tags: [Objectifs]
 */
export const activateObjectif = asyncHandler(async (req, res) => {
  const id = Number(req.params.id);
  try {
    const result = await objectifService.activateObjectif(id);
    if (!result) return res.status(404).json({ error: 'Objectif not found' });
    res.json({ data: result });
  } catch (err) {
    const { status, message } = mapSqlError(err);
    res.status(status).json({ error: message });
  }
});

/**
 * @openapi
 * /api/objectifs/{id}/deactivate:
 *   post:
 *     summary: Deactivate Objectif
 *     tags: [Objectifs]
 */
export const deactivateObjectif = asyncHandler(async (req, res) => {
  const id = Number(req.params.id);
  try {
    const result = await objectifService.deactivateObjectif(id);
    if (!result) return res.status(404).json({ error: 'Objectif not found' });
    res.json({ data: result });
  } catch (err) {
    const { status, message } = mapSqlError(err);
    res.status(status).json({ error: message });
  }
});
