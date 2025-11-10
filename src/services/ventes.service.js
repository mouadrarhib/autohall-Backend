// src/services/ventes.service.js

import { sequelize } from '../config/database.js';
import { SQL } from '../sql/snippets.js';
import { QueryTypes } from 'sequelize';
import {
  getFirstResult,
  prepareStoredProcParams
} from '../helpers/databaseHelpers.js';
import { processPaginatedResult } from '../helpers/queryHelpers.js';

/**
 * Helper function to safely convert to number or return null
 */
const toNumberOrNull = (value) => {
  if (value === null || value === undefined || value === '') {
    return null;
  }
  const num = Number(value);
  return isNaN(num) ? null : num;
};

/**
 * Create a new Vente
 */
export async function createVente(data) {
  const params = prepareStoredProcParams({
    idTypeVente: Number(data.idTypeVente),
    idUser: Number(data.idUser),
    idFiliale: toNumberOrNull(data.idFiliale),
    idSuccursale: toNumberOrNull(data.idSuccursale),
    idMarque: toNumberOrNull(data.idMarque),
    idModele: toNumberOrNull(data.idModele),
    idVersion: toNumberOrNull(data.idVersion),
    prixVente: Number(data.prixVente),
    chiffreAffaires: Number(data.chiffreAffaires),
    marge: toNumberOrNull(data.marge),
    margePercentage: toNumberOrNull(data.margePercentage),
    volume: Number(data.volume),
    venteYear: Number(data.venteYear),
    venteMonth: Number(data.venteMonth)
  });

  const rows = await sequelize.query(SQL.VENTES.VENTES_CREATE, {
    replacements: params,
    type: QueryTypes.SELECT
  });

  return getFirstResult(rows);
}

/**
 * Update Vente
 */
export async function updateVente(id, data) {
  const params = prepareStoredProcParams({
    id: Number(id),
    idTypeVente: Number(data.idTypeVente),
    idUser: Number(data.idUser),
    idFiliale: toNumberOrNull(data.idFiliale),
    idSuccursale: toNumberOrNull(data.idSuccursale),
    idMarque: toNumberOrNull(data.idMarque),
    idModele: toNumberOrNull(data.idModele),
    idVersion: toNumberOrNull(data.idVersion),
    prixVente: Number(data.prixVente),
    chiffreAffaires: Number(data.chiffreAffaires),
    marge: toNumberOrNull(data.marge),
    margePercentage: toNumberOrNull(data.margePercentage),
    volume: Number(data.volume),
    venteYear: Number(data.venteYear),
    venteMonth: Number(data.venteMonth)
  });

  const rows = await sequelize.query(SQL.VENTES.VENTES_UPDATE, {
    replacements: params,
    type: QueryTypes.SELECT
  });

  return getFirstResult(rows);
}

/**
 * Get active Vente by id
 */
export async function getVenteById(id, includeInactive = false) {
  const rows = await sequelize.query(SQL.VENTES.VENTES_GET_BY_ID, {
    replacements: { 
      id: Number(id),
      includeInactive: includeInactive ? 1 : 0
    },
    type: QueryTypes.SELECT
  });

  return getFirstResult(rows);
}

/**
 * List Ventes with optional filters and pagination
 */
export async function listVentes(filters = {}, page = 1, pageSize = 50) {
  const params = prepareStoredProcParams({
    idTypeVente: toNumberOrNull(filters.idTypeVente),
    idUser: toNumberOrNull(filters.idUser),
    idFiliale: toNumberOrNull(filters.idFiliale),
    idSuccursale: toNumberOrNull(filters.idSuccursale),
    idMarque: toNumberOrNull(filters.idMarque),
    idModele: toNumberOrNull(filters.idModele),
    idVersion: toNumberOrNull(filters.idVersion),
    yearFrom: toNumberOrNull(filters.yearFrom),
    yearTo: toNumberOrNull(filters.yearTo),
    monthFrom: toNumberOrNull(filters.monthFrom),
    monthTo: toNumberOrNull(filters.monthTo),
    includeInactive: filters.includeInactive ? 1 : 0,
    pageNumber: Number(page),
    pageSize: Number(pageSize)
  });

  try {
    const rows = await sequelize.query(SQL.VENTES.VENTES_GET_ALL, {
      replacements: params,
      type: QueryTypes.SELECT
    });

    return processPaginatedResult(rows, page, pageSize);
  } catch (error) {
    console.error('Error in listVentes service:', error);
    throw error;
  }
}

/**
 * Activate Vente
 */
export async function activateVente(id, updatedByUser) {
  const rows = await sequelize.query(SQL.VENTES.VENTES_ACTIVATE, {
    replacements: { 
      id: Number(id),
      updatedByUser: Number(updatedByUser)
    },
    type: QueryTypes.SELECT
  });

  return getFirstResult(rows);
}

/**
 * Deactivate Vente
 */
export async function deactivateVente(id, updatedByUser) {
  const rows = await sequelize.query(SQL.VENTES.VENTES_DEACTIVATE, {
    replacements: { 
      id: Number(id),
      updatedByUser: Number(updatedByUser)
    },
    type: QueryTypes.SELECT
  });

  return getFirstResult(rows);
}

/**
 * Get sales summary by period
 */
export async function getSummaryByPeriod(yearFrom, yearTo, filters = {}) {
  const params = prepareStoredProcParams({
    yearFrom: Number(yearFrom),
    yearTo: Number(yearTo),
    idFiliale: toNumberOrNull(filters.idFiliale),
    idSuccursale: toNumberOrNull(filters.idSuccursale),
    idMarque: toNumberOrNull(filters.idMarque)
  });

  const rows = await sequelize.query(SQL.VENTES.VENTES_GET_SUMMARY_BY_PERIOD, {
    replacements: params,
    type: QueryTypes.SELECT
  });

  return rows || [];
}

/**
 * Get performance by vehicle (marque/modele/version)
 */
export async function getPerformanceByVehicle(yearFrom, yearTo, level = 'marque') {
  const params = prepareStoredProcParams({
    yearFrom: Number(yearFrom),
    yearTo: Number(yearTo),
    level: level
  });

  const rows = await sequelize.query(SQL.VENTES.VENTES_GET_PERFORMANCE_BY_VEHICLE, {
    replacements: params,
    type: QueryTypes.SELECT
  });

  return rows || [];
}

/**
 * Get top performers (users/filiales/succursales)
 */
export async function getTopPerformers(yearFrom, yearTo, performerType = 'user', topN = 10) {
  const params = prepareStoredProcParams({
    yearFrom: Number(yearFrom),
    yearTo: Number(yearTo),
    performerType: performerType,
    topN: Number(topN)
  });

  const rows = await sequelize.query(SQL.VENTES.VENTES_GET_TOP_PERFORMERS, {
    replacements: params,
    type: QueryTypes.SELECT
  });

  return rows || [];
}

/**
 * Compare periods
 */
export async function comparePeriods(year1, month1, year2, month2, filters = {}) {
  const params = prepareStoredProcParams({
    year1: Number(year1),
    month1: Number(month1),
    year2: Number(year2),
    month2: Number(month2),
    idMarque: toNumberOrNull(filters.idMarque),
    idFiliale: toNumberOrNull(filters.idFiliale)
  });

  const rows = await sequelize.query(SQL.VENTES.VENTES_COMPARE_PERIODS, {
    replacements: params,
    type: QueryTypes.SELECT
  });

  return rows || [];
}

/**
 * Get year-over-year growth
 */
export async function getYearOverYearGrowth(currentYear, previousYear, idMarque = null) {
  const params = prepareStoredProcParams({
    currentYear: Number(currentYear),
    previousYear: Number(previousYear),
    idMarque: toNumberOrNull(idMarque)
  });

  const rows = await sequelize.query(SQL.VENTES.VENTES_GET_YEAR_OVER_YEAR_GROWTH, {
    replacements: params,
    type: QueryTypes.SELECT
  });

  return rows || [];
}
