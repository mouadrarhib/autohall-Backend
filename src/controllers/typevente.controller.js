// src/controllers/typevente.controller.js

import { AppError, sendSuccess } from '../middlewares/responseHandler.js';
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
export const createTypeVente = async (req, res, next) => {
  try {
    const { name } = req.body || {};
    const result = await typeVenteService.createTypeVente(name);
    sendSuccess(res, result, 'TypeVente created successfully', 201);
  } catch (err) {
    next(new AppError(err.message, err.statusCode || 500));
  }
};

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
export const getTypeVenteById = async (req, res, next) => {
  try {
    const id = Number(req.params.id);
    const row = await typeVenteService.getActiveTypeVenteById(id);
    
    if (!row) {
      return next(new AppError('TypeVente not found', 404));
    }
    
    sendSuccess(res, row, 'TypeVente retrieved successfully');
  } catch (err) {
    next(new AppError(err.message, 500));
  }
};

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
export const listActiveTypeVentes = async (_req, res, next) => {
  try {
    const rows = await typeVenteService.listActiveTypeVentes();
    sendSuccess(res, rows, 'Active TypeVentes retrieved successfully');
  } catch (err) {
    next(new AppError(err.message, 500));
  }
};

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
export const updateTypeVente = async (req, res, next) => {
  try {
    const id = Number(req.params.id);
    const { name } = req.body || {};
    const result = await typeVenteService.updateTypeVente(id, name);
    
    if (!result) {
      return next(new AppError('TypeVente not found', 404));
    }
    
    sendSuccess(res, result, 'TypeVente updated successfully');
  } catch (err) {
    next(new AppError(err.message, err.statusCode || 500));
  }
};

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
export const activateTypeVente = async (req, res, next) => {
  try {
    const id = Number(req.params.id);
    const result = await typeVenteService.activateTypeVente(id);
    
    if (!result) {
      return next(new AppError('TypeVente not found', 404));
    }
    
    sendSuccess(res, result, 'TypeVente activated successfully');
  } catch (err) {
    next(new AppError(err.message, err.statusCode || 500));
  }
};

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
export const deactivateTypeVente = async (req, res, next) => {
  try {
    const id = Number(req.params.id);
    const result = await typeVenteService.deactivateTypeVente(id);
    
    if (!result) {
      return next(new AppError('TypeVente not found', 404));
    }
    
    sendSuccess(res, result, 'TypeVente deactivated successfully');
  } catch (err) {
    next(new AppError(err.message, err.statusCode || 500));
  }
};
