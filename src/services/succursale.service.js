// src/services/succursale.service.js

import { sequelize } from '../config/database.js';
import { SQL } from '../sql/snippets.js';
import { QueryTypes } from 'sequelize';
import { sanitizeSearchQuery } from '../helpers/queryHelpers.js';
import { getFirstResult, prepareStoredProcParams } from '../helpers/databaseHelpers.js';

/**
 * Create a new succursale
 */
export async function createSuccursale(name, active = true) {
  const params = prepareStoredProcParams({
    name: name.trim(),
    active: active ? 1 : 0
  });

  try {
    const result = await sequelize.query(SQL.SUCCURSALE.SUCCURSALE_CREATE, {
      replacements: params,
      type: QueryTypes.SELECT
    });

    const idRow = Array.isArray(result) ? result.find(r => typeof r?.id !== 'undefined') : null;
    const newId = idRow?.id;
    if (!newId) throw new Error('Create operation did not return new ID');

    const createdSuccursale = await getSuccursaleById(newId);
    return createdSuccursale || { id: Number(newId), name: name.trim(), active: !!active };
  } catch (error) {
    console.error('Error creating succursale:', error);
    throw error;
  }
}

/**
 * Get succursale by ID
 */
export async function getSuccursaleById(id) {
  const rows = await sequelize.query(SQL.SUCCURSALE.SUCCURSALE_GET_BY_ID, {
    replacements: { id: Number(id) },
    type: QueryTypes.SELECT
  });
  return getFirstResult(rows);
}

/**
 * List succursales
 */
export async function listSuccursales(onlyActive = true) {
  const params = prepareStoredProcParams({ onlyActive: onlyActive ? 1 : 0 });
  const rows = await sequelize.query(SQL.SUCCURSALE.SUCCURSALE_LIST, {
    replacements: params,
    type: QueryTypes.SELECT
  });
  return rows || [];
}

/**
 * Search succursales
 */
export async function searchSuccursales(searchTerm, onlyActive = true) {
  const sanitizedSearch = sanitizeSearchQuery(searchTerm);
  if (!sanitizedSearch) return [];
  const params = prepareStoredProcParams({ q: sanitizedSearch, onlyActive: onlyActive ? 1 : 0 });
  const rows = await sequelize.query(SQL.SUCCURSALE.SUCCURSALE_SEARCH, {
    replacements: params,
    type: QueryTypes.SELECT
  });
  return rows || [];
}

/**
 * Update succursale
 */
export async function updateSuccursale(id, name = null, active = null) {
  const params = prepareStoredProcParams({
    id: Number(id),
    name: name ? name.trim() : null,
    active: active === null ? null : (active ? 1 : 0)
  });

  try {
    const rows = await sequelize.query(SQL.SUCCURSALE.SUCCURSALE_UPDATE, {
      replacements: params,
      type: QueryTypes.SELECT
    });
    return getFirstResult(rows);
  } catch (error) {
    console.error('Error updating succursale:', error);
    throw error;
  }
}

/**
 * Activate succursale
 */
export async function activateSuccursale(id) {
  try {
    const rows = await sequelize.query(SQL.SUCCURSALE.SUCCURSALE_ACTIVATE, {
      replacements: { id: Number(id) },
      type: QueryTypes.SELECT
    });
    return getFirstResult(rows);
  } catch (error) {
    console.error('Error activating succursale:', error);
    throw error;
  }
}

/**
 * Deactivate succursale
 */
export async function deactivateSuccursale(id) {
  try {
    const rows = await sequelize.query(SQL.SUCCURSALE.SUCCURSALE_DEACTIVATE, {
      replacements: { id: Number(id) },
      type: QueryTypes.SELECT
    });
    return getFirstResult(rows);
  } catch (error) {
    console.error('Error deactivating succursale:', error);
    throw error;
  }
}
