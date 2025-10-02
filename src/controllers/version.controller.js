// src/controllers/version.controller.js

import { asyncHandler } from '../helpers/asyncHandler.js';
import { mapSqlError } from '../helpers/sqlErrorMapper.js';
import * as versionService from '../services/version.service.js';

/**
 * @openapi
 * tags:
 *   - name: Versions
 *     description: Version management operations
 */

/**
 * @openapi
 * /api/versions:
 *   post:
 *     summary: Create a new Version
 *     tags: [Versions]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [name, idModele, volume, price, tm, margin]
 *             properties:
 *               name:
 *                 type: string
 *                 maxLength: 100
 *                 example: "Version X"
 *               idModele:
 *                 type: integer
 *                 example: 1
 *               volume:
 *                 type: integer
 *                 minimum: 1
 *                 example: 100
 *               price:
 *                 type: number
 *                 format: decimal
 *                 example: 25000.00
 *               tm:
 *                 type: number
 *                 format: decimal
 *                 maximum: 0.40
 *                 example: 0.15
 *               margin:
 *                 type: number
 *                 format: decimal
 *                 maximum: 0.40
 *                 example: 0.20
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
export const createVersion = asyncHandler(async (req, res) => {
  try {
    const result = await versionService.createVersion(req.body);
    res.status(201).json({ data: result });
  } catch (err) {
    const { status, message } = mapSqlError(err);
    res.status(status).json({ error: message });
  }
});

/**
 * @openapi
 * /api/versions/{id}:
 *   patch:
 *     summary: Update Version
 *     tags: [Versions]
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
 *             required: [name, idModele, volume, price, tm, margin]
 *             properties:
 *               name:
 *                 type: string
 *                 maxLength: 100
 *               idModele:
 *                 type: integer
 *               volume:
 *                 type: integer
 *                 minimum: 1
 *               price:
 *                 type: number
 *                 format: decimal
 *               tm:
 *                 type: number
 *                 format: decimal
 *                 maximum: 0.40
 *               margin:
 *                 type: number
 *                 format: decimal
 *                 maximum: 0.40
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
export const updateVersion = asyncHandler(async (req, res) => {
  const id = Number(req.params.id);
  try {
    const result = await versionService.updateVersion(id, req.body);
    if (!result) return res.status(404).json({ error: 'Version not found' });
    res.json({ data: result });
  } catch (err) {
    const { status, message } = mapSqlError(err);
    res.status(status).json({ error: message });
  }
});

/**
 * @openapi
 * /api/versions/{id}:
 *   get:
 *     summary: Get Version by ID
 *     tags: [Versions]
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
export const getVersionById = asyncHandler(async (req, res) => {
  const id = Number(req.params.id);
  const row = await versionService.getVersionById(id);
  if (!row) return res.status(404).json({ error: 'Version not found' });
  res.json({ data: row });
});

/**
 * @openapi
 * /api/versions:
 *   get:
 *     summary: List Versions with optional filters and pagination
 *     tags: [Versions]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: idModele
 *         schema: { type: integer }
 *         description: Filter by modele ID
 *       - in: query
 *         name: onlyActive
 *         schema: { type: boolean, default: true }
 *         description: Show only active versions
 *       - in: query
 *         name: page
 *         schema: { type: integer, default: 1 }
 *         description: Page number
 *       - in: query
 *         name: pageSize
 *         schema: { type: integer, default: 10 }
 *         description: Number of records per page
 *     responses:
 *       200:
 *         description: Paginated list
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
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden
 */
export const listVersions = asyncHandler(async (req, res) => {
  const { idModele, onlyActive } = req.query;
  
  // Parse pagination parameters
  const page = Number(req.query.page || 1);
  const pageSize = Number(req.query.pageSize || 10);
  
  // Call service with pagination
  const result = await versionService.listVersions(
    idModele, 
    onlyActive !== 'false', 
    page, 
    pageSize
  );
  
  res.json(result);
});

/**
 * @openapi
 * /api/versions/by-modele:
 *   get:
 *     summary: List Versions by Modele with pagination
 *     tags: [Versions]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: idModele
 *         required: true
 *         schema: { type: integer }
 *       - in: query
 *         name: onlyActive
 *         schema: { type: boolean, default: true }
 *       - in: query
 *         name: page
 *         schema: { type: integer, default: 1 }
 *         description: Page number
 *       - in: query
 *         name: pageSize
 *         schema: { type: integer, default: 10 }
 *         description: Number of records per page
 *     responses:
 *       200:
 *         description: Paginated list
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden
 */
export const listVersionsByModele = asyncHandler(async (req, res) => {
  const { idModele, onlyActive } = req.query;
  
  // Parse pagination parameters
  const page = Number(req.query.page || 1);
  const pageSize = Number(req.query.pageSize || 10);
  
  // Call service with pagination
  const result = await versionService.listVersionsByModele(
    idModele, 
    onlyActive !== 'false', 
    page, 
    pageSize
  );
  
  res.json(result);
});

/**
 * @openapi
 * /api/versions/search:
 *   get:
 *     summary: Search Versions
 *     tags: [Versions]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: q
 *         schema: { type: string }
 *         description: Search query
 *       - in: query
 *         name: idModele
 *         schema: { type: integer }
 *         description: Filter by modele ID
 *       - in: query
 *         name: onlyActive
 *         schema: { type: boolean, default: true }
 *     responses:
 *       200:
 *         description: Search results
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden
 */
export const searchVersions = asyncHandler(async (req, res) => {
  const { q, idModele, onlyActive } = req.query;
  const rows = await versionService.searchVersions(q || '', idModele, onlyActive !== 'false');
  res.json({ data: rows });
});

/**
 * @openapi
 * /api/versions/{id}/activate:
 *   post:
 *     summary: Activate Version
 *     tags: [Versions]
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
export const activateVersion = asyncHandler(async (req, res) => {
  const id = Number(req.params.id);
  try {
    const result = await versionService.activateVersion(id);
    if (!result) return res.status(404).json({ error: 'Version not found' });
    res.json({ data: result });
  } catch (err) {
    const { status, message } = mapSqlError(err);
    res.status(status).json({ error: message });
  }
});

/**
 * @openapi
 * /api/versions/{id}/deactivate:
 *   post:
 *     summary: Deactivate Version
 *     tags: [Versions]
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
export const deactivateVersion = asyncHandler(async (req, res) => {
  const id = Number(req.params.id);
  try {
    const result = await versionService.deactivateVersion(id);
    if (!result) return res.status(404).json({ error: 'Version not found' });
    res.json({ data: result });
  } catch (err) {
    const { status, message } = mapSqlError(err);
    res.status(status).json({ error: message });
  }
});
