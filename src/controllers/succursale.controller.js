// src/controllers/succursale.controller.js

import { AppError, sendSuccess } from '../middlewares/responseHandler.js';
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
export const createSuccursale = async (req, res, next) => {
  try {
    const { name, active = true } = req.body || {};
    const result = await succursaleService.createSuccursale(name, active);
    res.locals.objectId = result.id; // for audit
    sendSuccess(res, result, 'Succursale created successfully', 201);
  } catch (err) {
    next(new AppError(err.message, err.statusCode || 500));
  }
};

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
export const getSuccursaleById = async (req, res, next) => {
  try {
    const id = Number(req.params.id);
    const succursale = await succursaleService.getSuccursaleById(id);
    
    if (!succursale) {
      return next(new AppError('Succursale not found', 404));
    }
    
    sendSuccess(res, succursale, 'Succursale retrieved successfully');
  } catch (err) {
    next(new AppError(err.message, 500));
  }
};

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
export const listSuccursales = async (req, res, next) => {
  try {
    const onlyActive = parseBoolean(req.query.onlyActive) !== 0; // Default to true
    const page = Number(req.query.page || 1);
    const pageSize = Number(req.query.pageSize || 10);
    const result = await succursaleService.listSuccursales(onlyActive, page, pageSize);
    sendSuccess(res, result, 'Succursales list retrieved successfully');
  } catch (err) {
    next(new AppError(err.message, 500));
  }
};

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
export const searchSuccursales = async (req, res, next) => {
  try {
    const { q } = req.query;
    const onlyActive = parseBoolean(req.query.onlyActive) !== 0; // Default to true
    const results = await succursaleService.searchSuccursales(q, onlyActive);
    sendSuccess(res, results, 'Search completed successfully');
  } catch (err) {
    next(new AppError(err.message, 500));
  }
};

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
export const updateSuccursale = async (req, res, next) => {
  try {
    const id = Number(req.params.id);
    const { name = null, active = null } = req.body || {};
    const result = await succursaleService.updateSuccursale(id, name, active);
    
    if (!result) {
      return next(new AppError('Succursale not found', 404));
    }
    
    res.locals.objectId = id; // for audit
    sendSuccess(res, result, 'Succursale updated successfully');
  } catch (err) {
    next(new AppError(err.message, err.statusCode || 500));
  }
};

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
export const activateSuccursale = async (req, res, next) => {
  try {
    const id = Number(req.params.id);
    const result = await succursaleService.activateSuccursale(id);
    
    if (!result) {
      return next(new AppError('Succursale not found', 404));
    }
    
    res.locals.objectId = id; // for audit
    sendSuccess(res, result, 'Succursale activated successfully');
  } catch (err) {
    next(new AppError(err.message, err.statusCode || 500));
  }
};

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
export const deactivateSuccursale = async (req, res, next) => {
  try {
    const id = Number(req.params.id);
    const result = await succursaleService.deactivateSuccursale(id);
    
    if (!result) {
      return next(new AppError('Succursale not found', 404));
    }
    
    res.locals.objectId = id; // for audit
    sendSuccess(res, result, 'Succursale deactivated successfully');
  } catch (err) {
    next(new AppError(err.message, err.statusCode || 500));
  }
};
