// src/services/version.service.js

import { sequelize } from '../config/database.js';
import { SQL } from '../sql/snippets.js';
import { QueryTypes } from 'sequelize';
import { sanitizeSearchQuery } from '../helpers/queryHelpers.js';
import { getFirstResult, prepareStoredProcParams } from '../helpers/databaseHelpers.js';

/**
 * Create a new version
 */
export async function createVersion(name, idModele, active = true) {
  const params = prepareStoredProcParams({
    name: name.trim(),
    idModele: Number(idModele),
    active: active ? 1 : 0
  });

  try {
    const result = await sequelize.query(SQL.VERSION.VERSION_CREATE, {
      replacements: params,
      type: QueryTypes.SELECT
    });

    const idRow = Array.isArray(result) ? result.find(r => typeof r?.id !== 'undefined') : null;
    const newId = idRow?.id;
    if (!newId) throw new Error('Create operation did not return new ID');

    const createdVersion = await getVersionById(newId);
    return createdVersion || {
      id: Number(newId),
      name: name.trim(),
      idModele: Number(idModele),
      active: !!active
    };
  } catch (error) {
    console.error('Error creating version:', error);
    throw error;
  }
}

/**
 * Get version by ID
 */
export async function getVersionById(id) {
  const rows = await sequelize.query(SQL.VERSION.VERSION_GET_BY_ID, {
    replacements: { id: Number(id) },
    type: QueryTypes.SELECT
  });
  return getFirstResult(rows);
}

/**
 * List versions
 */
export async function listVersions(idModele = null, onlyActive = true) {
  const params = prepareStoredProcParams({
    idModele: idModele ? Number(idModele) : null,
    onlyActive: onlyActive ? 1 : 0
  });

  const rows = await sequelize.query(SQL.VERSION.VERSION_LIST, {
    replacements: params,
    type: QueryTypes.SELECT
  });
  return rows || [];
}

/**
 * List versions by modele
 */
export async function listVersionsByModele(idModele, onlyActive = true) {
  const params = prepareStoredProcParams({
    idModele: Number(idModele),
    onlyActive: onlyActive ? 1 : 0
  });

  const rows = await sequelize.query(SQL.VERSION.VERSION_LIST_BY_MODELE, {
    replacements: params,
    type: QueryTypes.SELECT
  });
  return rows || [];
}

/**
 * Search versions
 */
export async function searchVersions(searchTerm, idModele = null, onlyActive = true) {
  const sanitizedSearch = sanitizeSearchQuery(searchTerm);
  if (!sanitizedSearch) return [];

  const params = prepareStoredProcParams({
    q: sanitizedSearch,
    idModele: idModele ? Number(idModele) : null,
    onlyActive: onlyActive ? 1 : 0
  });

  const rows = await sequelize.query(SQL.VERSION.VERSION_SEARCH, {
    replacements: params,
    type: QueryTypes.SELECT
  });
  return rows || [];
}

/**
 * Update version
 */
export async function updateVersion(id, name = null, idModele = null, active = null) {
  const params = prepareStoredProcParams({
    id: Number(id),
    name: name ? name.trim() : null,
    idModele: idModele !== null ? Number(idModele) : null,
    active: active === null ? null : (active ? 1 : 0)
  });

  try {
    const rows = await sequelize.query(SQL.VERSION.VERSION_UPDATE, {
      replacements: params,
      type: QueryTypes.SELECT
    });
    return getFirstResult(rows);
  } catch (error) {
    console.error('Error updating version:', error);
    throw error;
  }
}

/**
 * Activate version
 */
export async function activateVersion(id) {
  try {
    const rows = await sequelize.query(SQL.VERSION.VERSION_ACTIVATE, {
      replacements: { id: Number(id) },
      type: QueryTypes.SELECT
    });
    return getFirstResult(rows);
  } catch (error) {
    console.error('Error activating version:', error);
    throw error;
  }
}

/**
 * Deactivate version
 */
export async function deactivateVersion(id) {
  try {
    const rows = await sequelize.query(SQL.VERSION.VERSION_DEACTIVATE, {
      replacements: { id: Number(id) },
      type: QueryTypes.SELECT
    });
    return getFirstResult(rows);
  } catch (error) {
    console.error('Error deactivating version:', error);
    throw error;
  }
}
