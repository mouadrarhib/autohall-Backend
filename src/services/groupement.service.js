// src/services/groupement.service.js

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
 * Create a new groupement
 */
export async function createGroupement(name, active = true) {
  const params = prepareStoredProcParams({
    name: name.trim(),
    active: active ? 1 : 0
  });
  try {
    const result = await sequelize.query(SQL.GROUPEMENT.GROUPEMENT_CREATE, {
      replacements: params,
      type: QueryTypes.SELECT
    });
    // sp_InsertGroupement returns { NewId: X }
    const newIdRow = Array.isArray(result) ? result.find(r => typeof r?.NewId !== 'undefined') : null;
    const newId = newIdRow?.NewId;
    if (!newId) {
      throw new Error('Create operation did not return new ID');
    }
    // Get the created groupement
    const createdGroupement = await getGroupementById(newId);
    return createdGroupement || {
      id: Number(newId),
      name: name.trim(),
      active: !!active
    };
  } catch (error) {
    console.error('Error creating groupement:', error);
    throw error;
  }
}

/**
 * Get groupement by ID
 */
export async function getGroupementById(id) {
  const rows = await sequelize.query(SQL.GROUPEMENT.GROUPEMENT_GET_BY_ID, {
    replacements: { id: Number(id) },
    type: QueryTypes.SELECT
  });
  return getFirstResult(rows);
}

/**
 * List all groupements
 */
export async function listGroupements() {
  const rows = await sequelize.query(SQL.GROUPEMENT.GROUPEMENT_GET_ALL, {
    type: QueryTypes.SELECT
  });
  return rows || [];
}

/**
 * Search groupements by name
 */
export async function searchGroupements(searchTerm) {
  const sanitizedSearch = sanitizeSearchQuery(searchTerm);
  if (!sanitizedSearch) {
    return [];
  }
  const rows = await sequelize.query(SQL.GROUPEMENT.GROUPEMENT_SEARCH, {
    replacements: { name: sanitizedSearch },
    type: QueryTypes.SELECT
  });
  return rows || [];
}

/**
 * Update groupement
 */
export async function updateGroupement(id, name = null, active = null) {
  const params = prepareStoredProcParams({
    id: Number(id),
    name: name ? name.trim() : null,
    active: active === null ? null : (active ? 1 : 0)
  });
  try {
    await sequelize.query(SQL.GROUPEMENT.GROUPEMENT_UPDATE, {
      replacements: params,
      type: QueryTypes.RAW
    });
    return await getGroupementById(id);
  } catch (error) {
    console.error('Error updating groupement:', error);
    throw error;
  }
}

/**
 * Activate groupement
 */
export async function activateGroupement(id) {
  try {
    await sequelize.query(SQL.GROUPEMENT.GROUPEMENT_ACTIVATE, {
      replacements: { id: Number(id) },
      type: QueryTypes.RAW
    });
    return await getGroupementById(id);
  } catch (error) {
    console.error('Error activating groupement:', error);
    throw error;
  }
}

/**
 * Deactivate groupement
 */
export async function deactivateGroupement(id) {
  try {
    await sequelize.query(SQL.GROUPEMENT.GROUPEMENT_DEACTIVATE, {
      replacements: { id: Number(id) },
      type: QueryTypes.RAW
    });
    return await getGroupementById(id);
  } catch (error) {
    console.error('Error deactivating groupement:', error);
    throw error;
  }
}

/**
 * List active users by groupement with pagination
 */
export async function listUsersByGroupement(idGroupement, page = 1, pageSize = 10) {
  const params = prepareStoredProcParams({
    idGroupement: Number(idGroupement),
    pageNumber: Number(page),
    pageSize: Number(pageSize)
  });
  
  try {
    const rows = await sequelize.query(SQL.GROUPEMENT.USER_LIST_BY_GROUPEMENT, {
      replacements: params,
      type: QueryTypes.SELECT
    });
    return processPaginatedResult(rows, page, pageSize);
  } catch (error) {
    console.error('Error in listUsersByGroupement service:', error);
    throw error;
  }
}
