// src/services/appparameter.service.js

import { sequelize } from '../config/database.js';
import { SQL } from '../sql/snippets.js';
import { QueryTypes } from 'sequelize';
import { sanitizeSearchQuery, parseBoolean } from '../helpers/queryHelpers.js';
import { 
  getFirstResult, 
  hasResults, 
  prepareStoredProcParams 
} from '../helpers/databaseHelpers.js';
import { processPaginatedResult } from '../helpers/queryHelpers.js';

/**
 * Create a new app parameter
 */
export async function createAppParameter(key, value = null, description = null, type = null, scope = null, active = true) {
  const params = prepareStoredProcParams({
    key: key.trim(),
    value,
    description,
    type,
    scope,
    active: active ? 1 : 0
  });
  try {
    const result = await sequelize.query(SQL.APPPARAMETER.APPPARAMETER_CREATE, {
      replacements: params,
      type: QueryTypes.SELECT
    });
    const newIdRow = Array.isArray(result) ? result.find(r => typeof r?.NewId !== 'undefined') : null;
    const newId = newIdRow?.NewId;
    if (!newId) {
      throw new Error('Create operation did not return new ID');
    }
    const created = await getAppParameterById(newId);
    return created || {
      id: Number(newId),
      key: key.trim(),
      value,
      description,
      type,
      scope,
      active: !!active
    };
  } catch (error) {
    console.error('Error creating app parameter:', error);
    throw error;
  }
}

/**
 * Get app parameter by ID
 */
export async function getAppParameterById(id) {
  const rows = await sequelize.query(SQL.APPPARAMETER.APPPARAMETER_GET_BY_ID, {
    replacements: { id: Number(id) },
    type: QueryTypes.SELECT
  });
  return getFirstResult(rows);
}

/**
 * Get app parameter by key
 */
export async function getAppParameterByKey(key) {
  const rows = await sequelize.query(SQL.APPPARAMETER.APPPARAMETER_GET_BY_KEY, {
    replacements: { key: key.trim() },
    type: QueryTypes.SELECT
  });
  return getFirstResult(rows);
}

/**
 * List app parameters with pagination
 */
export async function listAppParameters(type = null, scope = null, onlyActive = true, page = 1, pageSize = 10) {
  const params = prepareStoredProcParams({
    type: type ? type.trim() : null,
    scope: scope ? scope.trim() : null,
    onlyActive: onlyActive ? 1 : 0,
    pageNumber: Number(page),
    pageSize: Number(pageSize)
  });
  
  try {
    const rows = await sequelize.query(SQL.APPPARAMETER.APPPARAMETER_LIST, {
      replacements: params,
      type: QueryTypes.SELECT
    });
    return processPaginatedResult(rows, page, pageSize);
  } catch (error) {
    console.error('Error in listAppParameters service:', error);
    throw error;
  }
}

/**
 * Search app parameters with pagination
 */
export async function searchAppParameters(searchTerm, type = null, scope = null, onlyActive = true, page = 1, pageSize = 10) {
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
    type: type ? type.trim() : null,
    scope: scope ? scope.trim() : null,
    onlyActive: onlyActive ? 1 : 0,
    pageNumber: Number(page),
    pageSize: Number(pageSize)
  });
  
  try {
    const rows = await sequelize.query(SQL.APPPARAMETER.APPPARAMETER_SEARCH, {
      replacements: params,
      type: QueryTypes.SELECT
    });
    return processPaginatedResult(rows, page, pageSize);
  } catch (error) {
    console.error('Error in searchAppParameters service:', error);
    throw error;
  }
}

/**
 * Set/Upsert app parameter by key
 */
export async function setAppParameter(key, value, description = null, type = null, scope = null, active = true) {
  const params = prepareStoredProcParams({
    key: key.trim(),
    value: String(value),
    description,
    type,
    scope,
    active: active ? 1 : 0
  });
  try {
    const result = await sequelize.query(SQL.APPPARAMETER.APPPARAMETER_SET, {
      replacements: params,
      type: QueryTypes.SELECT
    });
    const idRow = Array.isArray(result) ? result.find(r => typeof r?.Id !== 'undefined') : null;
    const id = idRow?.Id;
    if (id) {
      const updated = await getAppParameterById(id);
      if (updated) return updated;
    }
    const byKey = await getAppParameterByKey(key);
    return byKey || {
      key: key.trim(),
      value: String(value),
      description,
      type,
      scope,
      active: !!active
    };
  } catch (error) {
    console.error('Error setting app parameter:', error);
    throw error;
  }
}

/**
 * Update app parameter by ID
 */
export async function updateAppParameterById(id, updates = {}) {
  const { value = null, description = null, type = null, scope = null, active = null } = updates;
  const params = prepareStoredProcParams({
    id: Number(id),
    key: null,
    value,
    description,
    type,
    scope,
    active: active === null ? null : (active ? 1 : 0)
  });
  try {
    await sequelize.query(SQL.APPPARAMETER.APPPARAMETER_UPDATE, {
      replacements: params,
      type: QueryTypes.RAW
    });
    return await getAppParameterById(id);
  } catch (error) {
    console.error('Error updating app parameter by ID:', error);
    throw error;
  }
}

/**
 * Update app parameter by key
 */
export async function updateAppParameterByKey(key, updates = {}) {
  const { value = null, description = null, type = null, scope = null, active = null } = updates;
  const params = prepareStoredProcParams({
    id: null,
    key: key.trim(),
    value,
    description,
    type,
    scope,
    active: active === null ? null : (active ? 1 : 0)
  });
  try {
    await sequelize.query(SQL.APPPARAMETER.APPPARAMETER_UPDATE, {
      replacements: params,
      type: QueryTypes.RAW
    });
    return await getAppParameterByKey(key);
  } catch (error) {
    console.error('Error updating app parameter by key:', error);
    throw error;
  }
}

/**
 * Activate app parameter
 */
export async function activateAppParameter(id) {
  try {
    const rows = await sequelize.query(SQL.APPPARAMETER.APPPARAMETER_ACTIVATE, {
      replacements: { id: Number(id) },
      type: QueryTypes.SELECT
    });
    return getFirstResult(rows);
  } catch (error) {
    console.error('Error activating app parameter:', error);
    throw error;
  }
}

/**
 * Deactivate app parameter
 */
export async function deactivateAppParameter(id) {
  try {
    const rows = await sequelize.query(SQL.APPPARAMETER.APPPARAMETER_DEACTIVATE, {
      replacements: { id: Number(id) },
      type: QueryTypes.SELECT
    });
    return getFirstResult(rows);
  } catch (error) {
    console.error('Error deactivating app parameter:', error);
    throw error;
  }
}
