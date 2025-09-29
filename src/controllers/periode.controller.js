// src/controllers/periode.controller.js

import { asyncHandler } from '../helpers/asyncHandler.js';
import { mapSqlError } from '../helpers/sqlErrorMapper.js';
import * as periodeService from '../services/periode.service.js';

/**
 * @openapi
 * tags:
 *   - name: Periodes
 *     description: Periode management operations
 */

/**
 * @openapi
 * /api/periodes:
 *   post:
 *     summary: Create a new Periode
 *     tags: [Periodes]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [year, month, week, startedDate, endDate]
 *             properties:
 *               year:
 *                 type: integer
 *                 example: 2025
 *               month:
 *                 type: integer
 *                 minimum: 1
 *                 maximum: 12
 *                 example: 9
 *               week:
 *                 type: integer
 *                 minimum: 0
 *                 example: 0
 *                 description: 0 = mensuel, >0 = hebdomadaire
 *               startedDate:
 *                 type: string
 *                 format: date
 *                 example: "2025-09-01"
 *               endDate:
 *                 type: string
 *                 format: date
 *                 example: "2025-09-30"
 *               typePeriodeId:
 *                 type: integer
 *                 nullable: true
 *                 example: 2
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
export const createPeriode = asyncHandler(async (req, res) => {
  const { year, month, week, startedDate, endDate, typePeriodeId = null } = req.body || {};
  try {
    const result = await periodeService.createPeriode({
      year: Number(year),
      month: Number(month),
      week: Number(week),
      startedDate,
      endDate,
      typePeriodeId: typePeriodeId != null ? Number(typePeriodeId) : null
    });
    res.status(201).json({ data: result });
  } catch (err) {
    const { status, message } = mapSqlError(err);
    res.status(status).json({ error: message });
  }
});

/**
 * @openapi
 * /api/periodes/{id}:
 *   get:
 *     summary: Get active Periode by ID
 *     tags: [Periodes]
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
 *       400:
 *         description: Validation error
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden
 *       404:
 *         description: Not found
 */
export const getPeriodeById = asyncHandler(async (req, res) => {
  const id = Number(req.params.id);
  const row = await periodeService.getActivePeriodeById(id);
  if (!row) return res.status(404).json({ error: 'Periode not found' });
  res.json({ data: row });
});

/**
 * @openapi
 * /api/periodes:
 *   get:
 *     summary: List active Periodes
 *     tags: [Periodes]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of active periodes
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden
 */
export const listActivePeriodes = asyncHandler(async (_req, res) => {
  const rows = await periodeService.listActivePeriodes();
  res.json({ data: rows });
});

/**
 * @openapi
 * /api/periodes/{id}:
 *   patch:
 *     summary: Update Periode
 *     tags: [Periodes]
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
 *             required: [year, month, week, startedDate, endDate]
 *             properties:
 *               year: { type: integer }
 *               month:
 *                 type: integer
 *                 minimum: 1
 *                 maximum: 12
 *               week:
 *                 type: integer
 *                 minimum: 0
 *                 description: 0 = mensuel, >0 = hebdomadaire
 *               startedDate:
 *                 type: string
 *                 format: date
 *               endDate:
 *                 type: string
 *                 format: date
 *               typePeriodeId:
 *                 type: integer
 *                 nullable: true
 *     responses:
 *       200:
 *         description: Updated
 *       400:
 *         description: Validation error
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden
 *       404:
 *         description: Not found
 */
export const updatePeriode = asyncHandler(async (req, res) => {
  const id = Number(req.params.id);
  const { year, month, week, startedDate, endDate, typePeriodeId = null } = req.body || {};
  try {
    const result = await periodeService.updatePeriode(id, {
      year: Number(year),
      month: Number(month),
      week: Number(week),
      startedDate,
      endDate,
      typePeriodeId: typePeriodeId != null ? Number(typePeriodeId) : null
    });
    if (!result) return res.status(404).json({ error: 'Periode not found' });
    res.json({ data: result });
  } catch (err) {
    const { status, message } = mapSqlError(err);
    res.status(status).json({ error: message });
  }
});

/**
 * @openapi
 * /api/periodes/{id}/activate:
 *   post:
 *     summary: Activate Periode
 *     tags: [Periodes]
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
 *       400:
 *         description: Validation error
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden
 *       404:
 *         description: Not found
 */
export const activatePeriode = asyncHandler(async (req, res) => {
  const id = Number(req.params.id);
  try {
    const result = await periodeService.activatePeriode(id);
    if (!result) return res.status(404).json({ error: 'Periode not found' });
    res.json({ data: result });
  } catch (err) {
    const { status, message } = mapSqlError(err);
    res.status(status).json({ error: message });
  }
});

/**
 * @openapi
 * /api/periodes/{id}/deactivate:
 *   post:
 *     summary: Deactivate Periode
 *     tags: [Periodes]
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
 *       400:
 *         description: Validation error
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden
 *       404:
 *         description: Not found
 */
export const deactivatePeriode = asyncHandler(async (req, res) => {
  const id = Number(req.params.id);
  try {
    const result = await periodeService.deactivatePeriode(id);
    if (!result) return res.status(404).json({ error: 'Periode not found' });
    res.json({ data: result });
  } catch (err) {
    const { status, message } = mapSqlError(err);
    res.status(status).json({ error: message });
  }
});

/**
 * @openapi
 * /api/periodes/by-type:
 *   get:
 *     summary: List active Periodes by TypePeriode selector
 *     description: Provide one of typePeriodeId or typePeriodeName, or exactly one of hebdomadaire/mensuel; optional year and month filters apply to the resolved type. 
 *     tags: [Periodes]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: typePeriodeId
 *         schema: { type: integer, nullable: true }
 *       - in: query
 *         name: typePeriodeName
 *         schema: { type: string, nullable: true }
 *       - in: query
 *         name: hebdomadaire
 *         schema: { type: boolean, nullable: true }
 *       - in: query
 *         name: mensuel
 *         schema: { type: boolean, nullable: true }
 *       - in: query
 *         name: year
 *         schema: { type: integer, nullable: true }
 *       - in: query
 *         name: month
 *         schema:
 *           type: integer
 *           minimum: 1
 *           maximum: 12
 *           nullable: true
 *     responses:
 *       200:
 *         description: List filtered by type
 *       400:
 *         description: Validation error
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden
 */
export const listPeriodesByType = asyncHandler(async (req, res) => {
  const {
    typePeriodeId = null,
    typePeriodeName = null,
    hebdomadaire = null,
    mensuel = null,
    year = null,
    month = null
  } = req.query || {};

  try {
    const rows = await periodeService.listPeriodesByType({
      typePeriodeId,
      typePeriodeName,
      hebdomadaire,
      mensuel,
      year,
      month
    });
    return res.json({ data: rows });
  } catch (err) {
    const { status, message } = mapSqlError(err);
    return res.status(status).json({ error: message });
  }
});

/**
 * @openapi
 * /api/periodes/years:
 *   get:
 *     summary: List active years that have periodes
 *     tags: [Periodes]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Distinct active years
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
 *                       year:
 *                         type: integer
 */
export const listPeriodeYears = asyncHandler(async (_req, res) => {
  const rows = await periodeService.listPeriodeYears();
  return res.json({ data: rows });
});

/**
 * @openapi
 * /api/periodes/years/{year}:
 *   get:
 *     summary: List active periodes for a given year
 *     tags: [Periodes]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: year
 *         required: true
 *         schema: { type: integer }
 *     responses:
 *       200:
 *         description: List for the specified year
 *       400:
 *         description: Validation error
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden
 */
export const listPeriodesByYear = asyncHandler(async (req, res) => {
  const year = Number(req.params.year);
  const rows = await periodeService.listPeriodesByYear(year);
  return res.json({ data: rows });
});
