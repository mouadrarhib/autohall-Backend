// src/controllers/groupement.controller.js

import { AppError, sendSuccess } from '../middlewares/responseHandler.js';
import * as groupementService from '../services/groupement.service.js';

/**
 * @openapi
 * tags:
 *   - name: Groupements
 *     description: Groupement management operations
 */

/**
 * @openapi
 * /api/groupements:
 *   post:
 *     summary: Create a new groupement
 *     tags: [Groupements]
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
 *                 example: "Groupe Nord"
 *               active:
 *                 type: boolean
 *                 default: true
 *     responses:
 *       201:
 *         description: Groupement created successfully
 *       400:
 *         description: Validation error
 *       409:
 *         description: Groupement name already exists
 */
export const createGroupement = async (req, res, next) => {
  try {
    const { name, active = true } = req.body || {};
    const result = await groupementService.createGroupement(name, active);
    res.locals.objectId = result.id; // for audit
    sendSuccess(res, result, 'Groupement created successfully', 201);
  } catch (err) {
    next(new AppError(err.message, err.statusCode || 500));
  }
};

/**
 * @openapi
 * /api/groupements/{id}:
 *   get:
 *     summary: Get groupement by ID
 *     tags: [Groupements]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Groupement found
 *       404:
 *         description: Groupement not found
 */
export const getGroupementById = async (req, res, next) => {
  try {
    const id = Number(req.params.id);
    const groupement = await groupementService.getGroupementById(id);
    
    if (!groupement) {
      return next(new AppError('Groupement not found', 404));
    }
    
    sendSuccess(res, groupement, 'Groupement retrieved successfully');
  } catch (err) {
    next(new AppError(err.message, 500));
  }
};

/**
 * @openapi
 * /api/groupements:
 *   get:
 *     summary: List all groupements
 *     tags: [Groupements]
 *     responses:
 *       200:
 *         description: List of groupements
 */
export const listGroupements = async (req, res, next) => {
  try {
    const groupements = await groupementService.listGroupements();
    sendSuccess(res, groupements, 'Groupements list retrieved successfully');
  } catch (err) {
    next(new AppError(err.message, 500));
  }
};

/**
 * @openapi
 * /api/groupements/search:
 *   get:
 *     summary: Search groupements by name
 *     tags: [Groupements]
 *     parameters:
 *       - in: query
 *         name: q
 *         required: true
 *         schema:
 *           type: string
 *         description: Search term
 *     responses:
 *       200:
 *         description: Search results
 *       400:
 *         description: Invalid search query
 */
export const searchGroupements = async (req, res, next) => {
  try {
    const { q } = req.query;
    const results = await groupementService.searchGroupements(q);
    sendSuccess(res, results, 'Search completed successfully');
  } catch (err) {
    next(new AppError(err.message, 500));
  }
};

/**
 * @openapi
 * /api/groupements/{id}:
 *   patch:
 *     summary: Update groupement
 *     tags: [Groupements]
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
 *         description: Groupement updated
 *       404:
 *         description: Groupement not found
 *       409:
 *         description: Groupement name already exists
 */
export const updateGroupement = async (req, res, next) => {
  try {
    const id = Number(req.params.id);
    const { name = null, active = null } = req.body || {};
    const result = await groupementService.updateGroupement(id, name, active);
    
    if (!result) {
      return next(new AppError('Groupement not found', 404));
    }
    
    res.locals.objectId = id; // for audit
    sendSuccess(res, result, 'Groupement updated successfully');
  } catch (err) {
    next(new AppError(err.message, err.statusCode || 500));
  }
};

/**
 * @openapi
 * /api/groupements/{id}/activate:
 *   post:
 *     summary: Activate groupement
 *     tags: [Groupements]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Groupement activated
 *       404:
 *         description: Groupement not found
 */
export const activateGroupement = async (req, res, next) => {
  try {
    const id = Number(req.params.id);
    const result = await groupementService.activateGroupement(id);
    
    if (!result) {
      return next(new AppError('Groupement not found', 404));
    }
    
    res.locals.objectId = id; // for audit
    sendSuccess(res, result, 'Groupement activated successfully');
  } catch (err) {
    next(new AppError(err.message, err.statusCode || 500));
  }
};

/**
 * @openapi
 * /api/groupements/{id}/deactivate:
 *   post:
 *     summary: Deactivate groupement
 *     tags: [Groupements]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Groupement deactivated
 *       404:
 *         description: Groupement not found
 */
export const deactivateGroupement = async (req, res, next) => {
  try {
    const id = Number(req.params.id);
    const result = await groupementService.deactivateGroupement(id);
    
    if (!result) {
      return next(new AppError('Groupement not found', 404));
    }
    
    res.locals.objectId = id; // for audit
    sendSuccess(res, result, 'Groupement deactivated successfully');
  } catch (err) {
    next(new AppError(err.message, err.statusCode || 500));
  }
};

/**
 * @openapi
 * /api/groupements/{id}/users:
 *   get:
 *     summary: List active users in a groupement (paginated)
 *     tags: [Groupements]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: Groupement ID
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
 *         description: Paginated list of users
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
 *       404:
 *         description: Groupement not found
 */
export const listUsersByGroupement = async (req, res, next) => {
  try {
    const idGroupement = Number(req.params.id);
    const page = Number(req.query.page || 1);
    const pageSize = Number(req.query.pageSize || 10);
    
    const result = await groupementService.listUsersByGroupement(idGroupement, page, pageSize);
    sendSuccess(res, result, 'Users list retrieved successfully');
  } catch (err) {
    next(new AppError(err.message, 500));
  }
};
