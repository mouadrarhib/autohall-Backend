// src/services/permission.service.js

import { sequelize } from '../config/database.js';
import { SQL } from '../sql/snippets.js';
import { QueryTypes } from 'sequelize';

import {
  parseBoolean,
  processPaginatedResult,
  sanitizeSearchQuery,
} from '../helpers/queryHelpers.js';

import {
  getFirstResult,
  prepareStoredProcParams
} from '../helpers/databaseHelpers.js';

// ---------- Permission CRUD Operations ----------

export async function createPermission(name, active = true) {
  const params = prepareStoredProcParams({ name, active: active ? 1 : 0 });

  const rows = await sequelize.query(SQL.PERMISSION.PERM_CREATE, { // changed
    replacements: params,
    type: QueryTypes.SELECT
  });

  return getFirstResult(rows);
}

export async function getPermissionById(id) {
  const rows = await sequelize.query(SQL.PERMISSION.PERM_GET_BY_ID, { // changed
    replacements: { id: Number(id) },
    type: QueryTypes.SELECT
  });

  return getFirstResult(rows);
}

export async function getPermissionByName(name) {
  const rows = await sequelize.query(SQL.PERMISSION.PERM_GET_BY_NAME, { // changed
    replacements: { name },
    type: QueryTypes.SELECT
  });

  return getFirstResult(rows);
}

export async function listPermissions(active, search, page = 1, pageSize = 50) {
  const filters = {
    active: parseBoolean(active),
    search: sanitizeSearchQuery(search),
    page: Number(page),
    pageSize: Number(pageSize)
  };

  try {
    const rows = await sequelize.query(SQL.PERMISSION.PERM_LIST, { // changed
      replacements: filters,
      type: QueryTypes.SELECT
    });

    return processPaginatedResult(rows, page, pageSize);
  } catch (error) {
    console.error('Error in listPermissions service:', error);
    throw error;
  }
}

export async function updatePermission(id, name, active) {
  const params = prepareStoredProcParams({
    id: Number(id),
    name: name || null,
    active: typeof active === 'undefined' ? null : (active ? 1 : 0)
  });

  const rows = await sequelize.query(SQL.PERMISSION.PERM_UPDATE, { // changed
    replacements: params,
    type: QueryTypes.SELECT
  });

  return getFirstResult(rows);
}

export async function activatePermission(id) {
  const rows = await sequelize.query(SQL.PERMISSION.PERM_ACTIVATE, { // changed
    replacements: { id: Number(id) },
    type: QueryTypes.SELECT
  });

  return getFirstResult(rows);
}

export async function deactivatePermission(id) {
  const rows = await sequelize.query(SQL.PERMISSION.PERM_DEACTIVATE, { // changed
    replacements: { id: Number(id) },
    type: QueryTypes.SELECT
  });

  return getFirstResult(rows);
}

export async function setPermissionActive(id, active) {
  const rows = await sequelize.query(SQL.PERMISSION.PERM_SET_ACTIVE, { // changed
    replacements: { id: Number(id), active: active ? 1 : 0 },
    type: QueryTypes.SELECT
  });

  return getFirstResult(rows);
}

// ---------- User-Permission Operations ----------

export async function listUserPermissions(idUser, active) {
  const params = prepareStoredProcParams({
    idUser: Number(idUser),
    active: parseBoolean(active)
  });

  const rows = await sequelize.query(SQL.USER_PERMISSION.UP_LIST_BY_USER, { // changed
    replacements: params,
    type: QueryTypes.SELECT
  });

  return rows || [];
}

export async function listUsersByPermission(idPermission, active) {
  const params = prepareStoredProcParams({
    idPermission: Number(idPermission),
    active: parseBoolean(active)
  });

  const rows = await sequelize.query(SQL.USER_PERMISSION.UP_LIST_BY_PERM, { // changed
    replacements: params,
    type: QueryTypes.SELECT
  });

  return rows || [];
}

export async function addUserPermission(idUser, idPermission) {
  const rows = await sequelize.query(SQL.USER_PERMISSION.UP_ADD, { // changed
    replacements: { idUser: Number(idUser), idPermission: Number(idPermission) },
    type: QueryTypes.SELECT
  });

  return getFirstResult(rows);
}

export async function activateUserPermission(idUser, idPermission) {
  const rows = await sequelize.query(SQL.USER_PERMISSION.UP_ACTIVATE, { // changed
    replacements: { idUser: Number(idUser), idPermission: Number(idPermission) },
    type: QueryTypes.SELECT
  });

  return getFirstResult(rows);
}

export async function deactivateUserPermission(idUser, idPermission) {
  const rows = await sequelize.query(SQL.USER_PERMISSION.UP_DEACTIVATE, { // changed
    replacements: { idUser: Number(idUser), idPermission: Number(idPermission) },
    type: QueryTypes.SELECT
  });

  return getFirstResult(rows);
}

export async function removeUserPermission(idUser, idPermission, hardDelete = false) {
  const rows = await sequelize.query(SQL.USER_PERMISSION.UP_REMOVE, { // changed
    replacements: { idUser: Number(idUser), idPermission: Number(idPermission), hardDelete: hardDelete ? 1 : 0 },
    type: QueryTypes.SELECT
  });

  return getFirstResult(rows);
}

export async function setUserPermissionActive(idUser, idPermission, active) {
  const rows = await sequelize.query(SQL.USER_PERMISSION.UP_SET_ACTIVE, { // optional helper
    replacements: { idUser: Number(idUser), idPermission: Number(idPermission), active: active ? 1 : 0 },
    type: QueryTypes.SELECT
  });

  return getFirstResult(rows);
}

export async function userHasPermissionByName(idUser, permissionName) {
  try {
    const rows = await sequelize.query(SQL.USER_PERMISSION.UP_HAS_BY_NAME, { // changed
      replacements: { idUser: Number(idUser), permissionName },
      type: QueryTypes.SELECT
    });

    return rows[0] || { hasPermission: 0 };
  } catch (error) {
    console.error('Error checking user permission:', error);
    return { hasPermission: 0 };
  }
}
