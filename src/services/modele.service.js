// src/services/modele.service.js

import { sequelize } from '../config/database.js';
import { SQL } from '../sql/snippets.js';
import { QueryTypes } from 'sequelize';
import { sanitizeSearchQuery } from '../helpers/queryHelpers.js';
import {
  getFirstResult,
  prepareStoredProcParams
} from '../helpers/databaseHelpers.js';
import { processPaginatedResult } from '../helpers/queryHelpers.js';

/**
 * Create a new modele
 * @param {string} name - Modele name
 * @param {number} idMarque - Marque ID
 * @param {string|null} imageUrl - Image URL
 * @param {boolean} active - Active status
 * @returns {Object} Created modele
 */
export async function createModele(name, idMarque, imageUrl = null, active = true) {
  const params = prepareStoredProcParams({
    name: name.trim(),
    idMarque: Number(idMarque),
    imageUrl: imageUrl ? imageUrl.trim() : null,
    active: active ? 1 : 0
  });

  try {
    const result = await sequelize.query(SQL.MODELE.MODELE_CREATE, {
      replacements: params,
      type: QueryTypes.SELECT
    });

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
      imageUrl: imageUrl ? imageUrl.trim() : null,
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
 * List modeles with optional filters and pagination
 * @param {number|null} idMarque - Optional marque filter
 * @param {boolean} onlyActive - Filter for active modeles only
 * @param {number} page - Page number
 * @param {number} pageSize - Records per page
 * @returns {Object} Paginated modeles
 */
export async function listModeles(idMarque = null, onlyActive = true, page = 1, pageSize = 10) {
  const params = prepareStoredProcParams({
    idMarque: idMarque ? Number(idMarque) : null,
    onlyActive: onlyActive ? 1 : 0,
    pageNumber: Number(page),
    pageSize: Number(pageSize)
  });

  try {
    const rows = await sequelize.query(SQL.MODELE.MODELE_LIST, {
      replacements: params,
      type: QueryTypes.SELECT
    });
    return processPaginatedResult(rows, page, pageSize);
  } catch (error) {
    console.error('Error in listModeles service:', error);
    throw error;
  }
}

/**
 * List modeles by marque with pagination
 * @param {number} idMarque - Marque ID
 * @param {boolean} onlyActive - Filter for active modeles only
 * @param {number} page - Page number
 * @param {number} pageSize - Records per page
 * @returns {Object} Paginated modeles
 */
export async function listModelesByMarque(idMarque, onlyActive = true, page = 1, pageSize = 10) {
  const params = prepareStoredProcParams({
    idMarque: Number(idMarque),
    onlyActive: onlyActive ? 1 : 0,
    pageNumber: Number(page),
    pageSize: Number(pageSize)
  });

  try {
    const rows = await sequelize.query(SQL.MODELE.MODELE_LIST_BY_MARQUE, {
      replacements: params,
      type: QueryTypes.SELECT
    });
    return processPaginatedResult(rows, page, pageSize);
  } catch (error) {
    console.error('Error in listModelesByMarque service:', error);
    throw error;
  }
}

/**
 * Search modeles with pagination
 * @param {string} searchTerm - Search term
 * @param {number|null} idMarque - Optional marque filter
 * @param {boolean} onlyActive - Filter for active modeles only
 * @param {number} page - Page number
 * @param {number} pageSize - Records per page
 * @returns {Object} Paginated search results
 */
export async function searchModeles(searchTerm, idMarque = null, onlyActive = true, page = 1, pageSize = 10) {
  const sanitizedSearch = sanitizeSearchQuery(searchTerm);
  if (!sanitizedSearch) {
    return {
      data: [],
      pagination: {
        page: Number(page),
        pageSize: Number(pageSize),
        totalRecords: 0,
        totalPages: 0
      }
    };
  }

  const params = prepareStoredProcParams({
    q: sanitizedSearch,
    idMarque: idMarque ? Number(idMarque) : null,
    onlyActive: onlyActive ? 1 : 0,
    pageNumber: Number(page),
    pageSize: Number(pageSize)
  });

  try {
    const rows = await sequelize.query(SQL.MODELE.MODELE_SEARCH, {
      replacements: params,
      type: QueryTypes.SELECT
    });
    return processPaginatedResult(rows, page, pageSize);
  } catch (error) {
    console.error('Error in searchModeles service:', error);
    throw error;
  }
}

/**
 * Update modele
 * @param {number} id - Modele ID
 * @param {string|null} name - Modele name
 * @param {number|null} idMarque - Marque ID
 * @param {string|null} imageUrl - Image URL
 * @param {boolean|null} active - Active status
 * @returns {Object|null} Updated modele
 */
export async function updateModele(id, name = null, idMarque = null, imageUrl = null, active = null) {
  const params = prepareStoredProcParams({
    id: Number(id),
    name: name ? name.trim() : null,
    idMarque: idMarque !== null ? Number(idMarque) : null,
    imageUrl: imageUrl !== null ? (imageUrl ? imageUrl.trim() : null) : null,
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
