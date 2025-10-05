// src/controllers/filiale.controller.js

import { AppError, sendSuccess } from '../middlewares/responseHandler.js';
import * as filialeService from '../services/filiale.service.js';

/**
 * @openapi
 * tags:
 *   - name: Filiales
 *     description: Filiale management operations
 */

/**
 * @openapi
 * /api/filiales:
 *   post:
 *     summary: Create a new filiale
 *     tags: [Filiales]
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
 *                 example: "Casablanca"
 *               active:
 *                 type: boolean
 *                 default: true
 *     responses:
 *       201:
 *         description: Filiale created successfully
 *       400:
 *         description: Validation error
 *       409:
 *         description: Filiale name already exists
 */
export const createFiliale = async (req, res, next) => {
  try {
    const { name, active = true } = req.body || {};
    const result = await filialeService.createFiliale(name, active);
    sendSuccess(res, result, 'Filiale created successfully', 201);
  } catch (err) {
    next(new AppError(err.message, err.statusCode || 500));
  }
};

/**
 * @openapi
 * /api/filiales/{id}:
 *   get:
 *     summary: Get filiale by ID
 *     tags: [Filiales]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Filiale found
 *       404:
 *         description: Filiale not found
 */
export const getFilialeById = async (req, res, next) => {
  try {
    const id = Number(req.params.id);
    const filiale = await filialeService.getFilialeById(id);
    
    if (!filiale) {
      return next(new AppError('Filiale not found', 404));
    }
    
    sendSuccess(res, filiale, 'Filiale retrieved successfully');
  } catch (err) {
    next(new AppError(err.message, 500));
  }
};

/**
 * @openapi
 * /api/filiales:
 *   get:
 *     summary: List all filiales with pagination
 *     tags: [Filiales]
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *         description: Page number
 *       - in: query
 *         name: pageSize
 *         schema:
 *           type: integer
 *           default: 10
 *         description: Number of records per page
 *     responses:
 *       200:
 *         description: Paginated list of filiales
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
 */
export const listFiliales = async (req, res, next) => {
  try {
    const page = Number(req.query.page || 1);
    const pageSize = Number(req.query.pageSize || 10);
    const result = await filialeService.listFiliales(page, pageSize);
    sendSuccess(res, result, 'Filiales list retrieved successfully');
  } catch (err) {
    next(new AppError(err.message, 500));
  }
};

/**
 * @openapi
 * /api/filiales/{id}:
 *   patch:
 *     summary: Update filiale
 *     tags: [Filiales]
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
 *         description: Filiale updated
 *       404:
 *         description: Filiale not found
 *       409:
 *         description: Filiale name already exists
 */
export const updateFiliale = async (req, res, next) => {
  try {
    const id = Number(req.params.id);
    const { name = null, active = null } = req.body || {};
    const result = await filialeService.updateFiliale(id, name, active);
    
    if (!result) {
      return next(new AppError('Filiale not found', 404));
    }
    
    sendSuccess(res, result, 'Filiale updated successfully');
  } catch (err) {
    next(new AppError(err.message, err.statusCode || 500));
  }
};

/**
 * @openapi
 * /api/filiales/{id}/activate:
 *   post:
 *     summary: Activate filiale
 *     tags: [Filiales]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Filiale activated
 *       404:
 *         description: Filiale not found
 */
export const activateFiliale = async (req, res, next) => {
  try {
    const id = Number(req.params.id);
    const result = await filialeService.activateFiliale(id);
    
    if (!result) {
      return next(new AppError('Filiale not found', 404));
    }
    
    sendSuccess(res, result, 'Filiale activated successfully');
  } catch (err) {
    next(new AppError(err.message, err.statusCode || 500));
  }
};

/**
 * @openapi
 * /api/filiales/{id}/deactivate:
 *   post:
 *     summary: Deactivate filiale
 *     tags: [Filiales]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Filiale deactivated
 *       404:
 *         description: Filiale not found
 */
export const deactivateFiliale = async (req, res, next) => {
  try {
    const id = Number(req.params.id);
    const result = await filialeService.deactivateFiliale(id);
    
    if (!result) {
      return next(new AppError('Filiale not found', 404));
    }
    
    sendSuccess(res, result, 'Filiale deactivated successfully');
  } catch (err) {
    next(new AppError(err.message, err.statusCode || 500));
  }
};
