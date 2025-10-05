// src/routes/objectif.routes.js

import express from 'express';
import { isAuth } from '../middlewares/isAuth.js';
import { errorHandler } from '../middlewares/responseHandler.js';
import {
  validateObjectifCreate,
  validateObjectifUpdate,
  validateObjectifId
} from '../middlewares/objectif/validateInput.js';
import {
  canCreateObjectif,
  canReadObjectif,
  canUpdateObjectif
} from '../middlewares/objectif/hasPermission.js';
import * as controller from '../controllers/objectif.controller.js';

const router = express.Router();

router.use(isAuth);

// Create
router.post(
  '/',
  canCreateObjectif,
  validateObjectifCreate,
  controller.createObjectif
);

// List with view (enriched) - must be before /:id to avoid route conflicts
router.get(
  '/view',
  canReadObjectif,
  controller.listObjectifsView
);

// Get active by id
router.get(
  '/:id',
  validateObjectifId,
  canReadObjectif,
  controller.getObjectifById
);

// List active with filters
router.get(
  '/',
  canReadObjectif,
  controller.listActiveObjectifs
);

// Update
router.patch(
  '/:id',
  validateObjectifId,
  canUpdateObjectif,
  validateObjectifUpdate,
  controller.updateObjectif
);

// Activate
router.post(
  '/:id/activate',
  validateObjectifId,
  canUpdateObjectif,
  controller.activateObjectif
);

// Deactivate
router.post(
  '/:id/deactivate',
  validateObjectifId,
  canUpdateObjectif,
  controller.deactivateObjectif
);

// Error handler for this router
router.use(errorHandler);

export default router;
