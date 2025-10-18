// src/services/version.service.js

import { sequelize } from '../config/database.js';
import { SQL } from '../sql/snippets.js';
import { QueryTypes } from 'sequelize';
import {
  getFirstResult,
  prepareStoredProcParams
} from '../helpers/databaseHelpers.js';
import { processPaginatedResult } from '../helpers/queryHelpers.js';
import { sanitizeSearchQuery } from '../helpers/queryHelpers.js';

/**
 * Create a new version
 */
export async function createVersion(data) {
  const params = prepareStoredProcParams({
    name: data.name.trim(),
    idModele: Number(data.idModele),
    active: data.active !== undefined ? (data.active ? 1 : 0) : 1,
    volume: Number(data.volume || 0),
    salePrice: Number(data.salePrice || 0),
    tmDirect: Number(data.tmDirect || 0),
    margeInterGroupe: Number(data.margeInterGroupe || 0)
  });

  try {
    const result = await sequelize.query(SQL.VERSION.VERSION_CREATE, {
      replacements: params,
      type: QueryTypes.SELECT
    });

    const idRow = Array.isArray(result) ? result.find(r => typeof r?.id !== 'undefined') : null;
    const newId = idRow?.id;

    if (!newId) {
      throw new Error('Create operation did not return new ID');
    }

    const createdVersion = await getVersionById(newId);
    return createdVersion || { id: Number(newId), ...data };
  } catch (error) {
    console.error('Error creating version:', error);
    throw error;
  }
}

/**
 * Update version
 */
export async function updateVersion(id, data) {
  const params = prepareStoredProcParams({
    id: Number(id),
    name: data.name ? data.name.trim() : null,
    idModele: data.idModele ? Number(data.idModele) : null,
    active: data.active !== undefined ? (data.active ? 1 : 0) : null,
    volume: data.volume !== undefined ? Number(data.volume) : null,
    salePrice: data.salePrice !== undefined ? Number(data.salePrice) : null,
    tmDirect: data.tmDirect !== undefined ? Number(data.tmDirect) : null,
    margeInterGroupe: data.margeInterGroupe !== undefined ? Number(data.margeInterGroupe) : null
  });

  const rows = await sequelize.query(SQL.VERSION.VERSION_UPDATE, {
    replacements: params,
    type: QueryTypes.SELECT
  });
  
  return getFirstResult(rows);
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
 * List versions with pagination
 */
export async function listVersions(idModele = null, onlyActive = true, page = 1, pageSize = 10) {
  const params = prepareStoredProcParams({
    idModele: idModele ? Number(idModele) : null,
    onlyActive: onlyActive ? 1 : 0,
    pageNumber: Number(page),
    pageSize: Number(pageSize)
  });

  try {
    const rows = await sequelize.query(SQL.VERSION.VERSION_LIST, {
      replacements: params,
      type: QueryTypes.SELECT
    });
    return processPaginatedResult(rows, page, pageSize);
  } catch (error) {
    console.error('Error in listVersions service:', error);
    throw error;
  }
}

/**
 * List versions by modele with pagination
 */
export async function listVersionsByModele(idModele, onlyActive = true, page = 1, pageSize = 10) {
  const params = prepareStoredProcParams({
    idModele: Number(idModele),
    onlyActive: onlyActive ? 1 : 0,
    pageNumber: Number(page),
    pageSize: Number(pageSize)
  });

  try {
    const rows = await sequelize.query(SQL.VERSION.VERSION_LIST_BY_MODELE, {
      replacements: params,
      type: QueryTypes.SELECT
    });
    return processPaginatedResult(rows, page, pageSize);
  } catch (error) {
    console.error('Error in listVersionsByModele service:', error);
    throw error;
  }
}

/**
 * Search versions with pagination
 */
export async function searchVersions(searchTerm, idModele = null, onlyActive = true, page = 1, pageSize = 10) {
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
    idModele: idModele ? Number(idModele) : null,
    onlyActive: onlyActive ? 1 : 0,
    pageNumber: Number(page),
    pageSize: Number(pageSize)
  });

  try {
    const rows = await sequelize.query(SQL.VERSION.VERSION_SEARCH, {
      replacements: params,
      type: QueryTypes.SELECT
    });
    return processPaginatedResult(rows, page, pageSize);
  } catch (error) {
    console.error('Error in searchVersions service:', error);
    throw error;
  }
}

/**
 * Activate version
 */
export async function activateVersion(id) {
  const rows = await sequelize.query(SQL.VERSION.VERSION_ACTIVATE, {
    replacements: { id: Number(id) },
    type: QueryTypes.SELECT
  });
  return getFirstResult(rows);
}

/**
 * Deactivate version
 */
export async function deactivateVersion(id) {
  const rows = await sequelize.query(SQL.VERSION.VERSION_DEACTIVATE, {
    replacements: { id: Number(id) },
    type: QueryTypes.SELECT
  });
  return getFirstResult(rows);
}
