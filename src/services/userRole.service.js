// src/services/userRole.service.js
import { sequelize } from '../config/database.js';
import { SQL } from '../sql/snippets.js';
import { QueryTypes } from 'sequelize';
import { prepareStoredProcParams, getFirstResult } from '../helpers/databaseHelpers.js';

/** Link or reactivate a user/role */
export async function link(userId, roleId, active = true) {
  const params = prepareStoredProcParams({
    userId: Number(userId),
    roleId: Number(roleId),
    active: active ? 1 : 0
  });
  await sequelize.query(SQL.USER_ROLE.LINK, { replacements: params, type: QueryTypes.RAW });
  return { userId: Number(userId), roleId: Number(roleId), active: !!active };
}

/** Unlink (delete) a user/role */
export async function unlink(userId, roleId) {
  await sequelize.query(SQL.USER_ROLE.UNLINK, {
    replacements: { userId: Number(userId), roleId: Number(roleId) },
    type: QueryTypes.RAW
  });
  return { userId: Number(userId), roleId: Number(roleId) };
}

/** Set active on a link */
export async function setActive(userId, roleId, active) {
  const params = prepareStoredProcParams({
    userId: Number(userId),
    roleId: Number(roleId),
    active: active ? 1 : 0
  });
  await sequelize.query(SQL.USER_ROLE.SET_ACTIVE, { replacements: params, type: QueryTypes.RAW });
  return { userId: Number(userId), roleId: Number(roleId), active: !!active };
}

/** Toggle active on a link */
export async function toggle(userId, roleId) {
  await sequelize.query(SQL.USER_ROLE.TOGGLE, {
    replacements: { userId: Number(userId), roleId: Number(roleId) },
    type: QueryTypes.RAW
  });
  return { userId: Number(userId), roleId: Number(roleId) };
}

/** List roles by user */
export async function listRolesByUser(userId, activeOnly = true) {
  const rows = await sequelize.query(SQL.USER_ROLE.LIST_ROLES_BY_USER, {
    replacements: { userId: Number(userId), activeOnly: activeOnly ? 1 : 0 },
    type: QueryTypes.SELECT
  });
  return rows || [];
}

/** List users by role */
export async function listUsersByRole(roleId, activeOnly = true) {
  const rows = await sequelize.query(SQL.USER_ROLE.LIST_USERS_BY_ROLE, {
    replacements: { roleId: Number(roleId), activeOnly: activeOnly ? 1 : 0 },
    type: QueryTypes.SELECT
  });
  return rows || [];
}

/** Bulk: link roles to user */
export async function bulkLinkRolesToUser(userId, roleIds, active = true) {
  const params = prepareStoredProcParams({
    userId: Number(userId),
    roleIds,
    active: active ? 1 : 0
  });
  await sequelize.query(SQL.USER_ROLE.BULK_LINK_ROLES_TO_USER, { replacements: params, type: QueryTypes.RAW });
  return { userId: Number(userId), roleIds, active: !!active };
}

/** Bulk: link users to role */
export async function bulkLinkUsersToRole(roleId, userIds, active = true) {
  const params = prepareStoredProcParams({
    roleId: Number(roleId),
    userIds,
    active: active ? 1 : 0
  });
  await sequelize.query(SQL.USER_ROLE.BULK_LINK_USERS_TO_ROLE, { replacements: params, type: QueryTypes.RAW });
  return { roleId: Number(roleId), userIds, active: !!active };
}

/** Bulk: set active by user */
export async function bulkSetActiveByUser(userId, roleIds, active) {
  const params = prepareStoredProcParams({
    userId: Number(userId),
    roleIds,
    active: active ? 1 : 0
  });
  await sequelize.query(SQL.USER_ROLE.BULK_SET_ACTIVE_BY_USER, { replacements: params, type: QueryTypes.RAW });
  return { userId: Number(userId), roleIds, active: !!active };
}

/** Bulk: set active by role */
export async function bulkSetActiveByRole(roleId, userIds, active) {
  const params = prepareStoredProcParams({
    roleId: Number(roleId),
    userIds,
    active: active ? 1 : 0
  });
  await sequelize.query(SQL.USER_ROLE.BULK_SET_ACTIVE_BY_ROLE, { replacements: params, type: QueryTypes.RAW });
  return { roleId: Number(roleId), userIds, active: !!active };
}

/** Sync roles for a user (replace) */
export async function syncRolesForUser(userId, roleIds, active = true) {
  const params = prepareStoredProcParams({
    userId: Number(userId),
    roleIds,
    active: active ? 1 : 0
  });
  await sequelize.query(SQL.USER_ROLE.SYNC_ROLES_FOR_USER, { replacements: params, type: QueryTypes.RAW });
  return { userId: Number(userId), roleIds, active: !!active };
}

/** Sync users for a role (replace) */
export async function syncUsersForRole(roleId, userIds, active = true) {
  const params = prepareStoredProcParams({
    roleId: Number(roleId),
    userIds,
    active: active ? 1 : 0
  });
  await sequelize.query(SQL.USER_ROLE.SYNC_USERS_FOR_ROLE, { replacements: params, type: QueryTypes.RAW });
  return { roleId: Number(roleId), userIds, active: !!active };
}

/** Check if user has role */
export async function hasRole(userId, roleId, activeOnly = true) {
  const rows = await sequelize.query(SQL.USER_ROLE.HAS_ROLE, {
    replacements: { userId: Number(userId), roleId: Number(roleId), activeOnly: activeOnly ? 1 : 0 },
    type: QueryTypes.SELECT
  });
  const row = getFirstResult(rows);
  return { userId: Number(userId), roleId: Number(roleId), hasRole: !!row?.HasRole };
}

/** Count users for a role */
export async function countUsersForRole(roleId, activeOnly = true) {
  const rows = await sequelize.query(SQL.USER_ROLE.COUNT_USERS_FOR_ROLE, {
    replacements: { roleId: Number(roleId), activeOnly: activeOnly ? 1 : 0 },
    type: QueryTypes.SELECT
  });
  const row = getFirstResult(rows);
  return { roleId: Number(roleId), count: Number(row?.UserCount || 0) };
}
