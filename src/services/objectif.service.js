// src/services/objectif.service.js

import { sequelize } from '../config/database.js';
import { SQL } from '../sql/snippets.js';
import { QueryTypes } from 'sequelize';
import { 
  getFirstResult, 
  prepareStoredProcParams 
} from '../helpers/databaseHelpers.js';
import { processPaginatedResult } from '../helpers/queryHelpers.js';

/**
 * Create a new Objectif
 */
export async function createObjectif(data) {
  const params = prepareStoredProcParams({
    userId: Number(data.userId),
    groupementId: Number(data.groupementId),
    siteId: Number(data.siteId),
    periodeId: Number(data.periodeId),
    typeVenteId: Number(data.typeVenteId),
    typeObjectifId: Number(data.typeObjectifId),
    marqueId: data.marqueId != null ? Number(data.marqueId) : null,
    modeleId: data.modeleId != null ? Number(data.modeleId) : null,
    versionId: data.versionId != null ? Number(data.versionId) : null,
    volume: Number(data.volume),
    SalePrice: Number(data.SalePrice),
    TMDirect: Number(data.TMDirect),
    MargeInterGroupe: Number(data.MargeInterGroupe)
  });
  const rows = await sequelize.query(SQL.OBJECTIF.OBJECTIF_CREATE, {
    replacements: params,
    type: QueryTypes.SELECT
  });
  return getFirstResult(rows);
}

/**
 * Update Objectif
 */
export async function updateObjectif(id, data, updatedUserId = null) {
  const params = prepareStoredProcParams({
    id: Number(id),
    userId: Number(data.userId),
    groupementId: Number(data.groupementId),
    siteId: Number(data.siteId),
    periodeId: Number(data.periodeId),
    typeVenteId: Number(data.typeVenteId),
    typeObjectifId: Number(data.typeObjectifId),
    marqueId: data.marqueId != null ? Number(data.marqueId) : null,
    modeleId: data.modeleId != null ? Number(data.modeleId) : null,
    versionId: data.versionId != null ? Number(data.versionId) : null,
    volume: Number(data.volume),
    SalePrice: Number(data.SalePrice),
    TMDirect: Number(data.TMDirect),
    MargeInterGroupe: Number(data.MargeInterGroupe),
    updatedUserId: updatedUserId != null ? Number(updatedUserId) : null
  });
  const rows = await sequelize.query(SQL.OBJECTIF.OBJECTIF_UPDATE, {
    replacements: params,
    type: QueryTypes.SELECT
  });
  return getFirstResult(rows);
}

/**
 * Get active Objectif by id
 */
export async function getActiveObjectifById(id) {
  const rows = await sequelize.query(SQL.OBJECTIF.OBJECTIF_GET_BY_ID_ACTIVE, {
    replacements: { id: Number(id) },
    type: QueryTypes.SELECT
  });
  return getFirstResult(rows);
}

/**
 * List active Objectifs with optional filters and pagination
 */
export async function listActiveObjectifs(filters = {}, page = 1, pageSize = 10) {
  const params = prepareStoredProcParams({
    userId: filters.userId != null ? Number(filters.userId) : null,
    periodeId: filters.periodeId != null ? Number(filters.periodeId) : null,
    groupementId: filters.groupementId != null ? Number(filters.groupementId) : null,
    siteId: filters.siteId != null ? Number(filters.siteId) : null,
    pageNumber: Number(page),
    pageSize: Number(pageSize)
  });
  
  try {
    const rows = await sequelize.query(SQL.OBJECTIF.OBJECTIF_LIST_ACTIVE, {
      replacements: params,
      type: QueryTypes.SELECT
    });
    return processPaginatedResult(rows, page, pageSize);
  } catch (error) {
    console.error('Error in listActiveObjectifs service:', error);
    throw error;
  }
}

/**
 * List Objectifs using the view (enriched data)
 * Note: This doesn't use pagination in the stored proc, so we return raw data
 */
export async function listObjectifsView(filters = {}) {
  const params = prepareStoredProcParams({
    userId: filters.userId != null ? Number(filters.userId) : null,
    periodeId: filters.periodeId != null ? Number(filters.periodeId) : null,
    groupementId: filters.groupementId != null ? Number(filters.groupementId) : null,
    siteId: filters.siteId != null ? Number(filters.siteId) : null
  });
  const rows = await sequelize.query(SQL.OBJECTIF.OBJECTIF_VIEW, {
    replacements: params,
    type: QueryTypes.SELECT
  });
  return rows || [];
}

/**
 * Activate Objectif
 */
export async function activateObjectif(id) {
  const rows = await sequelize.query(SQL.OBJECTIF.OBJECTIF_ACTIVATE, {
    replacements: { id: Number(id) },
    type: QueryTypes.SELECT
  });
  return getFirstResult(rows);
}

/**
 * Deactivate Objectif
 */
export async function deactivateObjectif(id) {
  const rows = await sequelize.query(SQL.OBJECTIF.OBJECTIF_DEACTIVATE, {
    replacements: { id: Number(id) },
    type: QueryTypes.SELECT
  });
  return getFirstResult(rows);
}
