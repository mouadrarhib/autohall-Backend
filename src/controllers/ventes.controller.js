// src/controllers/ventes.controller.js

import { AppError, sendSuccess } from '../middlewares/responseHandler.js';
import * as ventesService from '../services/ventes.service.js';

/**
 * @openapi
 * tags:
 *   - name: Ventes
 *     description: Sales management and analytics operations
 */

/**
 * @openapi
 * /api/ventes:
 *   post:
 *     summary: Create a new Vente
 *     tags: [Ventes]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [idTypeVente, prixVente, chiffreAffaires, volume, venteYear, venteMonth]
 *             properties:
 *               idTypeVente: 
 *                 type: integer
 *                 description: Type of sale
 *               idFiliale: 
 *                 type: integer
 *                 nullable: true
 *                 description: Filiale ID (at least one of idFiliale or idSuccursale required)
 *               idSuccursale: 
 *                 type: integer
 *                 nullable: true
 *                 description: Succursale ID (at least one of idFiliale or idSuccursale required)
 *               idMarque: 
 *                 type: integer
 *                 nullable: true
 *                 description: Marque ID (at least one vehicle level required)
 *               idModele: 
 *                 type: integer
 *                 nullable: true
 *                 description: Modele ID
 *               idVersion: 
 *                 type: integer
 *                 nullable: true
 *                 description: Version ID
 *               prixVente: 
 *                 type: number
 *                 format: decimal
 *                 description: Sale price
 *               chiffreAffaires: 
 *                 type: number
 *                 format: decimal
 *                 description: Revenue
 *               marge: 
 *                 type: number
 *                 format: decimal
 *                 nullable: true
 *                 description: Absolute margin
 *               margePercentage: 
 *                 type: number
 *                 format: decimal
 *                 nullable: true
 *                 description: Margin percentage
 *               volume: 
 *                 type: integer
 *                 description: Quantity sold
 *               venteYear: 
 *                 type: integer
 *                 minimum: 2000
 *                 maximum: 2100
 *                 description: Sale year
 *               venteMonth: 
 *                 type: integer
 *                 minimum: 1
 *                 maximum: 12
 *                 description: Sale month
 *     responses:
 *       201:
 *         description: Vente created successfully
 *       400:
 *         description: Validation error
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden
 */
export const createVente = async (req, res, next) => {
  try {
    // Automatically inject authenticated user ID
    const venteData = {
      ...req.body,
      idUser: req.user.id
    };
    
    const result = await ventesService.createVente(venteData);
    sendSuccess(res, result, 'Vente created successfully', 201);
  } catch (err) {
    next(new AppError(err.message, err.statusCode || 500));
  }
};

/**
 * @openapi
 * /api/ventes/{id}:
 *   get:
 *     summary: Get Vente by ID
 *     tags: [Ventes]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: Vente ID
 *       - in: query
 *         name: includeInactive
 *         schema:
 *           type: boolean
 *           default: false
 *         description: Include inactive ventes
 *     responses:
 *       200:
 *         description: Vente found
 *       404:
 *         description: Vente not found
 *       401:
 *         description: Unauthorized
 */
export const getVenteById = async (req, res, next) => {
  try {
    const id = Number(req.params.id);
    const includeInactive = req.query.includeInactive === 'true';
    const row = await ventesService.getVenteById(id, includeInactive);
    
    if (!row) {
      return next(new AppError('Vente not found', 404));
    }
    
    sendSuccess(res, row, 'Vente retrieved successfully');
  } catch (err) {
    next(new AppError(err.message, 500));
  }
};

/**
 * @openapi
 * /api/ventes:
 *   get:
 *     summary: List Ventes with optional filters and pagination
 *     tags: [Ventes]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: idTypeVente
 *         schema:
 *           type: integer
 *         description: Filter by type of sale
 *       - in: query
 *         name: idUser
 *         schema:
 *           type: integer
 *         description: Filter by user
 *       - in: query
 *         name: idFiliale
 *         schema:
 *           type: integer
 *         description: Filter by filiale
 *       - in: query
 *         name: idSuccursale
 *         schema:
 *           type: integer
 *         description: Filter by succursale
 *       - in: query
 *         name: idMarque
 *         schema:
 *           type: integer
 *         description: Filter by marque
 *       - in: query
 *         name: idModele
 *         schema:
 *           type: integer
 *         description: Filter by modele
 *       - in: query
 *         name: idVersion
 *         schema:
 *           type: integer
 *         description: Filter by version
 *       - in: query
 *         name: yearFrom
 *         schema:
 *           type: integer
 *         description: Start year filter
 *       - in: query
 *         name: yearTo
 *         schema:
 *           type: integer
 *         description: End year filter
 *       - in: query
 *         name: monthFrom
 *         schema:
 *           type: integer
 *           minimum: 1
 *           maximum: 12
 *         description: Start month filter
 *       - in: query
 *         name: monthTo
 *         schema:
 *           type: integer
 *           minimum: 1
 *           maximum: 12
 *         description: End month filter
 *       - in: query
 *         name: includeInactive
 *         schema:
 *           type: boolean
 *           default: false
 *         description: Include inactive ventes
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
 *           default: 50
 *         description: Number of items per page
 *     responses:
 *       200:
 *         description: Paginated list of ventes with metadata
 *       401:
 *         description: Unauthorized
 */
export const listVentes = async (req, res, next) => {
  try {
    const filters = {
      idTypeVente: req.query.idTypeVente,
      idUser: req.query.idUser,
      idFiliale: req.query.idFiliale,
      idSuccursale: req.query.idSuccursale,
      idMarque: req.query.idMarque,
      idModele: req.query.idModele,
      idVersion: req.query.idVersion,
      yearFrom: req.query.yearFrom,
      yearTo: req.query.yearTo,
      monthFrom: req.query.monthFrom,
      monthTo: req.query.monthTo,
      includeInactive: req.query.includeInactive === 'true'
    };
    
    const page = Number(req.query.page || 1);
    const pageSize = Number(req.query.pageSize || 50);
    
    const result = await ventesService.listVentes(filters, page, pageSize);
    sendSuccess(res, result, 'Ventes retrieved successfully');
  } catch (err) {
    next(new AppError(err.message, 500));
  }
};

/**
 * @openapi
 * /api/ventes/{id}:
 *   patch:
 *     summary: Update Vente
 *     tags: [Ventes]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: Vente ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [idTypeVente, prixVente, chiffreAffaires, volume, venteYear, venteMonth]
 *             properties:
 *               idTypeVente: { type: integer }
 *               idFiliale: { type: integer, nullable: true }
 *               idSuccursale: { type: integer, nullable: true }
 *               idMarque: { type: integer, nullable: true }
 *               idModele: { type: integer, nullable: true }
 *               idVersion: { type: integer, nullable: true }
 *               prixVente: { type: number, format: decimal }
 *               chiffreAffaires: { type: number, format: decimal }
 *               marge: { type: number, format: decimal, nullable: true }
 *               margePercentage: { type: number, format: decimal, nullable: true }
 *               volume: { type: integer }
 *               venteYear: { type: integer, minimum: 2000, maximum: 2100 }
 *               venteMonth: { type: integer, minimum: 1, maximum: 12 }
 *     responses:
 *       200:
 *         description: Vente updated successfully
 *       400:
 *         description: Validation error
 *       404:
 *         description: Vente not found
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden
 */
export const updateVente = async (req, res, next) => {
  try {
    const id = Number(req.params.id);
    
    // Automatically inject authenticated user ID
    const venteData = {
      ...req.body,
      idUser: req.user.id
    };
    
    const result = await ventesService.updateVente(id, venteData);
    
    if (!result) {
      return next(new AppError('Vente not found', 404));
    }
    
    sendSuccess(res, result, 'Vente updated successfully');
  } catch (err) {
    next(new AppError(err.message, err.statusCode || 500));
  }
};

/**
 * @openapi
 * /api/ventes/{id}/activate:
 *   post:
 *     summary: Activate Vente
 *     tags: [Ventes]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: Vente ID
 *     responses:
 *       200:
 *         description: Vente activated successfully
 *       404:
 *         description: Vente not found
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden
 */
export const activateVente = async (req, res, next) => {
  try {
    const id = Number(req.params.id);
    const updatedByUser = req.user.id;
    const result = await ventesService.activateVente(id, updatedByUser);
    
    if (!result) {
      return next(new AppError('Vente not found', 404));
    }
    
    sendSuccess(res, result, 'Vente activated successfully');
  } catch (err) {
    next(new AppError(err.message, err.statusCode || 500));
  }
};

/**
 * @openapi
 * /api/ventes/{id}/deactivate:
 *   post:
 *     summary: Deactivate Vente
 *     tags: [Ventes]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: Vente ID
 *     responses:
 *       200:
 *         description: Vente deactivated successfully
 *       404:
 *         description: Vente not found
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden
 */
export const deactivateVente = async (req, res, next) => {
  try {
    const id = Number(req.params.id);
    const updatedByUser = req.user.id;
    const result = await ventesService.deactivateVente(id, updatedByUser);
    
    if (!result) {
      return next(new AppError('Vente not found', 404));
    }
    
    sendSuccess(res, result, 'Vente deactivated successfully');
  } catch (err) {
    next(new AppError(err.message, err.statusCode || 500));
  }
};

/**
 * @openapi
 * /api/ventes/analytics/summary:
 *   get:
 *     summary: Get sales summary by period
 *     description: Aggregate sales data by month/year with financial metrics
 *     tags: [Ventes]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: yearFrom
 *         required: true
 *         schema:
 *           type: integer
 *         description: Start year
 *       - in: query
 *         name: yearTo
 *         required: true
 *         schema:
 *           type: integer
 *         description: End year
 *       - in: query
 *         name: idFiliale
 *         schema:
 *           type: integer
 *         description: Filter by filiale
 *       - in: query
 *         name: idSuccursale
 *         schema:
 *           type: integer
 *         description: Filter by succursale
 *       - in: query
 *         name: idMarque
 *         schema:
 *           type: integer
 *         description: Filter by marque
 *     responses:
 *       200:
 *         description: Sales summary data
 *       400:
 *         description: Missing required parameters
 *       401:
 *         description: Unauthorized
 */
export const getSummaryByPeriod = async (req, res, next) => {
  try {
    const yearFrom = Number(req.query.yearFrom);
    const yearTo = Number(req.query.yearTo);
    
    if (!yearFrom || !yearTo) {
      return next(new AppError('yearFrom and yearTo are required', 400));
    }
    
    const filters = {
      idFiliale: req.query.idFiliale,
      idSuccursale: req.query.idSuccursale,
      idMarque: req.query.idMarque
    };
    
    const result = await ventesService.getSummaryByPeriod(yearFrom, yearTo, filters);
    sendSuccess(res, result, 'Summary retrieved successfully');
  } catch (err) {
    next(new AppError(err.message, 500));
  }
};

/**
 * @openapi
 * /api/ventes/analytics/performance:
 *   get:
 *     summary: Get performance by vehicle
 *     description: Sales performance metrics grouped by marque, modele, or version
 *     tags: [Ventes]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: yearFrom
 *         required: true
 *         schema:
 *           type: integer
 *         description: Start year
 *       - in: query
 *         name: yearTo
 *         required: true
 *         schema:
 *           type: integer
 *         description: End year
 *       - in: query
 *         name: level
 *         schema:
 *           type: string
 *           enum: [marque, modele, version]
 *           default: marque
 *         description: Grouping level
 *     responses:
 *       200:
 *         description: Performance data by vehicle
 *       400:
 *         description: Invalid parameters
 *       401:
 *         description: Unauthorized
 */
export const getPerformanceByVehicle = async (req, res, next) => {
  try {
    const yearFrom = Number(req.query.yearFrom);
    const yearTo = Number(req.query.yearTo);
    const level = req.query.level || 'marque';
    
    if (!yearFrom || !yearTo) {
      return next(new AppError('yearFrom and yearTo are required', 400));
    }
    
    if (!['marque', 'modele', 'version'].includes(level)) {
      return next(new AppError('level must be marque, modele, or version', 400));
    }
    
    const result = await ventesService.getPerformanceByVehicle(yearFrom, yearTo, level);
    sendSuccess(res, result, 'Performance data retrieved successfully');
  } catch (err) {
    next(new AppError(err.message, 500));
  }
};

/**
 * @openapi
 * /api/ventes/analytics/top-performers:
 *   get:
 *     summary: Get top performers
 *     description: Retrieve top performing users, filiales, or succursales by sales
 *     tags: [Ventes]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: yearFrom
 *         required: true
 *         schema:
 *           type: integer
 *         description: Start year
 *       - in: query
 *         name: yearTo
 *         required: true
 *         schema:
 *           type: integer
 *         description: End year
 *       - in: query
 *         name: performerType
 *         schema:
 *           type: string
 *           enum: [user, filiale, succursale]
 *           default: user
 *         description: Type of performer
 *       - in: query
 *         name: topN
 *         schema:
 *           type: integer
 *           default: 10
 *         description: Number of top performers to return
 *     responses:
 *       200:
 *         description: Top performers data
 *       400:
 *         description: Invalid parameters
 *       401:
 *         description: Unauthorized
 */
export const getTopPerformers = async (req, res, next) => {
  try {
    const yearFrom = Number(req.query.yearFrom);
    const yearTo = Number(req.query.yearTo);
    const performerType = req.query.performerType || 'user';
    const topN = Number(req.query.topN || 10);
    
    if (!yearFrom || !yearTo) {
      return next(new AppError('yearFrom and yearTo are required', 400));
    }
    
    if (!['user', 'filiale', 'succursale'].includes(performerType)) {
      return next(new AppError('performerType must be user, filiale, or succursale', 400));
    }
    
    const result = await ventesService.getTopPerformers(yearFrom, yearTo, performerType, topN);
    sendSuccess(res, result, 'Top performers retrieved successfully');
  } catch (err) {
    next(new AppError(err.message, 500));
  }
};

/**
 * @openapi
 * /api/ventes/analytics/compare:
 *   get:
 *     summary: Compare two periods
 *     description: Compare sales metrics between two specific months
 *     tags: [Ventes]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: year1
 *         required: true
 *         schema:
 *           type: integer
 *         description: First period year
 *       - in: query
 *         name: month1
 *         required: true
 *         schema:
 *           type: integer
 *           minimum: 1
 *           maximum: 12
 *         description: First period month
 *       - in: query
 *         name: year2
 *         required: true
 *         schema:
 *           type: integer
 *         description: Second period year
 *       - in: query
 *         name: month2
 *         required: true
 *         schema:
 *           type: integer
 *           minimum: 1
 *           maximum: 12
 *         description: Second period month
 *       - in: query
 *         name: idMarque
 *         schema:
 *           type: integer
 *         description: Filter by marque
 *       - in: query
 *         name: idFiliale
 *         schema:
 *           type: integer
 *         description: Filter by filiale
 *     responses:
 *       200:
 *         description: Period comparison data
 *       400:
 *         description: Missing required parameters
 *       401:
 *         description: Unauthorized
 */
export const comparePeriods = async (req, res, next) => {
  try {
    const year1 = Number(req.query.year1);
    const month1 = Number(req.query.month1);
    const year2 = Number(req.query.year2);
    const month2 = Number(req.query.month2);
    
    if (!year1 || !month1 || !year2 || !month2) {
      return next(new AppError('year1, month1, year2, and month2 are required', 400));
    }
    
    const filters = {
      idMarque: req.query.idMarque,
      idFiliale: req.query.idFiliale
    };
    
    const result = await ventesService.comparePeriods(year1, month1, year2, month2, filters);
    sendSuccess(res, result, 'Period comparison retrieved successfully');
  } catch (err) {
    next(new AppError(err.message, 500));
  }
};

/**
 * @openapi
 * /api/ventes/analytics/yoy-growth:
 *   get:
 *     summary: Get year-over-year growth
 *     description: Calculate YoY growth by comparing monthly data across two years
 *     tags: [Ventes]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: currentYear
 *         required: true
 *         schema:
 *           type: integer
 *         description: Current year
 *       - in: query
 *         name: previousYear
 *         required: true
 *         schema:
 *           type: integer
 *         description: Previous year for comparison
 *       - in: query
 *         name: idMarque
 *         schema:
 *           type: integer
 *         description: Filter by marque
 *     responses:
 *       200:
 *         description: Year-over-year growth data
 *       400:
 *         description: Missing required parameters
 *       401:
 *         description: Unauthorized
 */
export const getYearOverYearGrowth = async (req, res, next) => {
  try {
    const currentYear = Number(req.query.currentYear);
    const previousYear = Number(req.query.previousYear);
    
    if (!currentYear || !previousYear) {
      return next(new AppError('currentYear and previousYear are required', 400));
    }
    
    const idMarque = req.query.idMarque || null;
    
    const result = await ventesService.getYearOverYearGrowth(currentYear, previousYear, idMarque);
    sendSuccess(res, result, 'Year-over-year growth retrieved successfully');
  } catch (err) {
    next(new AppError(err.message, 500));
  }
};
