// src/services/auditlog.service.js

import { sequelize } from '../config/database.js';
import { SQL } from '../sql/snippets.js';
import { QueryTypes } from 'sequelize';
import { parseInteger } from '../helpers/queryHelpers.js';
import { getFirstResult, hasResults, prepareStoredProcParams } from '../helpers/databaseHelpers.js';

/**
 * Count audit logs by day
 */
export async function countByDay(fromUtc, toUtc, module = null, action = null) {
  const rows = await sequelize.query(SQL.AUDITLOG.AUDITLOG_COUNT_BY_DAY, {
    replacements: { fromUtc, toUtc, module, action },
    type: QueryTypes.SELECT
  });
  return rows || [];
}

/**
 * Count audit logs by hour
 */
export async function countByHour(fromUtc, toUtc, module = null, action = null) {
  const rows = await sequelize.query(SQL.AUDITLOG.AUDITLOG_COUNT_BY_HOUR, {
    replacements: { fromUtc, toUtc, module, action },
    type: QueryTypes.SELECT
  });
  return rows || [];
}

/**
 * Export audit logs in time window with pagination
 */
export async function exportWindow(fromUtc, toUtc, lastId = 0, batchSize = 50000) {
  const rows = await sequelize.query(SQL.AUDITLOG.AUDITLOG_EXPORT_WINDOW, {
    replacements: {
      fromUtc,
      toUtc,
      lastId: Number(lastId),
      batchSize: Number(batchSize)
    },
    type: QueryTypes.SELECT
  });
  return {
    data: rows || [],
    next: rows && rows.length ? rows[rows.length - 1].id : null,
    hasMore: rows && rows.length === batchSize
  };
}

/**
 * Get audit log by ID
 */
export async function getAuditLogById(id) {
  const rows = await sequelize.query(SQL.AUDITLOG.AUDITLOG_GET_BY_ID, {
    replacements: { id: Number(id) },
    type: QueryTypes.SELECT
  });
  return getFirstResult(rows);
}

/**
 * Get latest audit log per module
 */
export async function getLatestPerModule() {
  const rows = await sequelize.query(SQL.AUDITLOG.AUDITLOG_LATEST_PER_MODULE, {
    type: QueryTypes.SELECT
  });
  return rows || [];
}

/**
 * List distinct actions
 */
export async function listActions(module = null) {
  const rows = await sequelize.query(SQL.AUDITLOG.AUDITLOG_LIST_ACTIONS, {
    replacements: { module },
    type: QueryTypes.SELECT
  });
  return rows ? rows.map(r => r.action) : [];
}

/**
 * List distinct modules
 */
export async function listModules() {
  const rows = await sequelize.query(SQL.AUDITLOG.AUDITLOG_LIST_MODULES, {
    type: QueryTypes.SELECT
  });
  return rows ? rows.map(r => r.module) : [];
}

/**
 * List distinct users
 */
export async function listUsers(module = null, action = null) {
  const rows = await sequelize.query(SQL.AUDITLOG.AUDITLOG_LIST_USERS, {
    replacements: { module, action },
    type: QueryTypes.SELECT
  });
  return rows ? rows.map(r => r.userId) : [];
}

/**
 * Purge audit logs with rolling retention
 */
export async function purgeRolling(retainDays = 90, module = null, action = null) {
  const rows = await sequelize.query(SQL.AUDITLOG.AUDITLOG_PURGE_ROLLING, {
    replacements: {
      retainDays: Number(retainDays),
      module,
      action
    },
    type: QueryTypes.SELECT
  });
  return getFirstResult(rows);
}

/**
 * Get top actions in time window
 */
export async function getTopActions(fromUtc, toUtc, topN = 10, module = null) {
  const rows = await sequelize.query(SQL.AUDITLOG.AUDITLOG_TOP_ACTIONS, {
    replacements: {
      fromUtc,
      toUtc,
      topN: Number(topN),
      module
    },
    type: QueryTypes.SELECT
  });
  return rows || [];
}

/**
 * Get top users in time window
 */
export async function getTopUsers(fromUtc, toUtc, topN = 10, module = null, action = null) {
  const rows = await sequelize.query(SQL.AUDITLOG.AUDITLOG_TOP_USERS, {
    replacements: {
      fromUtc,
      toUtc,
      topN: Number(topN),
      module,
      action
    },
    type: QueryTypes.SELECT
  });
  return rows || [];
}

/**
 * Write audit log entry
 */
export async function writeAuditLog(logData) {
  const {
    module,
    action,
    objectId = null,
    scope = 'api',
    userId = null,
    message = null,
    ip = '0.0.0.0',
    description = null
  } = logData;

  const rows = await sequelize.query(SQL.AUDITLOG.AUDITLOG_WRITE, {
    replacements: { module, action, objectId, scope, userId, message, ip, description },
    type: QueryTypes.SELECT
  });
  return getFirstResult(rows);
}

/**
 * Write audit log using session context
 */
export async function writeAuditLogFromSession(logData, userId) {
  const {
    module,
    action,
    objectId = null,
    scope = 'api',
    message = null,
    ip = '0.0.0.0',
    description = null
  } = logData;

  const data = await sequelize.transaction(async (t) => {
    await sequelize.query(
      "EXEC sys.sp_set_session_context @key=N'UserId', @value=:val;",
      { replacements: { val: String(userId) }, transaction: t }
    );

    const rows = await sequelize.query(SQL.AUDITLOG.AUDITLOG_WRITE_FROM_SESSION, {
      replacements: { module, action, objectId, scope, message, ip, description },
      type: QueryTypes.SELECT,
      transaction: t
    });

    await sequelize.query(
      "EXEC sys.sp_set_session_context @key=N'UserId', @value=NULL;",
      { transaction: t }
    );

    return getFirstResult(rows);
  });

  return data;
}
