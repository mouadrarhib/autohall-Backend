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

// IMPORTANT: Static routes MUST come before parameterized routes like /:id

// List active periodes (MOVED TO TOP)
router.get(
  '/',
  canReadPeriode,
  controller.listActivePeriodes
);

// List by type
router.get(
  '/by-type',
  canReadPeriode,
  validatePeriodeListByType,
  controller.listPeriodesByType
);

// List active years
router.get(
  '/years',
  canReadPeriode,
  controller.listYears
);

// List periodes by specific year
router.get(
  '/years/:year',
  canReadPeriode,
  validatePeriodeYearParam,
  controller.listPeriodesByYear
);

// Create
router.post(
  '/',
  canCreatePeriode,
  validatePeriodeCreate,
  controller.createPeriode
);

// Get by ID (MUST come after all static GET routes)
router.get(
  '/:id',
  validatePeriodeId,
  canReadPeriode,
  controller.getPeriodeById
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
