// src/controllers/typeperiode.controller.js

import { asyncHandler } from '../helpers/asyncHandler.js';
import { mapSqlError } from '../helpers/sqlErrorMapper.js';
import * as typePeriodeService from '../services/typeperiode.service.js';

/**
 * @openapi
 * tags:
 *   - name: TypePeriodes
 *     description: TypePeriode management operations
 */

/**
 * @openapi
 * /api/type-periodes:
 *   post:
 *     summary: Create a new TypePeriode
 *     tags: [TypePeriodes]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [name, hebdomadaire, mensuel]
 *             properties:
 *               name: { type: string, example: "Hebdo" }
 *               hebdomadaire: { type: boolean, example: true }
 *               mensuel: { type: boolean, example: false }
 *     responses:
 *       201: { description: Created }
 *       400: { description: Validation error }
 */
export const createTypePeriode = asyncHandler(async (req, res) => {
  const { name, hebdomadaire, mensuel } = req.body || {};
  try {
    const result = await typePeriodeService.createTypePeriode(name, { hebdomadaire, mensuel });
    res.status(201).json({ data: result });
  } catch (err) {
    const { status, message } = mapSqlError(err);
    res.status(status).json({ error: message });
  }
});

/**
 * @openapi
 * /api/type-periodes/{id}:
 *   get:
 *     summary: Get active TypePeriode by ID
 *     tags: [TypePeriodes]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: integer }
 *     responses:
 *       200: { description: Found }
 *       404: { description: Not found }
 */
export const getTypePeriodeById = asyncHandler(async (req, res) => {
  const id = Number(req.params.id);
  const row = await typePeriodeService.getActiveTypePeriodeById(id);
  if (!row) return res.status(404).json({ error: 'TypePeriode not found' });
  res.json({ data: row });
});

/**
 * @openapi
 * /api/type-periodes:
 *   get:
 *     summary: List active TypePeriodes
 *     tags: [TypePeriodes]
 *     responses:
 *       200: { description: List }
 */
export const listActiveTypePeriodes = asyncHandler(async (_req, res) => {
  const rows = await typePeriodeService.listActiveTypePeriodes();
  res.json({ data: rows });
});

/**
 * @openapi
 * /api/type-periodes/{id}:
 *   patch:
 *     summary: Update TypePeriode
 *     tags: [TypePeriodes]
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
 *             required: [name, hebdomadaire, mensuel]
 *             properties:
 *               name: { type: string }
 *               hebdomadaire: { type: boolean }
 *               mensuel: { type: boolean }
 *     responses:
 *       200: { description: Updated }
 *       404: { description: Not found }
 */
export const updateTypePeriode = asyncHandler(async (req, res) => {
  const id = Number(req.params.id);
  const { name, hebdomadaire, mensuel } = req.body || {};
  try {
    const result = await typePeriodeService.updateTypePeriode(id, { name, hebdomadaire, mensuel });
    if (!result) return res.status(404).json({ error: 'TypePeriode not found' });
    res.json({ data: result });
  } catch (err) {
    const { status, message } = mapSqlError(err);
    res.status(status).json({ error: message });
  }
});

/**
 * @openapi
 * /api/type-periodes/{id}/activate:
 *   post:
 *     summary: Activate TypePeriode
 *     tags: [TypePeriodes]
 */
export const activateTypePeriode = asyncHandler(async (req, res) => {
  const id = Number(req.params.id);
  try {
    const result = await typePeriodeService.activateTypePeriode(id);
    if (!result) return res.status(404).json({ error: 'TypePeriode not found' });
    res.json({ data: result });
  } catch (err) {
    const { status, message } = mapSqlError(err);
    res.status(status).json({ error: message });
  }
});

/**
 * @openapi
 * /api/type-periodes/{id}/deactivate:
 *   post:
 *     summary: Deactivate TypePeriode
 *     tags: [TypePeriodes]
 */
export const deactivateTypePeriode = asyncHandler(async (req, res) => {
  const id = Number(req.params.id);
  try {
    const result = await typePeriodeService.deactivateTypePeriode(id);
    if (!result) return res.status(404).json({ error: 'TypePeriode not found' });
    res.json({ data: result });
  } catch (err) {
    const { status, message } = mapSqlError(err);
    res.status(status).json({ error: message });
  }
});
