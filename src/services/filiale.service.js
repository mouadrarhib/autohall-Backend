// src/services/filiale.service.js

import { sequelize } from '../config/database.js';
import { SQL } from '../sql/snippets.js';
import { QueryTypes } from 'sequelize';
import { parseBoolean } from '../helpers/queryHelpers.js';
import { getFirstResult, hasResults, prepareStoredProcParams } from '../helpers/databaseHelpers.js';

/**
 * Create a new filiale
 * @param {string} name - Filiale name
 * @param {boolean} active - Active status
 * @returns {Object} Created filiale
 */
export async function createFiliale(name, active = true) {
  const params = prepareStoredProcParams({
    name: name.trim(),
    active: active ? 1 : 0
  });

  try {
    const result = await sequelize.query(SQL.FILIALE.FILIALE_CREATE, {
      replacements: params,
      type: QueryTypes.SELECT
    });

    // sp_InsertFiliale returns { NewId: X }
    const newIdRow = Array.isArray(result) ? result.find(r => typeof r?.NewId !== 'undefined') : null;
    const newId = newIdRow?.NewId;
    if (!newId) {
      throw new Error('Create operation did not return new ID');
    }

    // Get the created filiale
    const createdFiliale = await getFilialeById(newId);
    return createdFiliale || {
      id: Number(newId),
      name: name.trim(),
      active: !!active
    };
  } catch (error) {
    console.error('Error creating filiale:', error);
    throw error;
  }
}

/**
 * Get filiale by ID
 * @param {number} id - Filiale ID
 * @returns {Object|null} Filiale data or null
 */
export async function getFilialeById(id) {
  const rows = await sequelize.query(SQL.FILIALE.FILIALE_GET_BY_ID, {
    replacements: { id: Number(id) },
    type: QueryTypes.SELECT
  });
  return getFirstResult(rows);
}

/**
 * List all filiales
 * @returns {Array} Array of filiales
 */
export async function listFiliales() {
  const rows = await sequelize.query(SQL.FILIALE.FILIALE_GET_ALL, {
    type: QueryTypes.SELECT
  });
  return rows || [];
}

/**
 * Update filiale
 * @param {number} id - Filiale ID
 * @param {string|null} name - Filiale name
 * @param {boolean|null} active - Active status
 * @returns {Object|null} Updated filiale
 */
export async function updateFiliale(id, name = null, active = null) {
  const params = prepareStoredProcParams({
    id: Number(id),
    name: name ? name.trim() : null,
    active: active === null ? null : (active ? 1 : 0)
  });

  try {
    await sequelize.query(SQL.FILIALE.FILIALE_UPDATE, {
      replacements: params,
      type: QueryTypes.RAW
    });
    // Get the updated filiale
    return await getFilialeById(id);
  } catch (error) {
    console.error('Error updating filiale:', error);
    throw error;
  }
}

/**
 * Activate filiale
 * @param {number} id - Filiale ID
 * @returns {Object|null} Updated filiale
 */
export async function activateFiliale(id) {
  try {
    await sequelize.query(SQL.FILIALE.FILIALE_ACTIVATE, {
      replacements: { id: Number(id) },
      type: QueryTypes.RAW
    });
    return await getFilialeById(id);
  } catch (error) {
    console.error('Error activating filiale:', error);
    throw error;
  }
}

/**
 * Deactivate filiale
 * @param {number} id - Filiale ID
 * @returns {Object|null} Updated filiale
 */
export async function deactivateFiliale(id) {
  try {
    await sequelize.query(SQL.FILIALE.FILIALE_DEACTIVATE, {
      replacements: { id: Number(id) },
      type: QueryTypes.RAW
    });
    return await getFilialeById(id);
  } catch (error) {
    console.error('Error deactivating filiale:', error);
    throw error;
  }
}
