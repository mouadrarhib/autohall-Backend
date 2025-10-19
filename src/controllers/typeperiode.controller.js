// src/controllers/typeperiode.controller.js

import { AppError, sendSuccess } from '../middlewares/responseHandler.js';
import * as typePeriodeService from '../services/typeperiode.service.js';

/**
 * @openapi
 * tags:
 *   - name: TypePeriode
 *     description: TypePeriode management operations
 */

/**
 * @openapi
 * /api/type-periode:
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
export const createTypePeriode = async (req, res, next) => {
  try {
    const { name, hebdomadaire, mensuel } = req.body || {};
    const result = await typePeriodeService.createTypePeriode(name, { hebdomadaire, mensuel });
    sendSuccess(res, result, 'TypePeriode created successfully', 201);
  } catch (err) {
    next(new AppError(err.message, err.statusCode || 500));
  }
};

/**
 * @openapi
 * /api/type-periode/{id}:
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
export const getTypePeriodeById = async (req, res, next) => {
  try {
    const id = Number(req.params.id);
    const row = await typePeriodeService.getActiveTypePeriodeById(id);
    
    if (!row) {
      return next(new AppError('TypePeriode not found', 404));
    }
    
    sendSuccess(res, row, 'TypePeriode retrieved successfully');
  } catch (err) {
    next(new AppError(err.message, 500));
  }
};

/**
 * @openapi
 * /api/type-periode:
 *   get:
 *     summary: List active TypePeriodes
 *     tags: [TypePeriodes]
 *     responses:
 *       200: { description: List }
 */
export const listActiveTypePeriodes = async (_req, res, next) => {
  try {
    const rows = await typePeriodeService.listActiveTypePeriodes();
    sendSuccess(res, rows, 'Active TypePeriodes retrieved successfully');
  } catch (err) {
    next(new AppError(err.message, 500));
  }
};

/**
 * @openapi
 * /api/type-periode/{id}:
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
export const updateTypePeriode = async (req, res, next) => {
  try {
    const id = Number(req.params.id);
    const { name, hebdomadaire, mensuel } = req.body || {};
    const result = await typePeriodeService.updateTypePeriode(id, { name, hebdomadaire, mensuel });
    
    if (!result) {
      return next(new AppError('TypePeriode not found', 404));
    }
    
    sendSuccess(res, result, 'TypePeriode updated successfully');
  } catch (err) {
    next(new AppError(err.message, err.statusCode || 500));
  }
};

/**
 * @openapi
 * /api/type-periode/{id}/activate:
 *   post:
 *     summary: Activate TypePeriode
 *     tags: [TypePeriodes]
 */
export const activateTypePeriode = async (req, res, next) => {
  try {
    const id = Number(req.params.id);
    const result = await typePeriodeService.activateTypePeriode(id);
    
    if (!result) {
      return next(new AppError('TypePeriode not found', 404));
    }
    
    sendSuccess(res, result, 'TypePeriode activated successfully');
  } catch (err) {
    next(new AppError(err.message, err.statusCode || 500));
  }
};

/**
 * @openapi
 * /api/type-periode/{id}/deactivate:
 *   post:
 *     summary: Deactivate TypePeriode
 *     tags: [TypePeriodes]
 */
export const deactivateTypePeriode = async (req, res, next) => {
  try {
    const id = Number(req.params.id);
    const result = await typePeriodeService.deactivateTypePeriode(id);
    
    if (!result) {
      return next(new AppError('TypePeriode not found', 404));
    }
    
    sendSuccess(res, result, 'TypePeriode deactivated successfully');
  } catch (err) {
    next(new AppError(err.message, err.statusCode || 500));
  }
};
