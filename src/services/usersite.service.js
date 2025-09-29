// src/services/usersite.service.js

import { sequelize } from '../config/database.js';
import { SQL } from '../sql/snippets.js';
import { QueryTypes } from 'sequelize';
import { sanitizeSearchQuery } from '../helpers/queryHelpers.js';
import { getFirstResult, prepareStoredProcParams } from '../helpers/databaseHelpers.js';

/**
 * Create a new usersite mapping
 */
export async function createUserSite(idGroupement, idSite, active = true) {
  const params = prepareStoredProcParams({
    idGroupement: Number(idGroupement),
    idSite: Number(idSite),
    active: active ? 1 : 0
  });

  try {
    const result = await sequelize.query(SQL.USERSITE.USERSITE_CREATE, {
      replacements: params,
      type: QueryTypes.SELECT
    });

    const newIdRow = Array.isArray(result) ? result.find(r => typeof r?.NewId !== 'undefined') : null;
    const newId = newIdRow?.NewId;
    if (!newId) throw new Error('Create operation did not return new ID');

    const createdUserSite = await getUserSiteById(newId);
    return createdUserSite || {
      id: Number(newId),
      idGroupement: Number(idGroupement),
      idSite: Number(idSite),
      active: !!active
    };
  } catch (error) {
    console.error('Error creating usersite:', error);
    throw error;
  }
}

/**
 * Get usersite by ID
 */
export async function getUserSiteById(id) {
  const rows = await sequelize.query(SQL.USERSITE.USERSITE_GET_BY_ID, {
    replacements: { id: Number(id) },
    type: QueryTypes.SELECT
  });
  return getFirstResult(rows);
}

/**
 * List all usersites
 */
export async function listUserSites() {
  const rows = await sequelize.query(SQL.USERSITE.USERSITE_GET_ALL, {
    type: QueryTypes.SELECT
  });
  return rows || [];
}

/**
 * Search usersites with multiple criteria
 */
export async function searchUserSites(filters = {}) {
  const {
    idGroupement = null,
    groupement_name = null,
    idSite = null,
    site_type = null,
    onlyActive = null
  } = filters;

  const params = prepareStoredProcParams({
    idGroupement: idGroupement ? Number(idGroupement) : null,
    groupement_name: groupement_name ? sanitizeSearchQuery(groupement_name) : null,
    idSite: idSite ? Number(idSite) : null,
    site_type: site_type ? site_type.trim() : null,
    onlyActive: onlyActive === null ? null : (onlyActive ? 1 : 0)
  });

  const rows = await sequelize.query(SQL.USERSITE.USERSITE_SEARCH, {
    replacements: params,
    type: QueryTypes.SELECT
  });
  return rows || [];
}

/**
 * List usersites by groupement
 */
export async function listUserSitesByGroupement(idGroupement) {
  const rows = await sequelize.query(SQL.USERSITE.USERSITE_BY_GROUPEMENT, {
    replacements: { idGroupement: Number(idGroupement) },
    type: QueryTypes.SELECT
  });
  return rows || [];
}

/**
 * List usersites by site
 */
export async function listUserSitesBySite(idSite) {
  const rows = await sequelize.query(SQL.USERSITE.USERSITE_BY_SITE, {
    replacements: { idSite: Number(idSite) },
    type: QueryTypes.SELECT
  });
  return rows || [];
}

/**
 * Update usersite
 */
export async function updateUserSite(id, idGroupement, idSite, active) {
  const params = prepareStoredProcParams({
    id: Number(id),
    idGroupement: Number(idGroupement),
    idSite: Number(idSite),
    active: active ? 1 : 0
  });

  try {
    await sequelize.query(SQL.USERSITE.USERSITE_UPDATE, {
      replacements: params,
      type: QueryTypes.RAW
    });
    return await getUserSiteById(id);
  } catch (error) {
    console.error('Error updating usersite:', error);
    throw error;
  }
}

/**
 * Activate usersite
 */
export async function activateUserSite(id) {
  try {
    await sequelize.query(SQL.USERSITE.USERSITE_ACTIVATE, {
      replacements: { id: Number(id) },
      type: QueryTypes.RAW
    });
    return await getUserSiteById(id);
  } catch (error) {
    console.error('Error activating usersite:', error);
    throw error;
  }
}

/**
 * Deactivate usersite
 */
export async function deactivateUserSite(id) {
  try {
    await sequelize.query(SQL.USERSITE.USERSITE_DEACTIVATE, {
      replacements: { id: Number(id) },
      type: QueryTypes.RAW
    });
    return await getUserSiteById(id);
  } catch (error) {
    console.error('Error deactivating usersite:', error);
    throw error;
  }
}
