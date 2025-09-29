// src/services/auth.service.js

import bcrypt from 'bcryptjs';
import { sequelize } from '../config/database.js';
import { SQL } from '../sql/snippets.js';
import { verifyPassword } from '../helpers/password.js';
import { QueryTypes } from 'sequelize';

/**
 * createUser - uses your CREATE_USER proc (expects @username, @email, @password)
 */
export async function createUser({ username, email, password } = {}) {
  const password_hash = await bcrypt.hash(password, 10);
  const rows = await sequelize.query(SQL.USER.CREATE_USER, { // changed
    replacements: { username, email, password: password_hash },
    type: QueryTypes.SELECT
  });
  const createdRow = Array.isArray(rows) ? rows.find(r => typeof r?.NewUserId !== 'undefined') : null;
  return { createdRow, raw: rows };
}

/**
 * findUserByEmail - uses your FIND_USER_BY_EMAIL proc
 */
export async function findUserByEmail(email) {
  const rows = await sequelize.query(SQL.USER.FIND_USER_BY_EMAIL, { // changed
    replacements: { email },
    type: QueryTypes.SELECT
  });
  return rows[0] || null;
}

/**
 * findUserByUsername - fallback SELECT (useful if your login uses username)
 * If you prefer login-by-email, change controller to call findUserByEmail instead.
 */
export async function findUserByUsername(username) {
  const rows = await sequelize.query(
    `SELECT TOP 1 id, full_name, email, username, [password] AS password, actif, active
     FROM dbo.[User]
     WHERE username = :username AND active = 1
     ORDER BY id ASC;`,
    { replacements: { username }, type: QueryTypes.SELECT }
  );
  return rows[0] || null;
}

/**
 * getUserById - uses GET_USER_BY_ID proc
 */
export async function getUserById(id) {
  const rows = await sequelize.query(SQL.USER.GET_USER_BY_ID, { // changed
    replacements: { id },
    type: QueryTypes.SELECT
  });
  return rows[0] || null;
}

/**
 * getRolesForUser - currently no roles stored-proc available in DB.
 * Return an empty array for now (controller expects an array).
 */
export async function getRolesForUser(userId) {
  return [];
}

/**
 * getPermsForUser - same as roles: return empty array until you add the proc.
 */
export async function getPermsForUser(userId) {
  return [];
}

/**
 * checkPassword - wrapper for verifyPassword (handles bcrypt + legacy)
 */
export async function checkPassword(inputPassword, hashedPasswordOrLegacy) {
  return verifyPassword(inputPassword, hashedPasswordOrLegacy);
}

export async function createUserWithRolePermissionsAndSite({
  full_name,
  email,
  username,
  password,
  groupement_name,
  site_id,
  role_ids = null,
  permission_ids = null
} = {}) {
  const password_hash = await bcrypt.hash(password, 10);
  const rows = await sequelize.query(SQL.USER.CREATE_USER_WITH_ROLES_PERMISSIONS_SITE, { // changed
    replacements: {
      full_name,
      email,
      username,
      password: password_hash,
      groupement_name,
      site_id,
      role_ids: role_ids ? role_ids.join(',') : null,
      permission_ids: permission_ids ? permission_ids.join(',') : null
    },
    type: QueryTypes.SELECT
  });
  const createdRow = Array.isArray(rows) ? rows[0] : null;
  return { createdRow, raw: rows };
}

/**
 * getAllUsersCompleteInfo - fetch all users with complete information
 */
export async function getAllUsersCompleteInfo() {
  const rows = await sequelize.query(SQL.USER.GET_ALL_USERS_COMPLETE_INFO, { // changed
    type: QueryTypes.SELECT
  });
  return rows;
}

/**
 * getUserCompleteInfoById - fetch specific user with complete information
 */
export async function getUserCompleteInfoById(userId) {
  const rows = await sequelize.query(SQL.USER.GET_USER_COMPLETE_INFO_BY_ID, { // changed
    replacements: { userId },
    type: QueryTypes.SELECT
  });
  return rows[0] || null;
}

/**
 * getUsersBySiteType - fetch users by groupement type (filiale/succursale)
 */
export async function getUsersBySiteType(groupementType) {
  const rows = await sequelize.query(SQL.USER.GET_USERS_BY_SITE_TYPE, { // changed
    replacements: { groupementType },
    type: QueryTypes.SELECT
  });
  return rows;
}

/**
 * getActiveUsersCompleteInfo - fetch only active users with complete information
 */
export async function getActiveUsersCompleteInfo() {
  const rows = await sequelize.query(SQL.USER.GET_ACTIVE_USERS_COMPLETE_INFO, { // changed
    type: QueryTypes.SELECT
  });
  return rows;
}

/**
 * getAvailableSites - get all available sites for user assignment
 */
export async function getAvailableSites() {
  const [filiales, succursales, groupements] = await Promise.all([
    sequelize.query(SQL.LOOKUP.GET_ALL_FILIALES, { type: QueryTypes.SELECT }),    // changed
    sequelize.query(SQL.LOOKUP.GET_ALL_SUCCURSALES, { type: QueryTypes.SELECT }), // changed
    sequelize.query(SQL.LOOKUP.GET_ALL_GROUPEMENTS, { type: QueryTypes.SELECT })  // changed
  ]);
  return { filiales, succursales, groupements };
}
