// src/routes/periode.routes.js

import express from 'express';
import { isAuth } from '../middlewares/isAuth.js';
import { errorHandler } from '../middlewares/responseHandler.js';
import {
  validatePeriodeCreate,
  validatePeriodeUpdate,
  validatePeriodeId,
  validatePeriodeListByType,
  validatePeriodeYearParam
} from '../middlewares/periode/validateInput.js';
import {
  canCreatePeriode,
  canReadPeriode,
  canUpdatePeriode
} from '../middlewares/periode/hasPermission.js';
import * as controller from '../controllers/periode.controller.js';

const router = express.Router();

router.use(isAuth);

// Create
router.post(
  '/',
  canCreatePeriode,
  validatePeriodeCreate,
  controller.createPeriode
);

// List by type (must be before /:id to avoid route conflicts)
router.get(
  '/by-type',
  canReadPeriode,
  validatePeriodeListByType,
  controller.listPeriodesByType
);

// List active years (must be before /:id to avoid route conflicts)
router.get(
  '/years',
  canReadPeriode,
  controller.listYears
);

// List periodes by specific year (must be before /:id to avoid route conflicts)
router.get(
  '/years/:year',
  canReadPeriode,
  validatePeriodeYearParam,
  controller.listPeriodesByYear
);

// Get active by id
router.get(
  '/:id',
  validatePeriodeId,
  canReadPeriode,
  controller.getPeriodeById
);

// List active
router.get(
  '/',
  canReadPeriode,
  controller.listActivePeriodes
);

// Update
router.patch(
  '/:id',
  validatePeriodeId,
  canUpdatePeriode,
  validatePeriodeUpdate,
  controller.updatePeriode
);

// Activate
router.post(
  '/:id/activate',
  validatePeriodeId,
  canUpdatePeriode,
  controller.activatePeriode
);

// Deactivate
router.post(
  '/:id/deactivate',
  validatePeriodeId,
  canUpdatePeriode,
  controller.deactivatePeriode
);

// Error handler for this router
router.use(errorHandler);

export default router;
