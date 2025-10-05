// src/routes/typevente.routes.js

import express from 'express';
import { isAuth } from '../middlewares/isAuth.js';
import { errorHandler } from '../middlewares/responseHandler.js';
import {
  validateTypeVenteCreate,
  validateTypeVenteUpdate,
  validateTypeVenteId
} from '../middlewares/typevente/validateInput.js';
import {
  canCreateTypeVente,
  canReadTypeVente,
  canUpdateTypeVente
} from '../middlewares/typevente/hasPermission.js';
import * as controller from '../controllers/typevente.controller.js';

const router = express.Router();

router.use(isAuth);

// Create
router.post(
  '/',
  canCreateTypeVente,
  validateTypeVenteCreate,
  controller.createTypeVente
);

// Get active by id
router.get(
  '/:id',
  validateTypeVenteId,
  canReadTypeVente,
  controller.getTypeVenteById
);

// List active
router.get(
  '/',
  canReadTypeVente,
  controller.listActiveTypeVentes
);

// Update
router.patch(
  '/:id',
  validateTypeVenteId,
  canUpdateTypeVente,
  validateTypeVenteUpdate,
  controller.updateTypeVente
);

// Activate
router.post(
  '/:id/activate',
  validateTypeVenteId,
  canUpdateTypeVente,
  controller.activateTypeVente
);

// Deactivate
router.post(
  '/:id/deactivate',
  validateTypeVenteId,
  canUpdateTypeVente,
  controller.deactivateTypeVente
);

// Error handler for this router
router.use(errorHandler);

export default router;
