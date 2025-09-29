// src/services/typeperiode.service.js

import { sequelize } from '../config/database.js';
import { SQL } from '../sql/snippets.js';
import { QueryTypes } from 'sequelize';
import { getFirstResult, prepareStoredProcParams } from '../helpers/databaseHelpers.js';

/**
 * Create a new TypePeriode
 * Columns: id, name, hebdomadaire, mensuel, active
 */
export async function createTypePeriode(name, { hebdomadaire, mensuel }) {
  const params = prepareStoredProcParams({
    name: String(name).trim(),
    hebdomadaire: hebdomadaire ? 1 : 0,
    mensuel: mensuel ? 1 : 0,
  });

  const rows = await sequelize.query(SQL.TYPE_PERIODE.TYPE_PERIODE_CREATE, {
    replacements: params,
    type: QueryTypes.SELECT,
  });

  // Proc returns the inserted row via SELECT
  return getFirstResult(rows);
}

/**
 * Update TypePeriode
 */
export async function updateTypePeriode(id, { name, hebdomadaire, mensuel }) {
  const params = prepareStoredProcParams({
    id: Number(id),
    name: name != null ? String(name).trim() : null,
    hebdomadaire: typeof hebdomadaire === 'boolean' ? (hebdomadaire ? 1 : 0) : null,
    mensuel: typeof mensuel === 'boolean' ? (mensuel ? 1 : 0) : null,
  });

  const rows = await sequelize.query(SQL.TYPE_PERIODE.TYPE_PERIODE_UPDATE, {
    replacements: params,
    type: QueryTypes.SELECT,
  });

  return getFirstResult(rows);
}

/**
 * Get active TypePeriode by id
 */
export async function getActiveTypePeriodeById(id) {
  const rows = await sequelize.query(SQL.TYPE_PERIODE.TYPE_PERIODE_GET_BY_ID_ACTIVE, {
    replacements: { id: Number(id) },
    type: QueryTypes.SELECT,
  });
  return getFirstResult(rows);
}

/**
 * List all active TypePeriode
 */
export async function listActiveTypePeriodes() {
  const rows = await sequelize.query(SQL.TYPE_PERIODE.TYPE_PERIODE_LIST_ACTIVE, {
    type: QueryTypes.SELECT,
  });
  return rows || [];
}

/**
 * Activate
 */
export async function activateTypePeriode(id) {
  const rows = await sequelize.query(SQL.TYPE_PERIODE.TYPE_PERIODE_ACTIVATE, {
    replacements: { id: Number(id) },
    type: QueryTypes.SELECT,
  });
  return getFirstResult(rows);
}

/**
 * Deactivate
 */
export async function deactivateTypePeriode(id) {
  const rows = await sequelize.query(SQL.TYPE_PERIODE.TYPE_PERIODE_DEACTIVATE, {
    replacements: { id: Number(id) },
    type: QueryTypes.SELECT,
  });
  return getFirstResult(rows);
}
