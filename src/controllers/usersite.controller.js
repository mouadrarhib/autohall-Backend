// src/controllers/usersite.controller.js

import { asyncHandler } from '../helpers/asyncHandler.js';
import { mapSqlError } from '../helpers/sqlErrorMapper.js';
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
export const createUserSite = asyncHandler(async (req, res) => {
  const { idGroupement, idSite, active = true } = req.body || {};

  try {
    const result = await usersiteService.createUserSite(idGroupement, idSite, active);
    res.locals.objectId = result.id; // for audit
    res.status(201).json({ data: result });
  } catch (err) {
    const { status, message } = mapSqlError(err);
    res.status(status).json({ error: message });
  }
});

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
export const getUserSiteById = asyncHandler(async (req, res) => {
  const id = Number(req.params.id);
  const usersite = await usersiteService.getUserSiteById(id);
  
  if (!usersite) {
    return res.status(404).json({ error: 'UserSite not found' });
  }
  
  res.json({ data: usersite });
});

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
export const listUserSites = asyncHandler(async (req, res) => {
  const usersites = await usersiteService.listUserSites();
  res.json({ data: usersites });
});

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
export const searchUserSites = asyncHandler(async (req, res) => {
  const { idGroupement, groupement_name, idSite, site_type, onlyActive } = req.query;
  
  const filters = {
    idGroupement: parseInteger(idGroupement),
    groupement_name: groupement_name ? groupement_name.toString().trim() : null,
    idSite: parseInteger(idSite),
    site_type: site_type ? site_type.toString().trim() : null,
    onlyActive: parseBoolean(onlyActive)
  };
  
  const results = await usersiteService.searchUserSites(filters);
  res.json({ data: results });
});

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
export const listUserSitesByGroupement = asyncHandler(async (req, res) => {
  const idGroupement = Number(req.params.idGroupement);
  const usersites = await usersiteService.listUserSitesByGroupement(idGroupement);
  res.json({ data: usersites });
});

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
export const listUserSitesBySite = asyncHandler(async (req, res) => {
  const idSite = Number(req.params.idSite);
  const usersites = await usersiteService.listUserSitesBySite(idSite);
  res.json({ data: usersites });
});

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
export const updateUserSite = asyncHandler(async (req, res) => {
  const id = Number(req.params.id);
  const { idGroupement, idSite, active } = req.body || {};

  try {
    const result = await usersiteService.updateUserSite(id, idGroupement, idSite, active);
    
    if (!result) {
      return res.status(404).json({ error: 'UserSite not found' });
    }
    
    res.locals.objectId = id; // for audit
    res.json({ data: result });
  } catch (err) {
    const { status, message } = mapSqlError(err);
    res.status(status).json({ error: message });
  }
});

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
export const activateUserSite = asyncHandler(async (req, res) => {
  const id = Number(req.params.id);

  try {
    const result = await usersiteService.activateUserSite(id);
    
    if (!result) {
      return res.status(404).json({ error: 'UserSite not found' });
    }
    
    res.locals.objectId = id; // for audit
    res.json({ data: result });
  } catch (err) {
    const { status, message } = mapSqlError(err);
    res.status(status).json({ error: message });
  }
});

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
export const deactivateUserSite = asyncHandler(async (req, res) => {
  const id = Number(req.params.id);

  try {
    const result = await usersiteService.deactivateUserSite(id);
    
    if (!result) {
      return res.status(404).json({ error: 'UserSite not found' });
    }
    
    res.locals.objectId = id; // for audit
    res.json({ data: result });
  } catch (err) {
    const { status, message } = mapSqlError(err);
    res.status(status).json({ error: message });
  }
});
