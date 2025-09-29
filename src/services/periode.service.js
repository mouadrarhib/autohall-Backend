// src/services/periode.service.js

import { sequelize } from '../config/database.js';
import { SQL } from '../sql/snippets.js';
import { QueryTypes } from 'sequelize';
import { getFirstResult, prepareStoredProcParams } from '../helpers/databaseHelpers.js';

export async function createPeriode({ year, month, week, startedDate, endDate, typePeriodeId = null }) {
  const params = prepareStoredProcParams({
    year: Number(year),
    month: Number(month),
    week: Number(week),
    startedDate: String(startedDate),
    endDate: String(endDate),
    typePeriodeId: typePeriodeId == null ? null : Number(typePeriodeId)
  });

  const rows = await sequelize.query(SQL.PERIODE.PERIODE_CREATE, {
    replacements: params,
    type: QueryTypes.SELECT
  });
  return getFirstResult(rows);
}

export async function updatePeriode(id, { year, month, week, startedDate, endDate, typePeriodeId = null }) {
  const params = prepareStoredProcParams({
    id: Number(id),
    year: Number(year),
    month: Number(month),
    week: Number(week),
    startedDate: String(startedDate),
    endDate: String(endDate),
    typePeriodeId: typePeriodeId == null ? null : Number(typePeriodeId)
  });

  const rows = await sequelize.query(SQL.PERIODE.PERIODE_UPDATE, {
    replacements: params,
    type: QueryTypes.SELECT
  });
  return getFirstResult(rows);
}

export async function getActivePeriodeById(id) {
  const rows = await sequelize.query(SQL.PERIODE.PERIODE_GET_BY_ID_ACTIVE, {
    replacements: { id: Number(id) },
    type: QueryTypes.SELECT
  });
  return getFirstResult(rows);
}

export async function listActivePeriodes() {
  const rows = await sequelize.query(SQL.PERIODE.PERIODE_LIST_ACTIVE, {
    type: QueryTypes.SELECT
  });
  return rows || [];
}

export async function activatePeriode(id) {
  const rows = await sequelize.query(SQL.PERIODE.PERIODE_ACTIVATE, {
    replacements: { id: Number(id) },
    type: QueryTypes.SELECT
  });
  return getFirstResult(rows);
}

export async function deactivatePeriode(id) {
  const rows = await sequelize.query(SQL.PERIODE.PERIODE_DEACTIVATE, {
    replacements: { id: Number(id) },
    type: QueryTypes.SELECT
  });
  return getFirstResult(rows);
}

const toBit = (v) => {
  if (v === undefined || v === null || v === '') return null;
  const s = String(v).toLowerCase();
  if (v === true || s === 'true' || s === '1') return 1;
  if (v === false || s === 'false' || s === '0') return 0;
  return null;
};

export async function listPeriodesByType({
  typePeriodeId = null,
  typePeriodeName = null,
  hebdomadaire = null,
  mensuel = null,
  year = null,
  month = null
} = {}) {
  const params = prepareStoredProcParams({
    typePeriodeId: typePeriodeId == null ? null : Number(typePeriodeId),
    typePeriodeName: typePeriodeName ? String(typePeriodeName).trim() : null,
    hebdomadaire: toBit(hebdomadaire),
    mensuel: toBit(mensuel),
    year: year == null ? null : Number(year),
    month: month == null ? null : Number(month),
  });

  const rows = await sequelize.query(SQL.PERIODE.PERIODE_LIST_BY_TYPE, {
    replacements: params,
    type: QueryTypes.SELECT,
  });
  return rows || [];
}
export async function listPeriodeYears() {
  const rows = await sequelize.query(SQL.PERIODE.PERIODE_LIST_YEARS, {
    type: QueryTypes.SELECT,
  });
  return rows || [];
}
export async function listPeriodesByYear(year) {
  const rows = await sequelize.query(SQL.PERIODE.PERIODE_LIST_BY_YEAR, {
    replacements: { year: Number(year) },
    type: QueryTypes.SELECT,
  });
  return rows || [];
}
