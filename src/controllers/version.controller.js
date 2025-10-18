// src/controllers/version.controller.js

import { AppError, sendSuccess } from '../middlewares/responseHandler.js';
import { parseBoolean } from '../helpers/queryHelpers.js';
import * as versionService from '../services/version.service.js';

/**
 * @openapi
 * tags:
 *   - name: Versions
 *     description: Version (car version/trim) management operations
 */

/**
 * @openapi
 * /api/versions:
 *   post:
 *     summary: Create a new version
 *     tags: [Versions]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - name
 *               - idModele
 *               - volume
 *               - salePrice
 *               - tmDirect
 *               - margeInterGroupe
 *             properties:
 *               name:
 *                 type: string
 *                 maxLength: 255
 *                 example: "Comfort Plus"
 *               idModele:
 *                 type: integer
 *                 example: 1
 *               volume:
 *                 type: integer
 *                 minimum: 0
 *                 example: 100
 *               salePrice:
 *                 type: number
 *                 format: decimal
 *                 example: 250000.00
 *                 description: "Price in format 00.00"
 *               tmDirect:
 *                 type: number
 *                 format: decimal
 *                 example: 0.1500
 *                 description: "Percentage as decimal (0.15 = 15%)"
 *               margeInterGroupe:
 *                 type: number
 *                 format: decimal
 *                 example: 0.0500
 *                 description: "Percentage as decimal (0.05 = 5%)"
 *               active:
 *                 type: boolean
 *                 default: true
 *     responses:
 *       201:
 *         description: Version created successfully
 *       400:
 *         description: Validation error
 *       404:
 *         description: Modele not found
 */
export const createVersion = async (req, res, next) => {
  try {
    const result = await versionService.createVersion(req.body);
    sendSuccess(res, result, 'Version created successfully', 201);
  } catch (err) {
    next(new AppError(err.message, err.statusCode || 500));
  }
};

/**
 * @openapi
 * /api/versions/{id}:
 *   patch:
 *     summary: Update version (partial update supported)
 *     tags: [Versions]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: Version ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *                 example: "Sport Edition"
 *               idModele:
 *                 type: integer
 *                 example: 2
 *               volume:
 *                 type: integer
 *                 example: 150
 *               salePrice:
 *                 type: number
 *                 example: 300000.00
 *               tmDirect:
 *                 type: number
 *                 example: 0.2000
 *               margeInterGroupe:
 *                 type: number
 *                 example: 0.0750
 *               active:
 *                 type: boolean
 *     responses:
 *       200:
 *         description: Version updated successfully
 *       404:
 *         description: Version not found
 */
export const updateVersion = async (req, res, next) => {
  try {
    const id = Number(req.params.id);
    const result = await versionService.updateVersion(id, req.body);
    
    if (!result) {
      return next(new AppError('Version not found', 404));
    }
    
    sendSuccess(res, result, 'Version updated successfully');
  } catch (err) {
    next(new AppError(err.message, err.statusCode || 500));
  }
};

/**
 * @openapi
 * /api/versions/{id}:
 *   get:
 *     summary: Get version by ID
 *     tags: [Versions]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: Version ID
 *     responses:
 *       200:
 *         description: Version retrieved successfully
 *       404:
 *         description: Version not found
 */
export const getVersionById = async (req, res, next) => {
  try {
    const id = Number(req.params.id);
    const row = await versionService.getVersionById(id);
    
    if (!row) {
      return next(new AppError('Version not found', 404));
    }
    
    sendSuccess(res, row, 'Version retrieved successfully');
  } catch (err) {
    next(new AppError(err.message, 500));
  }
};

/**
 * @openapi
 * /api/versions:
 *   get:
 *     summary: List versions with pagination
 *     tags: [Versions]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: idModele
 *         schema:
 *           type: integer
 *           nullable: true
 *         description: Filter by modele ID
 *       - in: query
 *         name: onlyActive
 *         schema:
 *           type: boolean
 *           default: true
 *         description: Filter for active versions only
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
 *         description: Records per page
 *     responses:
 *       200:
 *         description: Paginated list of versions
 */
export const listVersions = async (req, res, next) => {
  try {
    const { idModele } = req.query;
    const onlyActive = parseBoolean(req.query.onlyActive) !== 0;
    const page = Number(req.query.page || 1);
    const pageSize = Number(req.query.pageSize || 10);
    
    const result = await versionService.listVersions(idModele, onlyActive, page, pageSize);
    sendSuccess(res, result, 'Versions list retrieved successfully');
  } catch (err) {
    next(new AppError(err.message, 500));
  }
};

/**
 * @openapi
 * /api/versions/by-modele/{idModele}:
 *   get:
 *     summary: List versions by modele with pagination
 *     tags: [Versions]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: idModele
 *         required: true
 *         schema:
 *           type: integer
 *         description: Modele ID
 *       - in: query
 *         name: onlyActive
 *         schema:
 *           type: boolean
 *           default: true
 *         description: Filter for active versions only
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
 *         description: Records per page
 *     responses:
 *       200:
 *         description: Paginated list of versions for the modele
 */
export const listVersionsByModele = async (req, res, next) => {
  try {
    const idModele = Number(req.params.idModele);
    const onlyActive = parseBoolean(req.query.onlyActive) !== 0;
    const page = Number(req.query.page || 1);
    const pageSize = Number(req.query.pageSize || 10);
    
    const result = await versionService.listVersionsByModele(idModele, onlyActive, page, pageSize);
    sendSuccess(res, result, 'Versions by modele retrieved successfully');
  } catch (err) {
    next(new AppError(err.message, 500));
  }
};

/**
 * @openapi
 * /api/versions/search:
 *   get:
 *     summary: Search versions with pagination
 *     tags: [Versions]
 *     security:
 *       - bearerAuth: []
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
 *         description: Filter by modele ID
 *       - in: query
 *         name: onlyActive
 *         schema:
 *           type: boolean
 *           default: true
 *         description: Filter for active versions only
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
 *         description: Records per page
 *     responses:
 *       200:
 *         description: Paginated search results
 *       400:
 *         description: Invalid or missing search query
 */
export const searchVersions = async (req, res, next) => {
  try {
    const { q, idModele } = req.query;
    const onlyActive = parseBoolean(req.query.onlyActive) !== 0;
    const page = Number(req.query.page || 1);
    const pageSize = Number(req.query.pageSize || 10);
    
    const result = await versionService.searchVersions(q || '', idModele, onlyActive, page, pageSize);
    sendSuccess(res, result, 'Search completed successfully');
  } catch (err) {
    next(new AppError(err.message, 500));
  }
};

/**
 * @openapi
 * /api/versions/{id}/activate:
 *   post:
 *     summary: Activate version
 *     tags: [Versions]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: Version ID
 *     responses:
 *       200:
 *         description: Version activated successfully
 *       404:
 *         description: Version not found
 */
export const activateVersion = async (req, res, next) => {
  try {
    const id = Number(req.params.id);
    const result = await versionService.activateVersion(id);
    
    if (!result) {
      return next(new AppError('Version not found', 404));
    }
    
    sendSuccess(res, result, 'Version activated successfully');
  } catch (err) {
    next(new AppError(err.message, err.statusCode || 500));
  }
};

/**
 * @openapi
 * /api/versions/{id}/deactivate:
 *   post:
 *     summary: Deactivate version
 *     tags: [Versions]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: Version ID
 *     responses:
 *       200:
 *         description: Version deactivated successfully
 *       404:
 *         description: Version not found
 */
export const deactivateVersion = async (req, res, next) => {
  try {
    const id = Number(req.params.id);
    const result = await versionService.deactivateVersion(id);
    
    if (!result) {
      return next(new AppError('Version not found', 404));
    }
    
    sendSuccess(res, result, 'Version deactivated successfully');
  } catch (err) {
    next(new AppError(err.message, err.statusCode || 500));
  }
};
