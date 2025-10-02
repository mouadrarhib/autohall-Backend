// src/services/periode.service.js

import { sequelize } from '../config/database.js';
import { SQL } from '../sql/snippets.js';
import { QueryTypes } from 'sequelize';
import { 
  getFirstResult, 
  prepareStoredProcParams 
} from '../helpers/databaseHelpers.js';
import { processPaginatedResult } from '../helpers/queryHelpers.js';

/**
 * Create a new periode
 */
export async function createPeriode(data) {
  const params = prepareStoredProcParams({
    year: Number(data.year),
    month: Number(data.month),
    week: data.week ? Number(data.week) : null,
    startedDate: data.startedDate,
    endDate: data.endDate,
    typePeriodeId: Number(data.typePeriodeId)
  });
  
  const rows = await sequelize.query(SQL.PERIODE.PERIODE_CREATE, {
    replacements: params,
    type: QueryTypes.SELECT
  });
  return getFirstResult(rows);
}

/**
 * Update a periode
 */
export async function updatePeriode(id, data) {
  const params = prepareStoredProcParams({
    id: Number(id),
    year: Number(data.year),
    month: Number(data.month),
    week: data.week ? Number(data.week) : null,
    startedDate: data.startedDate,
    endDate: data.endDate,
    typePeriodeId: Number(data.typePeriodeId)
  });
  
  const rows = await sequelize.query(SQL.PERIODE.PERIODE_UPDATE, {
    replacements: params,
    type: QueryTypes.SELECT
  });
  return getFirstResult(rows);
}

/**
 * Get periode by ID (active only)
 */
export async function getPeriodeById(id) {
  const rows = await sequelize.query(SQL.PERIODE.PERIODE_GET_BY_ID_ACTIVE, {
    replacements: { id: Number(id) },
    type: QueryTypes.SELECT
  });
  return getFirstResult(rows);
}

/**
 * List all active periodes with pagination
 */
export async function listActivePeriodes(page = 1, pageSize = 10) {
  const params = prepareStoredProcParams({
    pageNumber: Number(page),
    pageSize: Number(pageSize)
  });
  
  try {
    const rows = await sequelize.query(SQL.PERIODE.PERIODE_LIST_ACTIVE, {
      replacements: params,
      type: QueryTypes.SELECT
    });
    return processPaginatedResult(rows, page, pageSize);
  } catch (error) {
    console.error('Error in listActivePeriodes service:', error);
    throw error;
  }
}

/**
 * Activate a periode
 */
export async function activatePeriode(id) {
  const rows = await sequelize.query(SQL.PERIODE.PERIODE_ACTIVATE, {
    replacements: { id: Number(id) },
    type: QueryTypes.SELECT
  });
  return getFirstResult(rows);
}

/**
 * Deactivate a periode
 */
export async function deactivatePeriode(id) {
  const rows = await sequelize.query(SQL.PERIODE.PERIODE_DEACTIVATE, {
    replacements: { id: Number(id) },
    type: QueryTypes.SELECT
  });
  return getFirstResult(rows);
}

/**
 * List periodes by type with pagination
 */
export async function listPeriodesByType(filters, page = 1, pageSize = 10) {
  const params = prepareStoredProcParams({
    typePeriodeId: filters.typePeriodeId ? Number(filters.typePeriodeId) : null,
    typePeriodeName: filters.typePeriodeName || null,
    hebdomadaire: filters.hebdomadaire !== undefined ? (filters.hebdomadaire ? 1 : 0) : null,
    mensuel: filters.mensuel !== undefined ? (filters.mensuel ? 1 : 0) : null,
    year: filters.year ? Number(filters.year) : null,
    month: filters.month ? Number(filters.month) : null,
    pageNumber: Number(page),
    pageSize: Number(pageSize)
  });
  
  try {
    const rows = await sequelize.query(SQL.PERIODE.PERIODE_LIST_BY_TYPE, {
      replacements: params,
      type: QueryTypes.SELECT
    });
    return processPaginatedResult(rows, page, pageSize);
  } catch (error) {
    console.error('Error in listPeriodesByType service:', error);
    throw error;
  }
}

/**
 * List distinct years with pagination
 */
export async function listYears(page = 1, pageSize = 10) {
  const params = prepareStoredProcParams({
    pageNumber: Number(page),
    pageSize: Number(pageSize)
  });
  
  try {
    const rows = await sequelize.query(SQL.PERIODE.PERIODE_LIST_YEARS, {
      replacements: params,
      type: QueryTypes.SELECT
    });
    return processPaginatedResult(rows, page, pageSize);
  } catch (error) {
    console.error('Error in listYears service:', error);
    throw error;
  }
}

/**
 * List periodes by year with pagination
 */
export async function listPeriodesByYear(year, page = 1, pageSize = 10) {
  const params = prepareStoredProcParams({
    year: Number(year),
    pageNumber: Number(page),
    pageSize: Number(pageSize)
  });
  
  try {
    const rows = await sequelize.query(SQL.PERIODE.PERIODE_LIST_BY_YEAR, {
      replacements: params,
      type: QueryTypes.SELECT
    });
    return processPaginatedResult(rows, page, pageSize);
  } catch (error) {
    console.error('Error in listPeriodesByYear service:', error);
    throw error;
  }
}
