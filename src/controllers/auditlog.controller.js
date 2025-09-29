// src/controllers/auditlog.controller.js

import { asyncHandler } from '../helpers/asyncHandler.js';
import { mapSqlError } from '../helpers/sqlErrorMapper.js';
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
export const countByDay = asyncHandler(async (req, res) => {
  const { fromUtc, toUtc, module = null, action = null } = req.query;
  
  const data = await auditlogService.countByDay(fromUtc, toUtc, module, action);
  res.json({ data });
});

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
export const countByHour = asyncHandler(async (req, res) => {
  const { fromUtc, toUtc, module = null, action = null } = req.query;
  
  const data = await auditlogService.countByHour(fromUtc, toUtc, module, action);
  res.json({ data });
});

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
export const exportWindow = asyncHandler(async (req, res) => {
  const { fromUtc, toUtc } = req.query;
  const lastId = parseInteger(req.query.lastId) || 0;
  const batchSize = Math.min(parseInteger(req.query.batchSize) || 50000, 100000);
  
  const result = await auditlogService.exportWindow(fromUtc, toUtc, lastId, batchSize);
  res.json(result);
});

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
export const getById = asyncHandler(async (req, res) => {
  const id = Number(req.params.id);
  const auditlog = await auditlogService.getAuditLogById(id);
  
  if (!auditlog) {
    return res.status(404).json({ error: 'Audit log not found' });
  }
  
  res.json({ data: auditlog });
});

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
export const latestPerModule = asyncHandler(async (req, res) => {
  const data = await auditlogService.getLatestPerModule();
  res.json({ data });
});

/**
 * @openapi
 * /api/audit-logs/actions:
 *   get:
 *     summary: List distinct actions
 *     tags: [AuditLogs]
 *     parameters:
 *       - in: query
 *         name: module
 *         schema:
 *           type: string
 *           nullable: true
 *     responses:
 *       200:
 *         description: List of action names
 */
export const listActions = asyncHandler(async (req, res) => {
  const module = req.query.module || null;
  const data = await auditlogService.listActions(module);
  res.json({ data });
});

/**
 * @openapi
 * /api/audit-logs/modules:
 *   get:
 *     summary: List distinct modules
 *     tags: [AuditLogs]
 *     responses:
 *       200:
 *         description: List of module names
 */
export const listModules = asyncHandler(async (req, res) => {
  const data = await auditlogService.listModules();
  res.json({ data });
});

/**
 * @openapi
 * /api/audit-logs/users:
 *   get:
 *     summary: List distinct user IDs
 *     tags: [AuditLogs]
 *     parameters:
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
 *         description: List of user IDs
 */
export const listUsers = asyncHandler(async (req, res) => {
  const module = req.query.module || null;
  const action = req.query.action || null;
  const data = await auditlogService.listUsers(module, action);
  res.json({ data });
});

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
export const purgeRolling = asyncHandler(async (req, res) => {
  const retainDays = parseInteger(req.body?.retainDays) || 90;
  const module = req.body?.module || null;
  const action = req.body?.action || null;

  try {
    const data = await auditlogService.purgeRolling(retainDays, module, action);
    res.json({ data });
  } catch (err) {
    const { status, message } = mapSqlError(err);
    res.status(status).json({ error: message });
  }
});

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
export const topActions = asyncHandler(async (req, res) => {
  const { fromUtc, toUtc } = req.query;
  const topN = Math.min(parseInteger(req.query.topN) || 10, 1000);
  const module = req.query.module || null;
  
  const data = await auditlogService.getTopActions(fromUtc, toUtc, topN, module);
  res.json({ data });
});

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
export const topUsers = asyncHandler(async (req, res) => {
  const { fromUtc, toUtc } = req.query;
  const topN = Math.min(parseInteger(req.query.topN) || 10, 1000);
  const module = req.query.module || null;
  const action = req.query.action || null;
  
  const data = await auditlogService.getTopUsers(fromUtc, toUtc, topN, module, action);
  res.json({ data });
});

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
export const write = asyncHandler(async (req, res) => {
  const logData = {
    ...req.body,
    userId: req.body.userId || req.user?.id || null,
    ip: req.ip || '0.0.0.0',
    scope: req.body.scope || 'api'
  };

  const data = await auditlogService.writeAuditLog(logData);
  res.status(201).json({ data });
});

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
export const writeFromSession = asyncHandler(async (req, res) => {
  const logData = {
    ...req.body,
    ip: req.ip || '0.0.0.0',
    scope: req.body.scope || 'api'
  };
  
  const userId = req.user?.id || 'anonymous';
  const data = await auditlogService.writeAuditLogFromSession(logData, userId);
  
  res.status(201).json({ data });
});
