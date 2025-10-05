// src/controllers/objectif.controller.js

import { AppError, sendSuccess } from '../middlewares/responseHandler.js';
import * as objectifService from '../services/objectif.service.js';

/**
 * @openapi
 * tags:
 *   - name: Objectifs
 *     description: Objectif management operations
 */

/**
 * @openapi
 * /api/objectifs:
 *   post:
 *     summary: Create a new Objectif
 *     tags: [Objectifs]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [userId, groupementId, siteId, periodeId, typeVenteId, typeObjectifId, volume, SalePrice, TMDirect, MargeInterGroupe]
 *             properties:
 *               userId: { type: integer }
 *               groupementId: { type: integer }
 *               siteId: { type: integer }
 *               periodeId: { type: integer }
 *               typeVenteId: { type: integer }
 *               typeObjectifId: { type: integer }
 *               marqueId: { type: integer, nullable: true }
 *               modeleId: { type: integer, nullable: true }
 *               versionId: { type: integer, nullable: true }
 *               volume: { type: integer }
 *               SalePrice: { type: number, format: decimal }
 *               TMDirect: { type: number, format: decimal, maximum: 0.40 }
 *               MargeInterGroupe: { type: number, format: decimal, maximum: 0.40 }
 *     responses:
 *       201: { description: Created }
 *       400: { description: Validation error }
 */
export const createObjectif = async (req, res, next) => {
  try {
    const result = await objectifService.createObjectif(req.body);
    sendSuccess(res, result, 'Objectif created successfully', 201);
  } catch (err) {
    next(new AppError(err.message, err.statusCode || 500));
  }
};

/**
 * @openapi
 * /api/objectifs/{id}:
 *   get:
 *     summary: Get active Objectif by ID
 *     tags: [Objectifs]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: integer }
 *     responses:
 *       200: { description: Found }
 *       404: { description: Not found }
 */
export const getObjectifById = async (req, res, next) => {
  try {
    const id = Number(req.params.id);
    const row = await objectifService.getActiveObjectifById(id);
    
    if (!row) {
      return next(new AppError('Objectif not found', 404));
    }
    
    sendSuccess(res, row, 'Objectif retrieved successfully');
  } catch (err) {
    next(new AppError(err.message, 500));
  }
};

/**
 * @openapi
 * /api/objectifs:
 *   get:
 *     summary: List active Objectifs with optional filters and pagination
 *     tags: [Objectifs]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: userId
 *         schema: { type: integer }
 *       - in: query
 *         name: periodeId
 *         schema: { type: integer }
 *       - in: query
 *         name: groupementId
 *         schema: { type: integer }
 *       - in: query
 *         name: siteId
 *         schema: { type: integer }
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
 *         description: Paginated list of objectifs
 */
export const listActiveObjectifs = async (req, res, next) => {
  try {
    const filters = {
      userId: req.query.userId,
      periodeId: req.query.periodeId,
      groupementId: req.query.groupementId,
      siteId: req.query.siteId
    };
    const page = Number(req.query.page || 1);
    const pageSize = Number(req.query.pageSize || 10);
    
    const result = await objectifService.listActiveObjectifs(filters, page, pageSize);
    sendSuccess(res, result, 'Active objectifs retrieved successfully');
  } catch (err) {
    next(new AppError(err.message, 500));
  }
};

/**
 * @openapi
 * /api/objectifs/view:
 *   get:
 *     summary: List Objectifs with enriched view data
 *     tags: [Objectifs]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: userId
 *         schema: { type: integer }
 *       - in: query
 *         name: periodeId
 *         schema: { type: integer }
 *       - in: query
 *         name: groupementId
 *         schema: { type: integer }
 *       - in: query
 *         name: siteId
 *         schema: { type: integer }
 *     responses:
 *       200: { description: Enriched list }
 */
export const listObjectifsView = async (req, res, next) => {
  try {
    const filters = {
      userId: req.query.userId,
      periodeId: req.query.periodeId,
      groupementId: req.query.groupementId,
      siteId: req.query.siteId
    };
    
    const rows = await objectifService.listObjectifsView(filters);
    sendSuccess(res, rows, 'Objectifs view retrieved successfully');
  } catch (err) {
    next(new AppError(err.message, 500));
  }
};

/**
 * @openapi
 * /api/objectifs/{id}:
 *   patch:
 *     summary: Update Objectif
 *     tags: [Objectifs]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: integer }
 *     responses:
 *       200: { description: Updated }
 */
export const updateObjectif = async (req, res, next) => {
  try {
    const id = Number(req.params.id);
    const updatedUserId = req.user?.id || null;
    const result = await objectifService.updateObjectif(id, req.body, updatedUserId);
    
    if (!result) {
      return next(new AppError('Objectif not found', 404));
    }
    
    sendSuccess(res, result, 'Objectif updated successfully');
  } catch (err) {
    next(new AppError(err.message, err.statusCode || 500));
  }
};

/**
 * @openapi
 * /api/objectifs/{id}/activate:
 *   post:
 *     summary: Activate Objectif
 *     tags: [Objectifs]
 */
export const activateObjectif = async (req, res, next) => {
  try {
    const id = Number(req.params.id);
    const result = await objectifService.activateObjectif(id);
    
    if (!result) {
      return next(new AppError('Objectif not found', 404));
    }
    
    sendSuccess(res, result, 'Objectif activated successfully');
  } catch (err) {
    next(new AppError(err.message, err.statusCode || 500));
  }
};

/**
 * @openapi
 * /api/objectifs/{id}/deactivate:
 *   post:
 *     summary: Deactivate Objectif
 *     tags: [Objectifs]
 */
export const deactivateObjectif = async (req, res, next) => {
  try {
    const id = Number(req.params.id);
    const result = await objectifService.deactivateObjectif(id);
    
    if (!result) {
      return next(new AppError('Objectif not found', 404));
    }
    
    sendSuccess(res, result, 'Objectif deactivated successfully');
  } catch (err) {
    next(new AppError(err.message, err.statusCode || 500));
  }
};
