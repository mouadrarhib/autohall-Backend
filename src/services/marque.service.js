// src/services/marque.service.js

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
 * Create a new marque
 * @param {string} name
 * @param {number} idFiliale
 * @param {string|null} imageUrl
 * @param {boolean} active
 */
export async function createMarque(name, idFiliale, imageUrl = null, active = true) {
  const params = prepareStoredProcParams({
    name: name.trim(),
    idFiliale: Number(idFiliale),
    imageUrl: imageUrl ? imageUrl.trim() : null,
    active: active ? 1 : 0
  });

  try {
    const result = await sequelize.query(SQL.MARQUE.MARQUE_CREATE, {
      replacements: params,
      type: QueryTypes.SELECT
    });

    const idRow = Array.isArray(result) ? result.find(r => typeof r?.id !== 'undefined') : null;
    const newId = idRow?.id;

    if (!newId) {
      throw new Error('Create operation did not return new ID');
    }

    const createdMarque = await getMarqueById(newId);
    return createdMarque || {
      id: Number(newId),
      name: name.trim(),
      idFiliale: Number(idFiliale),
      imageUrl: imageUrl ? imageUrl.trim() : null,
      active: !!active
    };
  } catch (error) {
    console.error('Error creating marque:', error);
    throw error;
  }
}

/**
 * Get marque by ID
 */
export async function getMarqueById(id) {
  const rows = await sequelize.query(SQL.MARQUE.MARQUE_GET_BY_ID, {
    replacements: { id: Number(id) },
    type: QueryTypes.SELECT
  });
  return getFirstResult(rows);
}

/**
 * List marques with optional filters and pagination
 */
export async function listMarques(idFiliale = null, onlyActive = true, page = 1, pageSize = 10) {
  const params = prepareStoredProcParams({
    idFiliale: idFiliale ? Number(idFiliale) : null,
    onlyActive: onlyActive ? 1 : 0,
    pageNumber: Number(page),
    pageSize: Number(pageSize)
  });

  try {
    const rows = await sequelize.query(SQL.MARQUE.MARQUE_LIST, {
      replacements: params,
      type: QueryTypes.SELECT
    });
    return processPaginatedResult(rows, page, pageSize);
  } catch (error) {
    console.error('Error in listMarques service:', error);
    throw error;
  }
}

/**
 * List marques by filiale with pagination
 */
export async function listMarquesByFiliale(idFiliale, onlyActive = true, page = 1, pageSize = 10) {
  const params = prepareStoredProcParams({
    idFiliale: Number(idFiliale),
    onlyActive: onlyActive ? 1 : 0,
    pageNumber: Number(page),
    pageSize: Number(pageSize)
  });

  try {
    const rows = await sequelize.query(SQL.MARQUE.MARQUE_LIST_BY_FILIALE, {
      replacements: params,
      type: QueryTypes.SELECT
    });
    return processPaginatedResult(rows, page, pageSize);
  } catch (error) {
    console.error('Error in listMarquesByFiliale service:', error);
    throw error;
  }
}

/**
 * Search marques with pagination
 */
export async function searchMarques(searchTerm, idFiliale = null, onlyActive = true, page = 1, pageSize = 10) {
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
    idFiliale: idFiliale ? Number(idFiliale) : null,
    onlyActive: onlyActive ? 1 : 0,
    pageNumber: Number(page),
    pageSize: Number(pageSize)
  });

  try {
    const rows = await sequelize.query(SQL.MARQUE.MARQUE_SEARCH, {
      replacements: params,
      type: QueryTypes.SELECT
    });
    return processPaginatedResult(rows, page, pageSize);
  } catch (error) {
    console.error('Error in searchMarques service:', error);
    throw error;
  }
}

/**
 * Update marque
 */
export async function updateMarque(id, name = null, idFiliale = null, imageUrl = null, active = null) {
  const params = prepareStoredProcParams({
    id: Number(id),
    name: name ? name.trim() : null,
    idFiliale: idFiliale !== null ? Number(idFiliale) : null,
    imageUrl: imageUrl !== null ? (imageUrl ? imageUrl.trim() : null) : null,
    active: active === null ? null : (active ? 1 : 0)
  });

  try {
    const rows = await sequelize.query(SQL.MARQUE.MARQUE_UPDATE, {
      replacements: params,
      type: QueryTypes.SELECT
    });
    return getFirstResult(rows);
  } catch (error) {
    console.error('Error updating marque:', error);
    throw error;
  }
}

/**
 * Activate marque
 */
export async function activateMarque(id) {
  try {
    const rows = await sequelize.query(SQL.MARQUE.MARQUE_ACTIVATE, {
      replacements: { id: Number(id) },
      type: QueryTypes.SELECT
    });
    return getFirstResult(rows);
  } catch (error) {
    console.error('Error activating marque:', error);
    throw error;
  }
}

/**
 * Deactivate marque
 */
export async function deactivateMarque(id) {
  try {
    const rows = await sequelize.query(SQL.MARQUE.MARQUE_DEACTIVATE, {
      replacements: { id: Number(id) },
      type: QueryTypes.SELECT
    });
    return getFirstResult(rows);
  } catch (error) {
    console.error('Error deactivating marque:', error);
    throw error;
  }
}

/**
 * Optional: hard delete marque
 */
export async function deleteMarque(id) {
  try {
    await sequelize.query(SQL.MARQUE.MARQUE_DELETE, {
      replacements: { id: Number(id) },
      type: QueryTypes.RAW
    });
    return { id: Number(id), deleted: true };
  } catch (error) {
    console.error('Error deleting marque:', error);
    throw error;
  }
}
