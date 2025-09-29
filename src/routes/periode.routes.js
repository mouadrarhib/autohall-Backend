// src/routes/periode.routes.js

import express from 'express';
import { isAuth } from '../middlewares/isAuth.js';

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

router.get(
  '/by-type',
  canReadPeriode,
  validatePeriodeListByType,
  controller.listPeriodesByType
);

// NEW: list active years
router.get(
  '/years',
  canReadPeriode,
  controller.listPeriodeYears
);

router.get(
  '/years/:year',
  canReadPeriode,
  validatePeriodeYearParam,
  controller.listPeriodesByYear
);
export default router;
