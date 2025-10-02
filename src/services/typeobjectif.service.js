// src/services/typeobjectif.service.js

import { sequelize } from '../config/database.js';
import { SQL } from '../sql/snippets.js';
import { QueryTypes } from 'sequelize';
import { getFirstResult, prepareStoredProcParams } from '../helpers/databaseHelpers.js';

/**
 * Create a new TypeObjectif
 */
export async function createTypeObjectif(name) {
  const params = prepareStoredProcParams({
    name: String(name).trim()
  });

  const rows = await sequelize.query(SQL.TYPE_OBJECTIF.TYPE_OBJECTIF_CREATE, {
    replacements: params,
    type: QueryTypes.SELECT
  });
  return getFirstResult(rows);
}

/**
 * Update TypeObjectif
 */
export async function updateTypeObjectif(id, name) {
  const params = prepareStoredProcParams({
    id: Number(id),
    name: String(name).trim()
  });

  const rows = await sequelize.query(SQL.TYPE_OBJECTIF.TYPE_OBJECTIF_UPDATE, {
    replacements: params,
    type: QueryTypes.SELECT
  });
  return getFirstResult(rows);
}

/**
 * Get active TypeObjectif by id
 */
export async function getActiveTypeObjectifById(id) {
  const rows = await sequelize.query(SQL.TYPE_OBJECTIF.TYPE_OBJECTIF_GET_BY_ID_ACTIVE, {
    replacements: { id: Number(id) },
    type: QueryTypes.SELECT
  });
  return getFirstResult(rows);
}

/**
 * List all active TypeObjectif
 */
export async function listActiveTypeObjectifs() {
  const rows = await sequelize.query(SQL.TYPE_OBJECTIF.TYPE_OBJECTIF_LIST_ACTIVE, {
    type: QueryTypes.SELECT
  });
  return rows || [];
}

/**
 * Activate TypeObjectif
 */
export async function activateTypeObjectif(id) {
  const rows = await sequelize.query(SQL.TYPE_OBJECTIF.TYPE_OBJECTIF_ACTIVATE, {
    replacements: { id: Number(id) },
    type: QueryTypes.SELECT
  });
  return getFirstResult(rows);
}

/**
 * Deactivate TypeObjectif
 */
export async function deactivateTypeObjectif(id) {
  const rows = await sequelize.query(SQL.TYPE_OBJECTIF.TYPE_OBJECTIF_DEACTIVATE, {
    replacements: { id: Number(id) },
    type: QueryTypes.SELECT
  });
  return getFirstResult(rows);
}
