// src/controllers/periode.controller.js

import { asyncHandler } from '../helpers/asyncHandler.js';
import { mapSqlError } from '../helpers/sqlErrorMapper.js';
import * as periodeService from '../services/periode.service.js';

export const createPeriode = asyncHandler(async (req, res) => {
  const { year, month, week, startedDate, endDate, typePeriodeId = null } = req.body || {};
  try {
    const result = await periodeService.createPeriode({
      year: Number(year),
      month: Number(month),
      week: Number(week),
      startedDate,
      endDate,
      typePeriodeId: typePeriodeId != null ? Number(typePeriodeId) : null
    });
    res.status(201).json({ data: result });
  } catch (err) {
    const { status, message } = mapSqlError(err);
    res.status(status).json({ error: message });
  }
});

export const getPeriodeById = asyncHandler(async (req, res) => {
  const id = Number(req.params.id);
  const row = await periodeService.getActivePeriodeById(id);
  if (!row) return res.status(404).json({ error: 'Periode not found' });
  res.json({ data: row });
});

export const listActivePeriodes = asyncHandler(async (_req, res) => {
  const rows = await periodeService.listActivePeriodes();
  res.json({ data: rows });
});

export const updatePeriode = asyncHandler(async (req, res) => {
  const id = Number(req.params.id);
  const { year, month, week, startedDate, endDate, typePeriodeId = null } = req.body || {};
  try {
    const result = await periodeService.updatePeriode(id, {
      year: Number(year),
      month: Number(month),
      week: Number(week),
      startedDate,
      endDate,
      typePeriodeId: typePeriodeId != null ? Number(typePeriodeId) : null
    });
    if (!result) return res.status(404).json({ error: 'Periode not found' });
    res.json({ data: result });
  } catch (err) {
    const { status, message } = mapSqlError(err);
    res.status(status).json({ error: message });
  }
});

export const activatePeriode = asyncHandler(async (req, res) => {
  const id = Number(req.params.id);
  try {
    const result = await periodeService.activatePeriode(id);
    if (!result) return res.status(404).json({ error: 'Periode not found' });
    res.json({ data: result });
  } catch (err) {
    const { status, message } = mapSqlError(err);
    res.status(status).json({ error: message });
  }
});

export const deactivatePeriode = asyncHandler(async (req, res) => {
  const id = Number(req.params.id);
  try {
    const result = await periodeService.deactivatePeriode(id);
    if (!result) return res.status(404).json({ error: 'Periode not found' });
    res.json({ data: result });
  } catch (err) {
    const { status, message } = mapSqlError(err);
    res.status(status).json({ error: message });
  }
});

export const listPeriodesByType = asyncHandler(async (req, res) => {
  const {
    typePeriodeId = null,
    typePeriodeName = null,
    hebdomadaire = null,
    mensuel = null,
    year = null,
    month = null
  } = req.query || {};

  try {
    const rows = await periodeService.listPeriodesByType({
      typePeriodeId,
      typePeriodeName,
      hebdomadaire,
      mensuel,
      year,
      month
    });
    return res.json({ data: rows });
  } catch (err) {
    const { status, message } = mapSqlError(err);
    return res.status(status).json({ error: message });
  }
});

export const listPeriodeYears = asyncHandler(async (_req, res) => {
  const rows = await periodeService.listPeriodeYears();
  return res.json({ data: rows });
});


export const listPeriodesByYear = asyncHandler(async (req, res) => {
  const year = Number(req.params.year);
  const rows = await periodeService.listPeriodesByYear(year);
  return res.json({ data: rows });
});

