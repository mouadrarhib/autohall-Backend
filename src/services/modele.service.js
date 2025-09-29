// src/services/modele.service.js

import { sequelize } from '../config/database.js';
import { SQL } from '../sql/snippets.js';
import { QueryTypes } from 'sequelize';
import { sanitizeSearchQuery } from '../helpers/queryHelpers.js';
import { getFirstResult, prepareStoredProcParams } from '../helpers/databaseHelpers.js';

/**
 * Create a new modele
 * @param {string} name - Modele name
 * @param {number} idMarque - Marque ID
 * @param {boolean} active - Active status
 * @returns {Object} Created modele
 */
export async function createModele(name, idMarque, active = true) {
  const params = prepareStoredProcParams({
    name: name.trim(),
    idMarque: Number(idMarque),
    active: active ? 1 : 0
  });

  try {
    const result = await sequelize.query(SQL.MODELE.MODELE_CREATE, {
      replacements: params,
      type: QueryTypes.SELECT
    });

    // sp_Modele_Create SELECTs { id: NewId }
    const idRow = Array.isArray(result) ? result.find(r => typeof r?.id !== 'undefined') : null;
    const newId = idRow?.id;
    if (!newId) {
      throw new Error('Create operation did not return new ID');
    }

    const createdModele = await getModeleById(newId);
    return createdModele || {
      id: Number(newId),
      name: name.trim(),
      idMarque: Number(idMarque),
      active: !!active
    };
  } catch (error) {
    console.error('Error creating modele:', error);
    throw error;
  }
}

/**
 * Get modele by ID
 * @param {number} id - Modele ID
 * @returns {Object|null} Modele data or null
 */
export async function getModeleById(id) {
  const rows = await sequelize.query(SQL.MODELE.MODELE_GET_BY_ID, {
    replacements: { id: Number(id) },
    type: QueryTypes.SELECT
  });
  return getFirstResult(rows);
}

/**
 * List modeles with optional filters
 * @param {number|null} idMarque - Optional marque filter
 * @param {boolean} onlyActive - Filter for active modeles only
 * @returns {Array} Array of modeles
 */
export async function listModeles(idMarque = null, onlyActive = true) {
  const params = prepareStoredProcParams({
    idMarque: idMarque ? Number(idMarque) : null,
    onlyActive: onlyActive ? 1 : 0
  });

  const rows = await sequelize.query(SQL.MODELE.MODELE_LIST, {
    replacements: params,
    type: QueryTypes.SELECT
  });
  return rows || [];
}

/**
 * List modeles by marque
 * @param {number} idMarque - Marque ID
 * @param {boolean} onlyActive - Filter for active modeles only
 * @returns {Array} Array of modeles
 */
export async function listModelesByMarque(idMarque, onlyActive = true) {
  const params = prepareStoredProcParams({
    idMarque: Number(idMarque),
    onlyActive: onlyActive ? 1 : 0
  });

  const rows = await sequelize.query(SQL.MODELE.MODELE_LIST_BY_MARQUE, {
    replacements: params,
    type: QueryTypes.SELECT
  });
  return rows || [];
}

/**
 * Search modeles
 * @param {string} searchTerm - Search term
 * @param {number|null} idMarque - Optional marque filter
 * @param {boolean} onlyActive - Filter for active modeles only
 * @returns {Array} Array of matching modeles
 */
export async function searchModeles(searchTerm, idMarque = null, onlyActive = true) {
  const sanitizedSearch = sanitizeSearchQuery(searchTerm);
  if (!sanitizedSearch) {
    return [];
  }

  const params = prepareStoredProcParams({
    q: sanitizedSearch,
    idMarque: idMarque ? Number(idMarque) : null,
    onlyActive: onlyActive ? 1 : 0
  });

  const rows = await sequelize.query(SQL.MODELE.MODELE_SEARCH, {
    replacements: params,
    type: QueryTypes.SELECT
  });
  return rows || [];
}

/**
 * Update modele
 * @param {number} id - Modele ID
 * @param {string|null} name - Modele name
 * @param {number|null} idMarque - Marque ID
 * @param {boolean|null} active - Active status
 * @returns {Object|null} Updated modele
 */
export async function updateModele(id, name = null, idMarque = null, active = null) {
  const params = prepareStoredProcParams({
    id: Number(id),
    name: name ? name.trim() : null,
    idMarque: idMarque !== null ? Number(idMarque) : null,
    active: active === null ? null : (active ? 1 : 0)
  });

  try {
    const rows = await sequelize.query(SQL.MODELE.MODELE_UPDATE, {
      replacements: params,
      type: QueryTypes.SELECT
    });
    return getFirstResult(rows);
  } catch (error) {
    console.error('Error updating modele:', error);
    throw error;
  }
}

/**
 * Activate modele
 * @param {number} id - Modele ID
 * @returns {Object|null} Updated modele
 */
export async function activateModele(id) {
  try {
    const rows = await sequelize.query(SQL.MODELE.MODELE_ACTIVATE, {
      replacements: { id: Number(id) },
      type: QueryTypes.SELECT
    });
    return getFirstResult(rows);
  } catch (error) {
    console.error('Error activating modele:', error);
    throw error;
  }
}

/**
 * Deactivate modele
 * @param {number} id - Modele ID
 * @returns {Object|null} Updated modele
 */
export async function deactivateModele(id) {
  try {
    const rows = await sequelize.query(SQL.MODELE.MODELE_DEACTIVATE, {
      replacements: { id: Number(id) },
      type: QueryTypes.SELECT
    });
    return getFirstResult(rows);
  } catch (error) {
    console.error('Error deactivating modele:', error);
    throw error;
  }
}
