// src/routes/version.routes.js

import express from 'express';
import { isAuth } from '../middlewares/isAuth.js';
import { errorHandler } from '../middlewares/responseHandler.js';
import {
  validateVersionCreate,
  validateVersionUpdate,
  validateVersionId
} from '../middlewares/version/validateInput.js';
import {
  canCreateVersion,
  canReadVersion,
  canUpdateVersion
} from '../middlewares/version/hasPermission.js';
import * as controller from '../controllers/version.controller.js';

const router = express.Router();

router.use(isAuth);

// Create version
router.post(
  '/',
  canCreateVersion,
  validateVersionCreate,
  controller.createVersion
);

// Search versions (must be before /:id to avoid route conflicts)
router.get(
  '/search',
  canReadVersion,
  controller.searchVersions
);

// List versions by modele (must be before /:id to avoid route conflicts)
router.get(
  '/by-modele',
  canReadVersion,
  controller.listVersionsByModele
);

// Get version by ID
router.get(
  '/:id',
  validateVersionId,
  canReadVersion,
  controller.getVersionById
);

// List all versions
router.get(
  '/',
  canReadVersion,
  controller.listVersions
);

// Update version
router.patch(
  '/:id',
  validateVersionId,
  canUpdateVersion,
  validateVersionUpdate,
  controller.updateVersion
);

// Activate version
router.post(
  '/:id/activate',
  validateVersionId,
  canUpdateVersion,
  controller.activateVersion
);

// Deactivate version
router.post(
  '/:id/deactivate',
  validateVersionId,
  canUpdateVersion,
  controller.deactivateVersion
);

// Error handler for this router
router.use(errorHandler);

export default router;
