// src/controllers/typeobjectif.controller.js

import { AppError, sendSuccess } from '../middlewares/responseHandler.js';
import * as typeObjectifService from '../services/typeobjectif.service.js';

/**
 * @openapi
 * tags:
 *   - name: TypeObjectifs
 *     description: TypeObjectif management operations
 */

/**
 * @openapi
 * /api/type-objectifs:
 *   post:
 *     summary: Create a new TypeObjectif
 *     tags: [TypeObjectifs]
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
 *                 example: "Objectif annuel"
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
export const createTypeObjectif = async (req, res, next) => {
  try {
    const { name } = req.body || {};
    const result = await typeObjectifService.createTypeObjectif(name);
    sendSuccess(res, result, 'TypeObjectif created successfully', 201);
  } catch (err) {
    next(new AppError(err.message, err.statusCode || 500));
  }
};

/**
 * @openapi
 * /api/type-objectifs/{id}:
 *   get:
 *     summary: Get active TypeObjectif by ID
 *     tags: [TypeObjectifs]
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
export const getTypeObjectifById = async (req, res, next) => {
  try {
    const id = Number(req.params.id);
    const row = await typeObjectifService.getActiveTypeObjectifById(id);
    
    if (!row) {
      return next(new AppError('TypeObjectif not found', 404));
    }
    
    sendSuccess(res, row, 'TypeObjectif retrieved successfully');
  } catch (err) {
    next(new AppError(err.message, 500));
  }
};

/**
 * @openapi
 * /api/type-objectifs:
 *   get:
 *     summary: List active TypeObjectifs
 *     tags: [TypeObjectifs]
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
export const listActiveTypeObjectifs = async (_req, res, next) => {
  try {
    const rows = await typeObjectifService.listActiveTypeObjectifs();
    sendSuccess(res, rows, 'Active TypeObjectifs retrieved successfully');
  } catch (err) {
    next(new AppError(err.message, 500));
  }
};

/**
 * @openapi
 * /api/type-objectifs/{id}:
 *   patch:
 *     summary: Update TypeObjectif
 *     tags: [TypeObjectifs]
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
export const updateTypeObjectif = async (req, res, next) => {
  try {
    const id = Number(req.params.id);
    const { name } = req.body || {};
    const result = await typeObjectifService.updateTypeObjectif(id, name);
    
    if (!result) {
      return next(new AppError('TypeObjectif not found', 404));
    }
    
    sendSuccess(res, result, 'TypeObjectif updated successfully');
  } catch (err) {
    next(new AppError(err.message, err.statusCode || 500));
  }
};

/**
 * @openapi
 * /api/type-objectifs/{id}/activate:
 *   post:
 *     summary: Activate TypeObjectif
 *     tags: [TypeObjectifs]
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
export const activateTypeObjectif = async (req, res, next) => {
  try {
    const id = Number(req.params.id);
    const result = await typeObjectifService.activateTypeObjectif(id);
    
    if (!result) {
      return next(new AppError('TypeObjectif not found', 404));
    }
    
    sendSuccess(res, result, 'TypeObjectif activated successfully');
  } catch (err) {
    next(new AppError(err.message, err.statusCode || 500));
  }
};

/**
 * @openapi
 * /api/type-objectifs/{id}/deactivate:
 *   post:
 *     summary: Deactivate TypeObjectif
 *     tags: [TypeObjectifs]
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
export const deactivateTypeObjectif = async (req, res, next) => {
  try {
    const id = Number(req.params.id);
    const result = await typeObjectifService.deactivateTypeObjectif(id);
    
    if (!result) {
      return next(new AppError('TypeObjectif not found', 404));
    }
    
    sendSuccess(res, result, 'TypeObjectif deactivated successfully');
  } catch (err) {
    next(new AppError(err.message, err.statusCode || 500));
  }
};
