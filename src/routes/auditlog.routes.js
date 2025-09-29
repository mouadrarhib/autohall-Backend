// src/routes/auditlog.routes.js

import express from 'express';
import { isAuth } from '../middlewares/isAuth.js';

// Import validation middleware
import {
  validateTimeWindow,
  validateExportWindow,
  validateWriteAuditLog,
  validatePurgeRolling,
  validateAuditLogId,
  validateAuditLogQuery
} from '../middlewares/auditlog/validateInput.js';

// Import permission middleware
import {
  canReadAuditLog,
  canWriteAuditLog,
  canExportAuditLog,
  canPurgeAuditLog,
  canAnalyzeAuditLog
} from '../middlewares/auditlog/hasPermission.js';

// Import controller
import * as auditlogController from '../controllers/auditlog.controller.js';

const router = express.Router();

// All routes require authentication
router.use(isAuth);

// Analytics routes
router.get('/count-by-day', 
  canAnalyzeAuditLog,
  validateTimeWindow,
  validateAuditLogQuery,
  auditlogController.countByDay
);

router.get('/count-by-hour', 
  canAnalyzeAuditLog,
  validateTimeWindow,
  validateAuditLogQuery,
  auditlogController.countByHour
);

router.get('/top-actions', 
  canAnalyzeAuditLog,
  validateTimeWindow,
  validateAuditLogQuery,
  auditlogController.topActions
);

router.get('/top-users', 
  canAnalyzeAuditLog,
  validateTimeWindow,
  validateAuditLogQuery,
  auditlogController.topUsers
);

// Export route
router.get('/export', 
  canExportAuditLog,
  validateExportWindow,
  auditlogController.exportWindow
);

// Get audit log by ID
router.get('/:id', 
  validateAuditLogId,
  canReadAuditLog,
  auditlogController.getById
);

// List routes
router.get('/latest-per-module', 
  canReadAuditLog,
  auditlogController.latestPerModule
);

router.get('/actions', 
  canReadAuditLog,
  validateAuditLogQuery,
  auditlogController.listActions
);

router.get('/modules', 
  canReadAuditLog,
  auditlogController.listModules
);

router.get('/users', 
  canReadAuditLog,
  validateAuditLogQuery,
  auditlogController.listUsers
);

// Write routes
router.post('/write', 
  canWriteAuditLog,
  validateWriteAuditLog,
  auditlogController.write
);

router.post('/write-from-session', 
  canWriteAuditLog,
  validateWriteAuditLog,
  auditlogController.writeFromSession
);

// Purge route
router.post('/purge-rolling', 
  canPurgeAuditLog,
  validatePurgeRolling,
  auditlogController.purgeRolling
);

export default router;
