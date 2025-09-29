// src/routes/typeperiode.routes.js

import express from 'express';
import { isAuth } from '../middlewares/isAuth.js';

import {
  validateTypePeriodeCreate,
  validateTypePeriodeUpdate,
  validateTypePeriodeId
} from '../middlewares/typeperiode/validateInput.js';

import {
  canCreateTypePeriode,
  canReadTypePeriode,
  canUpdateTypePeriode
} from '../middlewares/typeperiode/hasPermission.js';

import * as controller from '../controllers/typeperiode.controller.js';

const router = express.Router();

router.use(isAuth);

// Create
router.post(
  '/',
  canCreateTypePeriode,
  validateTypePeriodeCreate,
  controller.createTypePeriode
);

// Get active by id
router.get(
  '/:id',
  validateTypePeriodeId,
  canReadTypePeriode,
  controller.getTypePeriodeById
);

// List active
router.get(
  '/',
  canReadTypePeriode,
  controller.listActiveTypePeriodes
);

// Update
router.patch(
  '/:id',
  validateTypePeriodeId,
  canUpdateTypePeriode,
  validateTypePeriodeUpdate,
  controller.updateTypePeriode
);

// Activate
router.post(
  '/:id/activate',
  validateTypePeriodeId,
  canUpdateTypePeriode,
  controller.activateTypePeriode
);

// Deactivate
router.post(
  '/:id/deactivate',
  validateTypePeriodeId,
  canUpdateTypePeriode,
  controller.deactivateTypePeriode
);

export default router;
