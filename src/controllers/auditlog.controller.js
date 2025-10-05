// src/controllers/auditlog.controller.js

import { AppError, sendSuccess } from '../middlewares/responseHandler.js';
import { parseInteger } from '../helpers/queryHelpers.js';
import * as auditlogService from '../services/auditlog.service.js';

/**
 * @openapi
 * tags:
 *   - name: AuditLogs
 *     description: Audit logging and analytics
 */

/**
 * @openapi
 * /api/audit-logs/count-by-day:
 *   get:
 *     summary: Count audit logs by day in time window
 *     tags: [AuditLogs]
 *     parameters:
 *       - in: query
 *         name: fromUtc
 *         required: true
 *         schema:
 *           type: string
 *           format: date-time
 *       - in: query
 *         name: toUtc
 *         required: true
 *         schema:
 *           type: string
 *           format: date-time
 *       - in: query
 *         name: module
 *         schema:
 *           type: string
 *           nullable: true
 *       - in: query
 *         name: action
 *         schema:
 *           type: string
 *           nullable: true
 *     responses:
 *       200:
 *         description: Daily counts
 */
export const countByDay = async (req, res, next) => {
  try {
    const { fromUtc, toUtc, module = null, action = null } = req.query;
    const data = await auditlogService.countByDay(fromUtc, toUtc, module, action);
    sendSuccess(res, data, 'Daily counts retrieved successfully');
  } catch (err) {
    next(new AppError(err.message, 500));
  }
};

/**
 * @openapi
 * /api/audit-logs/count-by-hour:
 *   get:
 *     summary: Count audit logs by hour in time window
 *     tags: [AuditLogs]
 *     parameters:
 *       - in: query
 *         name: fromUtc
 *         required: true
 *         schema:
 *           type: string
 *           format: date-time
 *       - in: query
 *         name: toUtc
 *         required: true
 *         schema:
 *           type: string
 *           format: date-time
 *       - in: query
 *         name: module
 *         schema:
 *           type: string
 *           nullable: true
 *       - in: query
 *         name: action
 *         schema:
 *           type: string
 *           nullable: true
 *     responses:
 *       200:
 *         description: Hourly counts
 */
export const countByHour = async (req, res, next) => {
  try {
    const { fromUtc, toUtc, module = null, action = null } = req.query;
    const data = await auditlogService.countByHour(fromUtc, toUtc, module, action);
    sendSuccess(res, data, 'Hourly counts retrieved successfully');
  } catch (err) {
    next(new AppError(err.message, 500));
  }
};

/**
 * @openapi
 * /api/audit-logs/export:
 *   get:
 *     summary: Export audit logs in time window with pagination
 *     tags: [AuditLogs]
 *     parameters:
 *       - in: query
 *         name: fromUtc
 *         required: true
 *         schema:
 *           type: string
 *           format: date-time
 *       - in: query
 *         name: toUtc
 *         required: true
 *         schema:
 *           type: string
 *           format: date-time
 *       - in: query
 *         name: lastId
 *         schema:
 *           type: integer
 *           default: 0
 *       - in: query
 *         name: batchSize
 *         schema:
 *           type: integer
 *           default: 50000
 *           maximum: 100000
 *     responses:
 *       200:
 *         description: Export data with pagination
 */
export const exportWindow = async (req, res, next) => {
  try {
    const { fromUtc, toUtc } = req.query;
    const lastId = parseInteger(req.query.lastId) || 0;
    const batchSize = Math.min(parseInteger(req.query.batchSize) || 50000, 100000);
    
    const result = await auditlogService.exportWindow(fromUtc, toUtc, lastId, batchSize);
    sendSuccess(res, result, 'Export data retrieved successfully');
  } catch (err) {
    next(new AppError(err.message, 500));
  }
};

/**
 * @openapi
 * /api/audit-logs/{id}:
 *   get:
 *     summary: Get audit log by ID
 *     tags: [AuditLogs]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Audit log found
 *       404:
 *         description: Audit log not found
 */
export const getById = async (req, res, next) => {
  try {
    const id = Number(req.params.id);
    const auditlog = await auditlogService.getAuditLogById(id);
    
    if (!auditlog) {
      return next(new AppError('Audit log not found', 404));
    }
    
    sendSuccess(res, auditlog, 'Audit log retrieved successfully');
  } catch (err) {
    next(new AppError(err.message, 500));
  }
};

/**
 * @openapi
 * /api/audit-logs/latest-per-module:
 *   get:
 *     summary: Get latest audit log per module
 *     tags: [AuditLogs]
 *     responses:
 *       200:
 *         description: Latest logs per module
 */
export const latestPerModule = async (req, res, next) => {
  try {
    const data = await auditlogService.getLatestPerModule();
    sendSuccess(res, data, 'Latest logs per module retrieved successfully');
  } catch (err) {
    next(new AppError(err.message, 500));
  }
};

/**
 * @openapi
 * /api/audit-logs/actions:
 *   get:
 *     summary: List distinct actions with pagination
 *     tags: [AuditLogs]
 *     parameters:
 *       - in: query
 *         name: module
 *         schema:
 *           type: string
 *           nullable: true
 *         description: Filter by module name
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *         description: Page number
 *       - in: query
 *         name: pageSize
 *         schema:
 *           type: integer
 *           default: 10
 *         description: Number of records per page
 *     responses:
 *       200:
 *         description: Paginated list of action names
 */
export const listActions = async (req, res, next) => {
  try {
    const module = req.query.module || null;
    const page = Number(req.query.page || 1);
    const pageSize = Number(req.query.pageSize || 10);
    
    const result = await auditlogService.listActions(module, page, pageSize);
    sendSuccess(res, result, 'Actions list retrieved successfully');
  } catch (err) {
    next(new AppError(err.message, 500));
  }
};

/**
 * @openapi
 * /api/audit-logs/modules:
 *   get:
 *     summary: List distinct modules with pagination
 *     tags: [AuditLogs]
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *         description: Page number
 *       - in: query
 *         name: pageSize
 *         schema:
 *           type: integer
 *           default: 10
 *         description: Number of records per page
 *     responses:
 *       200:
 *         description: Paginated list of module names
 */
export const listModules = async (req, res, next) => {
  try {
    const page = Number(req.query.page || 1);
    const pageSize = Number(req.query.pageSize || 10);
    
    const result = await auditlogService.listModules(page, pageSize);
    sendSuccess(res, result, 'Modules list retrieved successfully');
  } catch (err) {
    next(new AppError(err.message, 500));
  }
};

/**
 * @openapi
 * /api/audit-logs/users:
 *   get:
 *     summary: List distinct user IDs with pagination
 *     tags: [AuditLogs]
 *     parameters:
 *       - in: query
 *         name: module
 *         schema:
 *           type: string
 *           nullable: true
 *         description: Filter by module name
 *       - in: query
 *         name: action
 *         schema:
 *           type: string
 *           nullable: true
 *         description: Filter by action name
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *         description: Page number
 *       - in: query
 *         name: pageSize
 *         schema:
 *           type: integer
 *           default: 10
 *         description: Number of records per page
 *     responses:
 *       200:
 *         description: Paginated list of user IDs
 */
export const listUsers = async (req, res, next) => {
  try {
    const module = req.query.module || null;
    const action = req.query.action || null;
    const page = Number(req.query.page || 1);
    const pageSize = Number(req.query.pageSize || 10);
    
    const result = await auditlogService.listUsers(module, action, page, pageSize);
    sendSuccess(res, result, 'Users list retrieved successfully');
  } catch (err) {
    next(new AppError(err.message, 500));
  }
};

/**
 * @openapi
 * /api/audit-logs/purge-rolling:
 *   post:
 *     summary: Purge audit logs with rolling retention
 *     tags: [AuditLogs]
 *     requestBody:
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               retainDays:
 *                 type: integer
 *                 default: 90
 *               module:
 *                 type: string
 *                 nullable: true
 *               action:
 *                 type: string
 *                 nullable: true
 *     responses:
 *       200:
 *         description: Purge result
 */
export const purgeRolling = async (req, res, next) => {
  try {
    const retainDays = parseInteger(req.body?.retainDays) || 90;
    const module = req.body?.module || null;
    const action = req.body?.action || null;
    
    const data = await auditlogService.purgeRolling(retainDays, module, action);
    sendSuccess(res, data, 'Audit logs purged successfully');
  } catch (err) {
    next(new AppError(err.message, err.statusCode || 500));
  }
};

/**
 * @openapi
 * /api/audit-logs/top-actions:
 *   get:
 *     summary: Get top N actions in time window
 *     tags: [AuditLogs]
 *     parameters:
 *       - in: query
 *         name: fromUtc
 *         required: true
 *         schema:
 *           type: string
 *           format: date-time
 *       - in: query
 *         name: toUtc
 *         required: true
 *         schema:
 *           type: string
 *           format: date-time
 *       - in: query
 *         name: topN
 *         schema:
 *           type: integer
 *           default: 10
 *           maximum: 1000
 *       - in: query
 *         name: module
 *         schema:
 *           type: string
 *           nullable: true
 *     responses:
 *       200:
 *         description: Top actions
 */
export const topActions = async (req, res, next) => {
  try {
    const { fromUtc, toUtc } = req.query;
    const topN = Math.min(parseInteger(req.query.topN) || 10, 1000);
    const module = req.query.module || null;
    
    const data = await auditlogService.getTopActions(fromUtc, toUtc, topN, module);
    sendSuccess(res, data, 'Top actions retrieved successfully');
  } catch (err) {
    next(new AppError(err.message, 500));
  }
};

/**
 * @openapi
 * /api/audit-logs/top-users:
 *   get:
 *     summary: Get top N users in time window
 *     tags: [AuditLogs]
 *     parameters:
 *       - in: query
 *         name: fromUtc
 *         required: true
 *         schema:
 *           type: string
 *           format: date-time
 *       - in: query
 *         name: toUtc
 *         required: true
 *         schema:
 *           type: string
 *           format: date-time
 *       - in: query
 *         name: topN
 *         schema:
 *           type: integer
 *           default: 10
 *           maximum: 1000
 *       - in: query
 *         name: module
 *         schema:
 *           type: string
 *           nullable: true
 *       - in: query
 *         name: action
 *         schema:
 *           type: string
 *           nullable: true
 *     responses:
 *       200:
 *         description: Top users
 */
export const topUsers = async (req, res, next) => {
  try {
    const { fromUtc, toUtc } = req.query;
    const topN = Math.min(parseInteger(req.query.topN) || 10, 1000);
    const module = req.query.module || null;
    const action = req.query.action || null;
    
    const data = await auditlogService.getTopUsers(fromUtc, toUtc, topN, module, action);
    sendSuccess(res, data, 'Top users retrieved successfully');
  } catch (err) {
    next(new AppError(err.message, 500));
  }
};

/**
 * @openapi
 * /api/audit-logs/write:
 *   post:
 *     summary: Write audit log entry
 *     tags: [AuditLogs]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - module
 *               - action
 *             properties:
 *               module:
 *                 type: string
 *               action:
 *                 type: string
 *               objectId:
 *                 type: integer
 *                 nullable: true
 *               scope:
 *                 type: string
 *                 default: "api"
 *               userId:
 *                 type: integer
 *                 nullable: true
 *               message:
 *                 type: string
 *                 nullable: true
 *               description:
 *                 type: string
 *                 nullable: true
 *     responses:
 *       201:
 *         description: Audit log created
 */
export const write = async (req, res, next) => {
  try {
    const logData = {
      ...req.body,
      userId: req.body.userId || req.user?.id || null,
      ip: req.ip || '0.0.0.0',
      scope: req.body.scope || 'api'
    };
    
    const data = await auditlogService.writeAuditLog(logData);
    sendSuccess(res, data, 'Audit log created successfully', 201);
  } catch (err) {
    next(new AppError(err.message, 500));
  }
};

/**
 * @openapi
 * /api/audit-logs/write-from-session:
 *   post:
 *     summary: Write audit log using session context
 *     tags: [AuditLogs]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - module
 *               - action
 *             properties:
 *               module:
 *                 type: string
 *               action:
 *                 type: string
 *               objectId:
 *                 type: integer
 *                 nullable: true
 *               scope:
 *                 type: string
 *                 default: "api"
 *               message:
 *                 type: string
 *                 nullable: true
 *               description:
 *                 type: string
 *                 nullable: true
 *     responses:
 *       201:
 *         description: Audit log created
 */
export const writeFromSession = async (req, res, next) => {
  try {
    const logData = {
      ...req.body,
      ip: req.ip || '0.0.0.0',
      scope: req.body.scope || 'api'
    };
    
    const userId = req.user?.id || 'anonymous';
    const data = await auditlogService.writeAuditLogFromSession(logData, userId);
    sendSuccess(res, data, 'Audit log created successfully', 201);
  } catch (err) {
    next(new AppError(err.message, 500));
  }
};
