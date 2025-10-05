// src/controllers/usersite.controller.js

import { AppError, sendSuccess } from '../middlewares/responseHandler.js';
import { parseBoolean, parseInteger } from '../helpers/queryHelpers.js';
import * as usersiteService from '../services/usersite.service.js';

/**
 * @openapi
 * tags:
 *   - name: UserSites
 *     description: UserSite mapping between Groupement and Filiale/Succursale
 */

/**
 * @openapi
 * /api/user-sites:
 *   post:
 *     summary: Create a new UserSite mapping
 *     tags: [UserSites]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - idGroupement
 *               - idSite
 *             properties:
 *               idGroupement:
 *                 type: integer
 *                 example: 1
 *               idSite:
 *                 type: integer
 *                 example: 5
 *               active:
 *                 type: boolean
 *                 default: true
 *     responses:
 *       201:
 *         description: UserSite created successfully
 *       400:
 *         description: Validation error
 *       404:
 *         description: Referenced entity not found
 */
export const createUserSite = async (req, res, next) => {
  try {
    const { idGroupement, idSite, active = true } = req.body || {};
    const result = await usersiteService.createUserSite(idGroupement, idSite, active);
    res.locals.objectId = result.id; // for audit
    sendSuccess(res, result, 'UserSite created successfully', 201);
  } catch (err) {
    next(new AppError(err.message, err.statusCode || 500));
  }
};

/**
 * @openapi
 * /api/user-sites/{id}:
 *   get:
 *     summary: Get UserSite by ID
 *     tags: [UserSites]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: UserSite found
 *       404:
 *         description: UserSite not found
 */
export const getUserSiteById = async (req, res, next) => {
  try {
    const id = Number(req.params.id);
    const usersite = await usersiteService.getUserSiteById(id);
    
    if (!usersite) {
      return next(new AppError('UserSite not found', 404));
    }
    
    sendSuccess(res, usersite, 'UserSite retrieved successfully');
  } catch (err) {
    next(new AppError(err.message, 500));
  }
};

/**
 * @openapi
 * /api/user-sites:
 *   get:
 *     summary: List all UserSites
 *     tags: [UserSites]
 *     responses:
 *       200:
 *         description: List of UserSites
 */
export const listUserSites = async (req, res, next) => {
  try {
    const usersites = await usersiteService.listUserSites();
    sendSuccess(res, usersites, 'UserSites list retrieved successfully');
  } catch (err) {
    next(new AppError(err.message, 500));
  }
};

/**
 * @openapi
 * /api/user-sites/search:
 *   get:
 *     summary: Search UserSites with multiple criteria
 *     tags: [UserSites]
 *     parameters:
 *       - in: query
 *         name: idGroupement
 *         schema:
 *           type: integer
 *           nullable: true
 *       - in: query
 *         name: groupement_name
 *         schema:
 *           type: string
 *           nullable: true
 *       - in: query
 *         name: idSite
 *         schema:
 *           type: integer
 *           nullable: true
 *       - in: query
 *         name: site_type
 *         schema:
 *           type: string
 *           enum: [Filiale, Succursale]
 *           nullable: true
 *       - in: query
 *         name: onlyActive
 *         schema:
 *           type: boolean
 *           nullable: true
 *     responses:
 *       200:
 *         description: Search results
 */
export const searchUserSites = async (req, res, next) => {
  try {
    const { idGroupement, groupement_name, idSite, site_type, onlyActive } = req.query;
    const filters = {
      idGroupement: parseInteger(idGroupement),
      groupement_name: groupement_name ? groupement_name.toString().trim() : null,
      idSite: parseInteger(idSite),
      site_type: site_type ? site_type.toString().trim() : null,
      onlyActive: parseBoolean(onlyActive)
    };
    const results = await usersiteService.searchUserSites(filters);
    sendSuccess(res, results, 'Search completed successfully');
  } catch (err) {
    next(new AppError(err.message, 500));
  }
};

/**
 * @openapi
 * /api/user-sites/by-groupement/{idGroupement}:
 *   get:
 *     summary: List UserSites by Groupement
 *     tags: [UserSites]
 *     parameters:
 *       - in: path
 *         name: idGroupement
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: List of UserSites for the groupement
 */
export const listUserSitesByGroupement = async (req, res, next) => {
  try {
    const idGroupement = Number(req.params.idGroupement);
    const usersites = await usersiteService.listUserSitesByGroupement(idGroupement);
    sendSuccess(res, usersites, 'UserSites by groupement retrieved successfully');
  } catch (err) {
    next(new AppError(err.message, 500));
  }
};

/**
 * @openapi
 * /api/user-sites/by-site/{idSite}:
 *   get:
 *     summary: List UserSites by Site
 *     tags: [UserSites]
 *     parameters:
 *       - in: path
 *         name: idSite
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: List of UserSites for the site
 */
export const listUserSitesBySite = async (req, res, next) => {
  try {
    const idSite = Number(req.params.idSite);
    const usersites = await usersiteService.listUserSitesBySite(idSite);
    sendSuccess(res, usersites, 'UserSites by site retrieved successfully');
  } catch (err) {
    next(new AppError(err.message, 500));
  }
};

/**
 * @openapi
 * /api/user-sites/{id}:
 *   patch:
 *     summary: Update UserSite
 *     tags: [UserSites]
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
 *             required:
 *               - idGroupement
 *               - idSite
 *               - active
 *             properties:
 *               idGroupement:
 *                 type: integer
 *               idSite:
 *                 type: integer
 *               active:
 *                 type: boolean
 *     responses:
 *       200:
 *         description: UserSite updated
 *       404:
 *         description: UserSite not found
 */
export const updateUserSite = async (req, res, next) => {
  try {
    const id = Number(req.params.id);
    const { idGroupement, idSite, active } = req.body || {};
    const result = await usersiteService.updateUserSite(id, idGroupement, idSite, active);
    
    if (!result) {
      return next(new AppError('UserSite not found', 404));
    }
    
    res.locals.objectId = id; // for audit
    sendSuccess(res, result, 'UserSite updated successfully');
  } catch (err) {
    next(new AppError(err.message, err.statusCode || 500));
  }
};

/**
 * @openapi
 * /api/user-sites/{id}/activate:
 *   post:
 *     summary: Activate UserSite
 *     tags: [UserSites]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: UserSite activated
 *       404:
 *         description: UserSite not found
 */
export const activateUserSite = async (req, res, next) => {
  try {
    const id = Number(req.params.id);
    const result = await usersiteService.activateUserSite(id);
    
    if (!result) {
      return next(new AppError('UserSite not found', 404));
    }
    
    res.locals.objectId = id; // for audit
    sendSuccess(res, result, 'UserSite activated successfully');
  } catch (err) {
    next(new AppError(err.message, err.statusCode || 500));
  }
};

/**
 * @openapi
 * /api/user-sites/{id}/deactivate:
 *   post:
 *     summary: Deactivate UserSite
 *     tags: [UserSites]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: UserSite deactivated
 *       404:
 *         description: UserSite not found
 */
export const deactivateUserSite = async (req, res, next) => {
  try {
    const id = Number(req.params.id);
    const result = await usersiteService.deactivateUserSite(id);
    
    if (!result) {
      return next(new AppError('UserSite not found', 404));
    }
    
    res.locals.objectId = id; // for audit
    sendSuccess(res, result, 'UserSite deactivated successfully');
  } catch (err) {
    next(new AppError(err.message, err.statusCode || 500));
  }
};
