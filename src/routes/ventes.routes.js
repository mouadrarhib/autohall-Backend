// src/routes/ventes.routes.js

import express from 'express';
import { isAuth } from '../middlewares/isAuth.js';
import { errorHandler } from '../middlewares/responseHandler.js';
import {
  validateVenteCreate,
  validateVenteUpdate,
  validateVenteId
} from '../middlewares/ventes/validateInput.js';
import {
  canCreateVente,
  canReadVente,
  canUpdateVente,
  canAccessAnalytics
} from '../middlewares/ventes/hasPermission.js';
import * as controller from '../controllers/ventes.controller.js';

const router = express.Router();

router.use(isAuth);

// Analytics routes - must be before /:id to avoid route conflicts
router.get(
  '/analytics/summary',
  canAccessAnalytics,
  controller.getSummaryByPeriod
);

router.get(
  '/analytics/performance',
  canAccessAnalytics,
  controller.getPerformanceByVehicle
);

router.get(
  '/analytics/top-performers',
  canAccessAnalytics,
  controller.getTopPerformers
);

router.get(
  '/analytics/compare',
  canAccessAnalytics,
  controller.comparePeriods
);

router.get(
  '/analytics/yoy-growth',
  canAccessAnalytics,
  controller.getYearOverYearGrowth
);

// CRUD routes
// Create
router.post(
  '/',
  canCreateVente,
  validateVenteCreate,
  controller.createVente
);

// Get by id
router.get(
  '/:id',
  validateVenteId,
  canReadVente,
  controller.getVenteById
);

// List with filters
router.get(
  '/',
  canReadVente,
  controller.listVentes
);

// Update
router.patch(
  '/:id',
  validateVenteId,
  canUpdateVente,
  validateVenteUpdate,
  controller.updateVente
);

// Activate
router.post(
  '/:id/activate',
  validateVenteId,
  canUpdateVente,
  controller.activateVente
);

// Deactivate
router.post(
  '/:id/deactivate',
  validateVenteId,
  canUpdateVente,
  controller.deactivateVente
);

// Error handler for this router
router.use(errorHandler);

export default router;
