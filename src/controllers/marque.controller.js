// src/controllers/marque.controller.js

import { AppError, sendSuccess } from '../middlewares/responseHandler.js';
import { parseBoolean } from '../helpers/queryHelpers.js';
import * as marqueService from '../services/marque.service.js';

/**
 * @openapi
 * tags:
 *   - name: Marques
 *     description: Marque management operations
 */

/**
 * @openapi
 * /api/marques:
 *   post:
 *     summary: Create a new marque with optional image upload
 *     tags: [Marques]
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             required:
 *               - name
 *               - idFiliale
 *             properties:
 *               name:
 *                 type: string
 *                 example: "Toyota"
 *                 description: Marque name
 *               idFiliale:
 *                 type: integer
 *                 example: 1
 *                 description: Filiale ID
 *               image:
 *                 type: string
 *                 format: binary
 *                 description: Brand logo image (jpg, jpeg, png, webp, gif - max 5MB)
 *               active:
 *                 type: boolean
 *                 default: true
 *                 description: Active status
 *     responses:
 *       201:
 *         description: Marque created successfully
 *       400:
 *         description: Validation error or Filiale inactive
 *       404:
 *         description: Filiale not found
 */
export const createMarque = async (req, res, next) => {
    try {
        const { name, idFiliale, active = true } = req.body || {};
        
        // Get imageUrl from Cloudinary upload
        const imageUrl = req.file ? req.file.path : null;
        
        const result = await marqueService.createMarque(name, idFiliale, imageUrl, active);
        sendSuccess(res, result, 'Marque created successfully', 201);
    } catch (err) {
        next(new AppError(err.message, err.statusCode || 500));
    }
};

/**
 * @openapi
 * /api/marques/{id}:
 *   get:
 *     summary: Get marque by ID
 *     tags: [Marques]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: Marque ID
 *     responses:
 *       200:
 *         description: Marque found
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 id:
 *                   type: integer
 *                 name:
 *                   type: string
 *                 idFiliale:
 *                   type: integer
 *                 imageUrl:
 *                   type: string
 *                 active:
 *                   type: boolean
 *       404:
 *         description: Marque not found
 */
export const getMarqueById = async (req, res, next) => {
    try {
        const id = Number(req.params.id);
        const marque = await marqueService.getMarqueById(id);
        if (!marque) {
            return next(new AppError('Marque not found', 404));
        }
        sendSuccess(res, marque, 'Marque retrieved successfully');
    } catch (err) {
        next(new AppError(err.message, 500));
    }
};

/**
 * @openapi
 * /api/marques:
 *   get:
 *     summary: List marques with pagination
 *     tags: [Marques]
 *     parameters:
 *       - in: query
 *         name: idFiliale
 *         schema:
 *           type: integer
 *         required: false
 *         description: Optional - Filter by filiale ID
 *       - in: query
 *         name: onlyActive
 *         schema:
 *           type: boolean
 *           default: true
 *         description: Show only active marques
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
 *         description: Items per page
 *     responses:
 *       200:
 *         description: Paginated list of marques
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
export const listMarques = async (req, res, next) => {
    try {
        const idFiliale = req.query.idFiliale ? Number(req.query.idFiliale) : null;
        const onlyActive = parseBoolean(req.query.onlyActive) !== 0;
        const page = Number(req.query.page || 1);
        const pageSize = Number(req.query.pageSize || 10);
        const result = await marqueService.listMarques(idFiliale, onlyActive, page, pageSize);
        sendSuccess(res, result, 'Marques list retrieved successfully');
    } catch (err) {
        next(new AppError(err.message, 500));
    }
};

/**
 * @openapi
 * /api/marques/current-user:
 *   get:
 *     summary: List marques accessible to the connected user (role-based)
 *     tags: [Marques]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: onlyActive
 *         schema:
 *           type: boolean
 *           default: true
 *         description: Show only active marques
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
 *         description: Paginated list of marques for current user
 *       403:
 *         description: User has no associated filiale
 */
export const listMarquesForCurrentUser = async (req, res, next) => {
    try {
        const onlyActive = parseBoolean(req.query.onlyActive) !== 0;
        const page = Number(req.query.page || 1);
        const pageSize = Number(req.query.pageSize || 10);
        const result = await marqueService.listMarquesForCurrentUser(
            req.user,
            onlyActive,
            page,
            pageSize
        );
        sendSuccess(res, result, 'Marques list retrieved successfully');
    } catch (err) {
        next(new AppError(err.message, err.statusCode || 500));
    }
};

/**
 * @openapi
 * /api/marques/by-filiale/{idFiliale}:
 *   get:
 *     summary: List marques by filiale with pagination
 *     tags: [Marques]
 *     parameters:
 *       - in: path
 *         name: idFiliale
 *         required: true
 *         schema:
 *           type: integer
 *         description: Filiale ID
 *       - in: query
 *         name: onlyActive
 *         schema:
 *           type: boolean
 *           default: true
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
 *         description: Paginated list of marques for the filiale
 */
export const listMarquesByFiliale = async (req, res, next) => {
    try {
        const idFiliale = Number(req.params.idFiliale);
        const onlyActive = parseBoolean(req.query.onlyActive) !== 0;
        const page = Number(req.query.page || 1);
        const pageSize = Number(req.query.pageSize || 10);
        const result = await marqueService.listMarquesByFiliale(idFiliale, onlyActive, page, pageSize);
        sendSuccess(res, result, 'Marques by filiale retrieved successfully');
    } catch (err) {
        next(new AppError(err.message, 500));
    }
};

/**
 * @openapi
 * /api/marques/search:
 *   get:
 *     summary: Search marques by name with pagination
 *     tags: [Marques]
 *     parameters:
 *       - in: query
 *         name: search
 *         required: true
 *         schema:
 *           type: string
 *         description: Search term (preferred parameter)
 *       - in: query
 *         name: q
 *         required: false
 *         schema:
 *           type: string
 *         deprecated: true
 *         description: Legacy search parameter
 *       - in: query
 *         name: idFiliale
 *         schema:
 *           type: integer
 *         required: false
 *         description: Optional filiale filter
 *       - in: query
 *         name: onlyActive
 *         schema:
 *           type: boolean
 *           default: true
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
export const searchMarques = async (req, res, next) => {
    try {
        const rawSearch = req.query.search ?? req.query.q ?? '';
        const search = String(rawSearch).trim();
        if (!search) {
            return next(new AppError('Missing search query. Provide ?search= (or legacy ?q=).', 400));
        }

        const idFiliale = req.query.idFiliale ? Number(req.query.idFiliale) : null;
        if (req.query.idFiliale && Number.isNaN(idFiliale)) {
            return next(new AppError('Invalid idFiliale. Must be an integer.', 400));
        }

        const onlyActive = parseBoolean(req.query.onlyActive) !== 0;
        const page = Number(req.query.page || 1);
        const pageSize = Number(req.query.pageSize || 10);
        const result = await marqueService.searchMarques(search, idFiliale, onlyActive, page, pageSize);
        sendSuccess(res, result, 'Search completed successfully');
    } catch (err) {
        next(new AppError(err.message, 500));
    }
};

/**
 * @openapi
 * /api/marques/{id}:
 *   patch:
 *     summary: Update marque with optional image replacement
 *     tags: [Marques]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: Marque ID
 *     requestBody:
 *       required: false
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *                 description: Updated marque name
 *               idFiliale:
 *                 type: integer
 *                 description: Updated filiale ID
 *               image:
 *                 type: string
 *                 format: binary
 *                 description: New brand logo image (replaces existing)
 *               active:
 *                 type: boolean
 *                 description: Active status
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *               idFiliale:
 *                 type: integer
 *               imageUrl:
 *                 type: string
 *                 nullable: true
 *                 description: Set to null to remove image, or keep unchanged
 *               active:
 *                 type: boolean
 *     responses:
 *       200:
 *         description: Marque updated successfully
 *       404:
 *         description: Marque not found
 *       400:
 *         description: Validation error or Filiale inactive
 */
export const updateMarque = async (req, res, next) => {
    try {
        const id = Number(req.params.id);
        const { name = null, idFiliale = null, active = null } = req.body || {};
        
        // Handle imageUrl from file upload or body
        let imageUrl = null;
        if (req.file) {
            imageUrl = req.file.path; // New uploaded image from Cloudinary
        } else if (req.body.imageUrl !== undefined) {
            imageUrl = req.body.imageUrl; // Keep existing or explicitly set to null
        }
        
        const result = await marqueService.updateMarque(id, name, idFiliale, imageUrl, active);
        if (!result) {
            return next(new AppError('Marque not found', 404));
        }
        sendSuccess(res, result, 'Marque updated successfully');
    } catch (err) {
        next(new AppError(err.message, err.statusCode || 500));
    }
};

/**
 * @openapi
 * /api/marques/{id}/activate:
 *   post:
 *     summary: Activate a marque
 *     tags: [Marques]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: Marque ID
 *     responses:
 *       200:
 *         description: Marque activated successfully
 *       404:
 *         description: Marque not found
 */
export const activateMarque = async (req, res, next) => {
    try {
        const id = Number(req.params.id);
        const result = await marqueService.activateMarque(id);
        if (!result) {
            return next(new AppError('Marque not found', 404));
        }
        sendSuccess(res, result, 'Marque activated successfully');
    } catch (err) {
        next(new AppError(err.message, err.statusCode || 500));
    }
};

/**
 * @openapi
 * /api/marques/{id}/deactivate:
 *   post:
 *     summary: Deactivate a marque
 *     tags: [Marques]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: Marque ID
 *     responses:
 *       200:
 *         description: Marque deactivated successfully
 *       404:
 *         description: Marque not found
 */
export const deactivateMarque = async (req, res, next) => {
    try {
        const id = Number(req.params.id);
        const result = await marqueService.deactivateMarque(id);
        if (!result) {
            return next(new AppError('Marque not found', 404));
        }
        sendSuccess(res, result, 'Marque deactivated successfully');
    } catch (err) {
        next(new AppError(err.message, err.statusCode || 500));
    }
};
