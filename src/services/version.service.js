// src/services/version.service.js

import { sequelize } from '../config/database.js';
import { SQL } from '../sql/snippets.js';
import { QueryTypes } from 'sequelize';
import { 
  getFirstResult, 
  prepareStoredProcParams 
} from '../helpers/databaseHelpers.js';
import { processPaginatedResult } from '../helpers/queryHelpers.js';

export async function createVersion(data) {
  const params = prepareStoredProcParams({
    name: data.name.trim(),
    idModele: Number(data.idModele),
    volume: Number(data.volume),
    price: Number(data.price),
    tm: Number(data.tm),
    margin: Number(data.margin)
  });
  const rows = await sequelize.query(SQL.VERSION.VERSION_CREATE, {
    replacements: params,
    type: QueryTypes.SELECT
  });
  return getFirstResult(rows);
}

export async function updateVersion(id, data) {
  const params = prepareStoredProcParams({
    id: Number(id),
    name: data.name.trim(),
    idModele: Number(data.idModele),
    volume: Number(data.volume),
    price: Number(data.price),
    tm: Number(data.tm),
    margin: Number(data.margin)
  });
  const rows = await sequelize.query(SQL.VERSION.VERSION_UPDATE, {
    replacements: params,
    type: QueryTypes.SELECT
  });
  return getFirstResult(rows);
}

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

export async function searchVersions(q, idModele = null, onlyActive = true) {
  const params = prepareStoredProcParams({
    q: q.trim(),
    idModele: idModele ? Number(idModele) : null,
    onlyActive: onlyActive ? 1 : 0
  });
  const rows = await sequelize.query(SQL.VERSION.VERSION_SEARCH, {
    replacements: params,
    type: QueryTypes.SELECT
  });
  return rows || [];
}

export async function activateVersion(id) {
  const rows = await sequelize.query(SQL.VERSION.VERSION_ACTIVATE, {
    replacements: { id: Number(id) },
    type: QueryTypes.SELECT
  });
  return getFirstResult(rows);
}

export async function deactivateVersion(id) {
  const rows = await sequelize.query(SQL.VERSION.VERSION_DEACTIVATE, {
    replacements: { id: Number(id) },
    type: QueryTypes.SELECT
  });
  return getFirstResult(rows);
}
