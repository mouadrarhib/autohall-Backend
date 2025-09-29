// src/controllers/version.controller.js

import { asyncHandler } from '../helpers/asyncHandler.js';
import { mapSqlError } from '../helpers/sqlErrorMapper.js';
import { parseBoolean } from '../helpers/queryHelpers.js';
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
 *     summary: Create a new version
 *     tags: [Versions]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - name
 *               - idModele
 *             properties:
 *               name:
 *                 type: string
 *                 example: "1.5 DCI Tech"
 *               idModele:
 *                 type: integer
 *                 example: 12
 *               active:
 *                 type: boolean
 *                 default: true
 *     responses:
 *       201:
 *         description: Version created successfully
 *       400:
 *         description: Validation error or Modele inactive
 *       404:
 *         description: Modele not found
 */
export const createVersion = asyncHandler(async (req, res) => {
  const { name, idModele, active = true } = req.body || {};

  try {
    const result = await versionService.createVersion(name, idModele, active);
    res.locals.objectId = result.id; // for audit
    res.status(201).json({ data: result });
  } catch (err) {
    const { status, message } = mapSqlError(err);
    res.status(status).json({ error: message });
  }
});

/**
 * @openapi
 * /api/versions/{id}:
 *   get:
 *     summary: Get version by ID
 *     tags: [Versions]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Version found
 *       404:
 *         description: Version not found
 */
export const getVersionById = asyncHandler(async (req, res) => {
  const id = Number(req.params.id);
  const version = await versionService.getVersionById(id);
  
  if (!version) {
    return res.status(404).json({ error: 'Version not found' });
  }
  
  res.json({ data: version });
});

/**
 * @openapi
 * /api/versions:
 *   get:
 *     summary: List versions
 *     tags: [Versions]
 *     parameters:
 *       - in: query
 *         name: idModele
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
 *         description: List of versions
 */
export const listVersions = asyncHandler(async (req, res) => {
  const { idModele } = req.query;
  const onlyActive = parseBoolean(req.query.onlyActive) !== 0; // Default to true
  
  const versions = await versionService.listVersions(idModele, onlyActive);
  res.json({ data: versions });
});

/**
 * @openapi
 * /api/versions/by-modele/{idModele}:
 *   get:
 *     summary: List versions by modele
 *     tags: [Versions]
 *     parameters:
 *       - in: path
 *         name: idModele
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
 *         description: List of versions for the modele
 */
export const listVersionsByModele = asyncHandler(async (req, res) => {
  const idModele = Number(req.params.idModele);
  const onlyActive = parseBoolean(req.query.onlyActive) !== 0; // Default to true
  
  const versions = await versionService.listVersionsByModele(idModele, onlyActive);
  res.json({ data: versions });
});

/**
 * @openapi
 * /api/versions/search:
 *   get:
 *     summary: Search versions
 *     tags: [Versions]
 *     parameters:
 *       - in: query
 *         name: q
 *         required: true
 *         schema:
 *           type: string
 *         description: Search term
 *       - in: query
 *         name: idModele
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
 *         description: Search results
 *       400:
 *         description: Invalid search query
 */
export const searchVersions = asyncHandler(async (req, res) => {
  const { q, idModele } = req.query;
  const onlyActive = parseBoolean(req.query.onlyActive) !== 0; // Default to true
  
  const results = await versionService.searchVersions(q, idModele, onlyActive);
  res.json({ data: results });
});

/**
 * @openapi
 * /api/versions/{id}:
 *   patch:
 *     summary: Update version
 *     tags: [Versions]
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
 *               idModele:
 *                 type: integer
 *               active:
 *                 type: boolean
 *     responses:
 *       200:
 *         description: Version updated
 *       404:
 *         description: Version not found
 */
export const updateVersion = asyncHandler(async (req, res) => {
  const id = Number(req.params.id);
  const { name = null, idModele = null, active = null } = req.body || {};

  try {
    const result = await versionService.updateVersion(id, name, idModele, active);
    
    if (!result) {
      return res.status(404).json({ error: 'Version not found' });
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
 * /api/versions/{id}/activate:
 *   post:
 *     summary: Activate version
 *     tags: [Versions]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Version activated
 *       404:
 *         description: Version not found
 */
export const activateVersion = asyncHandler(async (req, res) => {
  const id = Number(req.params.id);

  try {
    const result = await versionService.activateVersion(id);
    
    if (!result) {
      return res.status(404).json({ error: 'Version not found' });
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
 * /api/versions/{id}/deactivate:
 *   post:
 *     summary: Deactivate version
 *     tags: [Versions]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Version deactivated
 *       404:
 *         description: Version not found
 */
export const deactivateVersion = asyncHandler(async (req, res) => {
  const id = Number(req.params.id);

  try {
    const result = await versionService.deactivateVersion(id);
    
    if (!result) {
      return res.status(404).json({ error: 'Version not found' });
    }
    
    res.locals.objectId = id; // for audit
    res.json({ data: result });
  } catch (err) {
    const { status, message } = mapSqlError(err);
    res.status(status).json({ error: message });
  }
});
