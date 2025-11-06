// src/controllers/modele.controller.js

import { AppError, sendSuccess } from '../middlewares/responseHandler.js';
import { parseBoolean } from '../helpers/queryHelpers.js';
import * as modeleService from '../services/modele.service.js';

/**
 * @openapi
 * tags:
 *   - name: Modeles
 *     description: Modele (car model) management operations
 */

/**
 * @openapi
 * /api/modeles:
 *   post:
 *     summary: Create a new modele with optional image upload
 *     tags: [Modeles]
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             required:
 *               - name
 *               - idMarque
 *             properties:
 *               name:
 *                 type: string
 *                 example: "Corolla"
 *                 description: Model name
 *               idMarque:
 *                 type: integer
 *                 example: 1
 *                 description: Marque ID
 *               image:
 *                 type: string
 *                 format: binary
 *                 description: Model image (jpg, jpeg, png, webp, gif - max 5MB)
 *               active:
 *                 type: boolean
 *                 default: true
 *                 description: Active status
 *     responses:
 *       201:
 *         description: Modele created successfully
 *       400:
 *         description: Validation error or Marque inactive
 *       404:
 *         description: Marque not found
 */
export const createModele = async (req, res, next) => {
    try {
        const { name, idMarque, active = true } = req.body || {};
        
        // ✅ NEW: Get imageUrl from Cloudinary upload
        const imageUrl = req.file ? req.file.path : null;
        
        const result = await modeleService.createModele(name, idMarque, imageUrl, active);
        res.locals.objectId = result.id;
        sendSuccess(res, result, 'Modele created successfully', 201);
    } catch (err) {
        next(new AppError(err.message, err.statusCode || 500));
    }
};

/**
 * @openapi
 * /api/modeles/{id}:
 *   get:
 *     summary: Get modele by ID
 *     tags: [Modeles]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: Modele ID
 *     responses:
 *       200:
 *         description: Modele found
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 id:
 *                   type: integer
 *                 name:
 *                   type: string
 *                 idMarque:
 *                   type: integer
 *                 imageUrl:
 *                   type: string
 *                 active:
 *                   type: boolean
 *       404:
 *         description: Modele not found
 */
export const getModeleById = async (req, res, next) => {
    try {
        const id = Number(req.params.id);
        const modele = await modeleService.getModeleById(id);
        if (!modele) {
            return next(new AppError('Modele not found', 404));
        }
        sendSuccess(res, modele, 'Modele retrieved successfully');
    } catch (err) {
        next(new AppError(err.message, 500));
    }
};

/**
 * @openapi
 * /api/modeles:
 *   get:
 *     summary: List modeles with pagination
 *     tags: [Modeles]
 *     parameters:
 *       - in: query
 *         name: idMarque
 *         schema:
 *           type: integer
 *         required: false
 *         description: Filter by marque ID
 *       - in: query
 *         name: onlyActive
 *         schema:
 *           type: boolean
 *           default: true
 *         description: Filter for active modeles only
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
 *         description: Paginated list of modeles
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
 */
export const listModeles = async (req, res, next) => {
    try {
        const { idMarque } = req.query;
        const onlyActive = parseBoolean(req.query.onlyActive) !== 0;
        const page = Number(req.query.page || 1);
        const pageSize = Number(req.query.pageSize || 10);
        const result = await modeleService.listModeles(idMarque, onlyActive, page, pageSize);
        sendSuccess(res, result, 'Modeles list retrieved successfully');
    } catch (err) {
        next(new AppError(err.message, 500));
    }
};

/**
 * @openapi
 * /api/modeles/by-marque/{idMarque}:
 *   get:
 *     summary: List modeles by marque with pagination
 *     tags: [Modeles]
 *     parameters:
 *       - in: path
 *         name: idMarque
 *         required: true
 *         schema:
 *           type: integer
 *         description: Marque ID
 *       - in: query
 *         name: onlyActive
 *         schema:
 *           type: boolean
 *           default: true
 *         description: Filter for active modeles only
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
 *         description: Paginated list of modeles for the marque
 */
export const listModelesByMarque = async (req, res, next) => {
    try {
        const idMarque = Number(req.params.idMarque);
        const onlyActive = parseBoolean(req.query.onlyActive) !== 0;
        const page = Number(req.query.page || 1);
        const pageSize = Number(req.query.pageSize || 10);
        const result = await modeleService.listModelesByMarque(idMarque, onlyActive, page, pageSize);
        sendSuccess(res, result, 'Modeles by marque retrieved successfully');
    } catch (err) {
        next(new AppError(err.message, 500));
    }
};

/**
 * @openapi
 * /api/modeles/search:
 *   get:
 *     summary: Search modeles with pagination
 *     tags: [Modeles]
 *     parameters:
 *       - in: query
 *         name: q
 *         required: true
 *         schema:
 *           type: string
 *         description: Search term
 *       - in: query
 *         name: idMarque
 *         schema:
 *           type: integer
 *         required: false
 *         description: Filter by marque ID
 *       - in: query
 *         name: onlyActive
 *         schema:
 *           type: boolean
 *           default: true
 *         description: Filter for active modeles only
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
 *         description: Paginated search results
 *       400:
 *         description: Invalid or missing search query
 */
export const searchModeles = async (req, res, next) => {
    try {
        const { q, idMarque } = req.query;
        const onlyActive = parseBoolean(req.query.onlyActive) !== 0;
        const page = Number(req.query.page || 1);
        const pageSize = Number(req.query.pageSize || 10);
        const result = await modeleService.searchModeles(q, idMarque, onlyActive, page, pageSize);
        sendSuccess(res, result, 'Search completed successfully');
    } catch (err) {
        next(new AppError(err.message, 500));
    }
};

/**
 * @openapi
 * /api/modeles/{id}:
 *   patch:
 *     summary: Update modele with optional image replacement
 *     tags: [Modeles]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: Modele ID
 *     requestBody:
 *       required: false
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *                 description: Updated model name
 *               idMarque:
 *                 type: integer
 *                 description: Updated marque ID
 *               image:
 *                 type: string
 *                 format: binary
 *                 description: New model image (replaces existing)
 *               active:
 *                 type: boolean
 *                 description: Active status
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *               idMarque:
 *                 type: integer
 *               imageUrl:
 *                 type: string
 *                 nullable: true
 *                 description: Set to null to remove image
 *               active:
 *                 type: boolean
 *     responses:
 *       200:
 *         description: Modele updated successfully
 *       404:
 *         description: Modele not found
 *       400:
 *         description: Validation error or Marque inactive
 */
export const updateModele = async (req, res, next) => {
    try {
        const id = Number(req.params.id);
        const { name = null, idMarque = null, active = null } = req.body || {};
        
        // ✅ NEW: Handle imageUrl from file upload or body
        let imageUrl = null;
        if (req.file) {
            imageUrl = req.file.path; // New uploaded image from Cloudinary
        } else if (req.body.imageUrl !== undefined) {
            imageUrl = req.body.imageUrl; // Keep existing or explicitly set to null
        }
        
        const result = await modeleService.updateModele(id, name, idMarque, imageUrl, active);
        if (!result) {
            return next(new AppError('Modele not found', 404));
        }
        res.locals.objectId = id;
        sendSuccess(res, result, 'Modele updated successfully');
    } catch (err) {
        next(new AppError(err.message, err.statusCode || 500));
    }
};

/**
 * @openapi
 * /api/modeles/{id}/activate:
 *   post:
 *     summary: Activate a modele
 *     tags: [Modeles]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: Modele ID
 *     responses:
 *       200:
 *         description: Modele activated successfully
 *       404:
 *         description: Modele not found
 */
export const activateModele = async (req, res, next) => {
    try {
        const id = Number(req.params.id);
        const result = await modeleService.activateModele(id);
        if (!result) {
            return next(new AppError('Modele not found', 404));
        }
        res.locals.objectId = id;
        sendSuccess(res, result, 'Modele activated successfully');
    } catch (err) {
        next(new AppError(err.message, err.statusCode || 500));
    }
};

/**
 * @openapi
 * /api/modeles/{id}/deactivate:
 *   post:
 *     summary: Deactivate a modele
 *     tags: [Modeles]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: Modele ID
 *     responses:
 *       200:
 *         description: Modele deactivated successfully
 *       404:
 *         description: Modele not found
 */
export const deactivateModele = async (req, res, next) => {
    try {
        const id = Number(req.params.id);
        const result = await modeleService.deactivateModele(id);
        if (!result) {
            return next(new AppError('Modele not found', 404));
        }
        res.locals.objectId = id;
        sendSuccess(res, result, 'Modele deactivated successfully');
    } catch (err) {
        next(new AppError(err.message, err.statusCode || 500));
    }
};
