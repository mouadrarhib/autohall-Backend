// src/services/role.service.js

import { sequelize } from '../config/database.js';
import { SQL } from '../sql/snippets.js';
import { QueryTypes } from 'sequelize';
import { sanitizeSearchQuery } from '../helpers/queryHelpers.js';
import { getFirstResult, prepareStoredProcParams } from '../helpers/databaseHelpers.js';

/**
 * Create a new role
 */
export async function createRole(name, description = null, active = true) {
  const params = prepareStoredProcParams({
    name: name.trim(),
    description,
    active: active ? 1 : 0
  });

  try {
    const result = await sequelize.query(SQL.ROLE.ROLE_CREATE, {
      replacements: params,
      type: QueryTypes.SELECT
    });

    // sp_InsertRole returns { NewId: X }
    const newIdRow = Array.isArray(result) ? result.find(r => typeof r?.NewId !== 'undefined') : null;
    const newId = newIdRow?.NewId;
    if (!newId) {
      throw new Error('Create operation did not return new ID');
    }

    const createdRole = await getRoleById(newId);
    return createdRole || {
      id: Number(newId),
      name: name.trim(),
      description,
      active: !!active
    };
  } catch (error) {
    console.error('Error creating role:', error);
    throw error;
  }
}

/**
 * Get role by ID
 */
export async function getRoleById(id) {
  const rows = await sequelize.query(SQL.ROLE.ROLE_GET_BY_ID, {
    replacements: { id: Number(id) },
    type: QueryTypes.SELECT
  });
  return getFirstResult(rows);
}

/**
 * List all roles
 */
export async function listRoles() {
  const rows = await sequelize.query(SQL.ROLE.ROLE_GET_ALL, {
    type: QueryTypes.SELECT
  });
  return rows || [];
}

/**
 * Search roles by name
 */
export async function searchRoles(searchTerm) {
  const sanitizedSearch = sanitizeSearchQuery(searchTerm);
  if (!sanitizedSearch) {
    return [];
  }
  const rows = await sequelize.query(SQL.ROLE.ROLE_SEARCH, {
    replacements: { name: sanitizedSearch },
    type: QueryTypes.SELECT
  });
  return rows || [];
}

/**
 * Update role
 */
export async function updateRole(id, name, description = null, active) {
  const params = prepareStoredProcParams({
    id: Number(id),
    name: name.trim(),
    description,
    active: typeof active === 'undefined' ? null : (active ? 1 : 0)
  });

  try {
    await sequelize.query(SQL.ROLE.ROLE_UPDATE, {
      replacements: params,
      type: QueryTypes.RAW
    });
    return await getRoleById(id);
  } catch (error) {
    console.error('Error updating role:', error);
    throw error;
  }
}

/**
 * Activate role
 */
export async function activateRole(id) {
  await sequelize.query(SQL.ROLE.ROLE_ACTIVATE, {
    replacements: { id: Number(id) },
    type: QueryTypes.RAW
  });
  return await getRoleById(id);
}

/**
 * Deactivate role
 */
export async function deactivateRole(id) {
  await sequelize.query(SQL.ROLE.ROLE_DEACTIVATE, {
    replacements: { id: Number(id) },
    type: QueryTypes.RAW
  });
  return await getRoleById(id);
}
