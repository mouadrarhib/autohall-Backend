// src/services/typevente.service.js

import { sequelize } from '../config/database.js';
import { SQL } from '../sql/snippets.js';
import { QueryTypes } from 'sequelize';
import { getFirstResult, prepareStoredProcParams } from '../helpers/databaseHelpers.js';

/**
 * Create a new TypeVente
 */
export async function createTypeVente(name) {
  const params = prepareStoredProcParams({
    name: String(name).trim()
  });

  const rows = await sequelize.query(SQL.TYPE_VENTE.TYPE_VENTE_CREATE, {
    replacements: params,
    type: QueryTypes.SELECT
  });
  return getFirstResult(rows);
}

/**
 * Update TypeVente
 */
export async function updateTypeVente(id, name) {
  const params = prepareStoredProcParams({
    id: Number(id),
    name: String(name).trim()
  });

  const rows = await sequelize.query(SQL.TYPE_VENTE.TYPE_VENTE_UPDATE, {
    replacements: params,
    type: QueryTypes.SELECT
  });
  return getFirstResult(rows);
}

/**
 * Get active TypeVente by id
 */
export async function getActiveTypeVenteById(id) {
  const rows = await sequelize.query(SQL.TYPE_VENTE.TYPE_VENTE_GET_BY_ID_ACTIVE, {
    replacements: { id: Number(id) },
    type: QueryTypes.SELECT
  });
  return getFirstResult(rows);
}

/**
 * List all active TypeVente
 */
export async function listActiveTypeVentes() {
  const rows = await sequelize.query(SQL.TYPE_VENTE.TYPE_VENTE_LIST_ACTIVE, {
    type: QueryTypes.SELECT
  });
  return rows || [];
}

/**
 * Activate TypeVente
 */
export async function activateTypeVente(id) {
  const rows = await sequelize.query(SQL.TYPE_VENTE.TYPE_VENTE_ACTIVATE, {
    replacements: { id: Number(id) },
    type: QueryTypes.SELECT
  });
  return getFirstResult(rows);
}

/**
 * Deactivate TypeVente
 */
export async function deactivateTypeVente(id) {
  const rows = await sequelize.query(SQL.TYPE_VENTE.TYPE_VENTE_DEACTIVATE, {
    replacements: { id: Number(id) },
    type: QueryTypes.SELECT
  });
  return getFirstResult(rows);
}
