// src/controllers/appparameter.controller.js

import { asyncHandler } from '../helpers/asyncHandler.js';
import { mapSqlError } from '../helpers/sqlErrorMapper.js';
import { parseBoolean } from '../helpers/queryHelpers.js';
import * as appparameterService from '../services/appparameter.service.js';

/**
 * @openapi
 * tags:
 *   - name: AppParameters
 *     description: Application parameters management
 */

/**
 * @openapi
 * /api/app-parameters:
 *   post:
 *     summary: Create a new app parameter
 *     tags: [AppParameters]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - key
 *             properties:
 *               key:
 *                 type: string
 *                 example: "SITE_THEME"
 *               value:
 *                 type: string
 *                 example: "dark"
 *               description:
 *                 type: string
 *                 example: "Theme for UI"
 *               type:
 *                 type: string
 *                 example: "string"
 *               scope:
 *                 type: string
 *                 example: "ui"
 *               active:
 *                 type: boolean
 *                 default: true
 *     responses:
 *       201:
 *         description: App parameter created successfully
 *       400:
 *         description: Validation error
 *       409:
 *         description: Duplicate key
 */
export const createAppParameter = asyncHandler(async (req, res) => {
  const { key, value = null, description = null, type = null, scope = null, active = true } = req.body || {};

  try {
    const result = await appparameterService.createAppParameter(key, value, description, type, scope, active);
    res.locals.objectId = result.id; // for audit
    res.status(201).json({ data: result });
  } catch (err) {
    const { status, message } = mapSqlError(err);
    res.status(status).json({ error: message });
  }
});

/**
 * @openapi
 * /api/app-parameters/{id}:
 *   get:
 *     summary: Get app parameter by ID
 *     tags: [AppParameters]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: App parameter found
 *       404:
 *         description: App parameter not found
 */
export const getAppParameterById = asyncHandler(async (req, res) => {
  const id = Number(req.params.id);
  const appparameter = await appparameterService.getAppParameterById(id);
  
  if (!appparameter) {
    return res.status(404).json({ error: 'AppParameter not found' });
  }
  
  res.json({ data: appparameter });
});

/**
 * @openapi
 * /api/app-parameters/by-key/{key}:
 *   get:
 *     summary: Get app parameter by key
 *     tags: [AppParameters]
 *     parameters:
 *       - in: path
 *         name: key
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: App parameter found
 *       404:
 *         description: App parameter not found
 */
export const getAppParameterByKey = asyncHandler(async (req, res) => {
  const key = req.params.key;
  const appparameter = await appparameterService.getAppParameterByKey(key);
  
  if (!appparameter) {
    return res.status(404).json({ error: 'AppParameter not found' });
  }
  
  res.json({ data: appparameter });
});

/**
 * @openapi
 * /api/app-parameters:
 *   get:
 *     summary: List app parameters with pagination
 *     tags: [AppParameters]
 *     parameters:
 *       - in: query
 *         name: type
 *         schema:
 *           type: string
 *           nullable: true
 *       - in: query
 *         name: scope
 *         schema:
 *           type: string
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
 *         description: Paginated list of app parameters
 */
export const listAppParameters = asyncHandler(async (req, res) => {
  const { type, scope } = req.query;
  const onlyActive = parseBoolean(req.query.onlyActive) !== 0; // Default to true
  const page = Number(req.query.page || 1);
  const pageSize = Number(req.query.pageSize || 10);
  
  const result = await appparameterService.listAppParameters(type, scope, onlyActive, page, pageSize);
  res.json(result);
});

/**
 * @openapi
 * /api/app-parameters/search:
 *   get:
 *     summary: Search app parameters with pagination
 *     tags: [AppParameters]
 *     parameters:
 *       - in: query
 *         name: q
 *         required: true
 *         schema:
 *           type: string
 *         description: Search term
 *       - in: query
 *         name: type
 *         schema:
 *           type: string
 *           nullable: true
 *       - in: query
 *         name: scope
 *         schema:
 *           type: string
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
 */
export const searchAppParameters = asyncHandler(async (req, res) => {
  const { q, type, scope } = req.query;
  const onlyActive = parseBoolean(req.query.onlyActive) !== 0; // Default to true
  const page = Number(req.query.page || 1);
  const pageSize = Number(req.query.pageSize || 10);
  
  const result = await appparameterService.searchAppParameters(q, type, scope, onlyActive, page, pageSize);
  res.json(result);
});

/**
 * @openapi
 * /api/app-parameters/set:
 *   put:
 *     summary: Upsert app parameter by key
 *     tags: [AppParameters]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - key
 *               - value
 *             properties:
 *               key:
 *                 type: string
 *               value:
 *                 type: string
 *               description:
 *                 type: string
 *                 nullable: true
 *               type:
 *                 type: string
 *                 nullable: true
 *               scope:
 *                 type: string
 *                 nullable: true
 *               active:
 *                 type: boolean
 *                 default: true
 *     responses:
 *       200:
 *         description: Parameter upserted successfully
 */
export const setAppParameter = asyncHandler(async (req, res) => {
  const { key, value, description = null, type = null, scope = null, active = true } = req.body || {};

  try {
    const result = await appparameterService.setAppParameter(key, value, description, type, scope, active);
    res.locals.objectId = result.id; // for audit
    res.json({ data: result });
  } catch (err) {
    const { status, message } = mapSqlError(err);
    res.status(status).json({ error: message });
  }
});

/**
 * @openapi
 * /api/app-parameters/{id}:
 *   patch:
 *     summary: Update app parameter by ID
 *     tags: [AppParameters]
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
 *               value:
 *                 type: string
 *                 nullable: true
 *               description:
 *                 type: string
 *                 nullable: true
 *               type:
 *                 type: string
 *                 nullable: true
 *               scope:
 *                 type: string
 *                 nullable: true
 *               active:
 *                 type: boolean
 *                 nullable: true
 *     responses:
 *       200:
 *         description: App parameter updated
 *       404:
 *         description: App parameter not found
 */
export const updateAppParameterById = asyncHandler(async (req, res) => {
  const id = Number(req.params.id);
  const updates = req.body || {};

  try {
    const result = await appparameterService.updateAppParameterById(id, updates);
    
    if (!result) {
      return res.status(404).json({ error: 'AppParameter not found' });
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
 * /api/app-parameters/by-key/{key}:
 *   patch:
 *     summary: Update app parameter by key
 *     tags: [AppParameters]
 *     parameters:
 *       - in: path
 *         name: key
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               value:
 *                 type: string
 *                 nullable: true
 *               description:
 *                 type: string
 *                 nullable: true
 *               type:
 *                 type: string
 *                 nullable: true
 *               scope:
 *                 type: string
 *                 nullable: true
 *               active:
 *                 type: boolean
 *                 nullable: true
 *     responses:
 *       200:
 *         description: App parameter updated
 *       404:
 *         description: App parameter not found
 */
export const updateAppParameterByKey = asyncHandler(async (req, res) => {
  const key = req.params.key;
  const updates = req.body || {};

  try {
    const result = await appparameterService.updateAppParameterByKey(key, updates);
    
    if (!result) {
      return res.status(404).json({ error: 'AppParameter not found' });
    }
    
    res.locals.objectId = result.id; // for audit
    res.json({ data: result });
  } catch (err) {
    const { status, message } = mapSqlError(err);
    res.status(status).json({ error: message });
  }
});

/**
 * @openapi
 * /api/app-parameters/{id}/activate:
 *   post:
 *     summary: Activate app parameter
 *     tags: [AppParameters]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: App parameter activated
 *       404:
 *         description: App parameter not found
 */
export const activateAppParameter = asyncHandler(async (req, res) => {
  const id = Number(req.params.id);

  try {
    const result = await appparameterService.activateAppParameter(id);
    
    if (!result) {
      return res.status(404).json({ error: 'AppParameter not found' });
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
 * /api/app-parameters/{id}/deactivate:
 *   post:
 *     summary: Deactivate app parameter
 *     tags: [AppParameters]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: App parameter deactivated
 *       404:
 *         description: App parameter not found
 */
export const deactivateAppParameter = asyncHandler(async (req, res) => {
  const id = Number(req.params.id);

  try {
    const result = await appparameterService.deactivateAppParameter(id);
    
    if (!result) {
      return res.status(404).json({ error: 'AppParameter not found' });
    }
    
    res.locals.objectId = id; // for audit
    res.json({ data: result });
  } catch (err) {
    const { status, message } = mapSqlError(err);
    res.status(status).json({ error: message });
  }
});