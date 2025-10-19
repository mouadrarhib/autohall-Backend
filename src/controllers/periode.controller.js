// src/controllers/periode.controller.js

import { AppError, sendSuccess } from '../middlewares/responseHandler.js';
import * as periodeService from '../services/periode.service.js';

/**
 * @openapi
 * tags:
 *   - name: Periodes
 *     description: Period management operations
 */

/**
 * @openapi
 * /api/periode:
 *   post:
 *     summary: Create a new periode
 *     tags: [Periodes]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [year, month, startedDate, endDate, typePeriodeId]
 *             properties:
 *               year:
 *                 type: integer
 *                 example: 2025
 *               month:
 *                 type: integer
 *                 minimum: 1
 *                 maximum: 12
 *                 example: 10
 *               week:
 *                 type: integer
 *                 nullable: true
 *                 example: 1
 *               startedDate:
 *                 type: string
 *                 format: date
 *                 example: "2025-10-01"
 *               endDate:
 *                 type: string
 *                 format: date
 *                 example: "2025-10-07"
 *               typePeriodeId:
 *                 type: integer
 *                 example: 1
 *     responses:
 *       201:
 *         description: Periode created
 *       400:
 *         description: Validation error
 */
export const createPeriode = async (req, res, next) => {
  try {
    const result = await periodeService.createPeriode(req.body);
    sendSuccess(res, result, 'Periode created successfully', 201);
  } catch (err) {
    next(new AppError(err.message, err.statusCode || 500));
  }
};

/**
 * @openapi
 * /api/periode/{id}:
 *   patch:
 *     summary: Update a periode
 *     tags: [Periodes]
 *     security:
 *       - bearerAuth: []
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
 *             required: [year, month, startedDate, endDate, typePeriodeId]
 *             properties:
 *               year:
 *                 type: integer
 *               month:
 *                 type: integer
 *               week:
 *                 type: integer
 *                 nullable: true
 *               startedDate:
 *                 type: string
 *                 format: date
 *               endDate:
 *                 type: string
 *                 format: date
 *               typePeriodeId:
 *                 type: integer
 *     responses:
 *       200:
 *         description: Periode updated
 *       404:
 *         description: Periode not found
 */
export const updatePeriode = async (req, res, next) => {
  try {
    const id = Number(req.params.id);
    const result = await periodeService.updatePeriode(id, req.body);
    
    if (!result) {
      return next(new AppError('Periode not found', 404));
    }
    
    sendSuccess(res, result, 'Periode updated successfully');
  } catch (err) {
    next(new AppError(err.message, err.statusCode || 500));
  }
};

/**
 * @openapi
 * /api/periode/{id}:
 *   get:
 *     summary: Get periode by ID
 *     tags: [Periodes]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Periode found
 *       404:
 *         description: Periode not found
 */
export const getPeriodeById = async (req, res, next) => {
  try {
    const id = Number(req.params.id);
    const periode = await periodeService.getPeriodeById(id);
    
    if (!periode) {
      return next(new AppError('Periode not found', 404));
    }
    
    sendSuccess(res, periode, 'Periode retrieved successfully');
  } catch (err) {
    next(new AppError(err.message, 500));
  }
};

/**
 * @openapi
 * /api/periode:
 *   get:
 *     summary: List all active periodes with pagination
 *     tags: [Periodes]
 *     security:
 *       - bearerAuth: []
 *     parameters:
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
 *         description: Paginated list of periodes
 */
export const listActivePeriodes = async (req, res, next) => {
  try {
    const page = Number(req.query.page || 1);
    const pageSize = Number(req.query.pageSize || 10);
    const result = await periodeService.listActivePeriodes(page, pageSize);
    sendSuccess(res, result, 'Active periodes retrieved successfully');
  } catch (err) {
    next(new AppError(err.message, 500));
  }
};

/**
 * @openapi
 * /api/periode/{id}/activate:
 *   post:
 *     summary: Activate a periode
 *     tags: [Periodes]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Periode activated
 *       404:
 *         description: Periode not found
 */
export const activatePeriode = async (req, res, next) => {
  try {
    const id = Number(req.params.id);
    const result = await periodeService.activatePeriode(id);
    
    if (!result) {
      return next(new AppError('Periode not found', 404));
    }
    
    sendSuccess(res, result, 'Periode activated successfully');
  } catch (err) {
    next(new AppError(err.message, err.statusCode || 500));
  }
};

/**
 * @openapi
 * /api/periode/{id}/deactivate:
 *   post:
 *     summary: Deactivate a periode
 *     tags: [Periodes]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Periode deactivated
 *       404:
 *         description: Periode not found
 */
export const deactivatePeriode = async (req, res, next) => {
  try {
    const id = Number(req.params.id);
    const result = await periodeService.deactivatePeriode(id);
    
    if (!result) {
      return next(new AppError('Periode not found', 404));
    }
    
    sendSuccess(res, result, 'Periode deactivated successfully');
  } catch (err) {
    next(new AppError(err.message, err.statusCode || 500));
  }
};

/**
 * @openapi
 * /api/periode/by-type:
 *   get:
 *     summary: List periodes by type with pagination
 *     tags: [Periodes]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: typePeriodeId
 *         schema:
 *           type: integer
 *       - in: query
 *         name: typePeriodeName
 *         schema:
 *           type: string
 *       - in: query
 *         name: hebdomadaire
 *         schema:
 *           type: boolean
 *       - in: query
 *         name: mensuel
 *         schema:
 *           type: boolean
 *       - in: query
 *         name: year
 *         schema:
 *           type: integer
 *       - in: query
 *         name: month
 *         schema:
 *           type: integer
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
 *         description: Paginated list of periodes
 */
export const listPeriodesByType = async (req, res, next) => {
  try {
    const filters = {
      typePeriodeId: req.query.typePeriodeId,
      typePeriodeName: req.query.typePeriodeName,
      hebdomadaire: req.query.hebdomadaire === 'true',
      mensuel: req.query.mensuel === 'true',
      year: req.query.year,
      month: req.query.month
    };
    const page = Number(req.query.page || 1);
    const pageSize = Number(req.query.pageSize || 10);
    const result = await periodeService.listPeriodesByType(filters, page, pageSize);
    sendSuccess(res, result, 'Periodes by type retrieved successfully');
  } catch (err) {
    next(new AppError(err.message, 500));
  }
};

/**
 * @openapi
 * /api/periode/years:
 *   get:
 *     summary: List distinct years with pagination
 *     tags: [Periodes]
 *     security:
 *       - bearerAuth: []
 *     parameters:
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
 *         description: Paginated list of years
 */
export const listYears = async (req, res, next) => {
  try {
    const page = Number(req.query.page || 1);
    const pageSize = Number(req.query.pageSize || 10);
    const result = await periodeService.listYears(page, pageSize);
    sendSuccess(res, result, 'Years list retrieved successfully');
  } catch (err) {
    next(new AppError(err.message, 500));
  }
};

/**
 * @openapi
 * /api/periode/by-year:
 *   get:
 *     summary: List periodes by year with pagination
 *     tags: [Periodes]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: year
 *         required: true
 *         schema:
 *           type: integer
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
 *         description: Paginated list of periodes
 *       400:
 *         description: Year is required
 */
export const listPeriodesByYear = async (req, res, next) => {
  try {
    const year = req.query.year;
    
    if (!year) {
      return next(new AppError('Year parameter is required', 400));
    }
    
    const page = Number(req.query.page || 1);
    const pageSize = Number(req.query.pageSize || 10);
    const result = await periodeService.listPeriodesByYear(year, page, pageSize);
    sendSuccess(res, result, 'Periodes by year retrieved successfully');
  } catch (err) {
    next(new AppError(err.message, 500));
  }
};
