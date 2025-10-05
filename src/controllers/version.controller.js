// src/controllers/version.controller.js

import { AppError, sendSuccess } from '../middlewares/responseHandler.js';
import * as versionService from '../services/version.service.js';

/**
 * @openapi
 * tags:
 *   - name: Versions
 *     description: Version management operations
 */

/**
 * @openapi
 * /api/versions:
 *   post:
 *     summary: Create a new Version
 *     tags: [Versions]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [name, idModele, volume, price, tm, margin]
 *             properties:
 *               name:
 *                 type: string
 *                 maxLength: 100
 *                 example: "Version X"
 *               idModele:
 *                 type: integer
 *                 example: 1
 *               volume:
 *                 type: integer
 *                 minimum: 1
 *                 example: 100
 *               price:
 *                 type: number
 *                 format: decimal
 *                 example: 25000.00
 *               tm:
 *                 type: number
 *                 format: decimal
 *                 maximum: 0.40
 *                 example: 0.15
 *               margin:
 *                 type: number
 *                 format: decimal
 *                 maximum: 0.40
 *                 example: 0.20
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
 *     summary: Update Version
 *     tags: [Versions]
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
 *             required: [name, idModele, volume, price, tm, margin]
 *             properties:
 *               name:
 *                 type: string
 *                 maxLength: 100
 *               idModele:
 *                 type: integer
 *               volume:
 *                 type: integer
 *                 minimum: 1
 *               price:
 *                 type: number
 *                 format: decimal
 *               tm:
 *                 type: number
 *                 format: decimal
 *                 maximum: 0.40
 *               margin:
 *                 type: number
 *                 format: decimal
 *                 maximum: 0.40
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
 *     summary: Get Version by ID
 *     tags: [Versions]
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
 *     summary: List Versions with optional filters and pagination
 *     tags: [Versions]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: idModele
 *         schema: { type: integer }
 *         description: Filter by modele ID
 *       - in: query
 *         name: onlyActive
 *         schema: { type: boolean, default: true }
 *         description: Show only active versions
 *       - in: query
 *         name: page
 *         schema: { type: integer, default: 1 }
 *         description: Page number
 *       - in: query
 *         name: pageSize
 *         schema: { type: integer, default: 10 }
 *         description: Number of records per page
 *     responses:
 *       200:
 *         description: Paginated list
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
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden
 */
export const listVersions = async (req, res, next) => {
  try {
    const { idModele, onlyActive } = req.query;
    const page = Number(req.query.page || 1);
    const pageSize = Number(req.query.pageSize || 10);
    
    const result = await versionService.listVersions(
      idModele,
      onlyActive !== 'false',
      page,
      pageSize
    );
    
    sendSuccess(res, result, 'Versions list retrieved successfully');
  } catch (err) {
    next(new AppError(err.message, 500));
  }
};

/**
 * @openapi
 * /api/versions/by-modele:
 *   get:
 *     summary: List Versions by Modele with pagination
 *     tags: [Versions]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: idModele
 *         required: true
 *         schema: { type: integer }
 *       - in: query
 *         name: onlyActive
 *         schema: { type: boolean, default: true }
 *       - in: query
 *         name: page
 *         schema: { type: integer, default: 1 }
 *         description: Page number
 *       - in: query
 *         name: pageSize
 *         schema: { type: integer, default: 10 }
 *         description: Number of records per page
 *     responses:
 *       200:
 *         description: Paginated list
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden
 */
export const listVersionsByModele = async (req, res, next) => {
  try {
    const { idModele, onlyActive } = req.query;
    const page = Number(req.query.page || 1);
    const pageSize = Number(req.query.pageSize || 10);
    
    const result = await versionService.listVersionsByModele(
      idModele,
      onlyActive !== 'false',
      page,
      pageSize
    );
    
    sendSuccess(res, result, 'Versions by modele retrieved successfully');
  } catch (err) {
    next(new AppError(err.message, 500));
  }
};

/**
 * @openapi
 * /api/versions/search:
 *   get:
 *     summary: Search Versions
 *     tags: [Versions]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: q
 *         schema: { type: string }
 *         description: Search query
 *       - in: query
 *         name: idModele
 *         schema: { type: integer }
 *         description: Filter by modele ID
 *       - in: query
 *         name: onlyActive
 *         schema: { type: boolean, default: true }
 *     responses:
 *       200:
 *         description: Search results
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden
 */
export const searchVersions = async (req, res, next) => {
  try {
    const { q, idModele, onlyActive } = req.query;
    const rows = await versionService.searchVersions(q || '', idModele, onlyActive !== 'false');
    sendSuccess(res, rows, 'Search completed successfully');
  } catch (err) {
    next(new AppError(err.message, 500));
  }
};

/**
 * @openapi
 * /api/versions/{id}/activate:
 *   post:
 *     summary: Activate Version
 *     tags: [Versions]
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
 *     summary: Deactivate Version
 *     tags: [Versions]
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
