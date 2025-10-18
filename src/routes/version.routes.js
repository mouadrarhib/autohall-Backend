// src/routes/version.routes.js

import express from 'express';
import { isAuth } from '../middlewares/isAuth.js';
import { errorHandler } from '../middlewares/responseHandler.js';

import {
  validateVersionCreate,
  validateVersionUpdate,
  validateVersionId,
  validateVersionQuery
} from '../middlewares/version/validateInput.js';

import {
  canCreateVersion,
  canReadVersion,
  canUpdateVersion
} from '../middlewares/version/hasPermission.js';

import * as controller from '../controllers/version.controller.js';

const router = express.Router();

// All routes require authentication
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
  validateVersionQuery,
  controller.searchVersions
);

// List versions by modele (must be before /:id to avoid route conflicts)
router.get(
  '/by-modele/:idModele',
  canReadVersion,
  controller.listVersionsByModele
);

// Activate version (must be before /:id to avoid route conflicts)
router.post(
  '/:id/activate',
  validateVersionId,
  canUpdateVersion,
  controller.activateVersion
);

// Deactivate version (must be before /:id to avoid route conflicts)
router.post(
  '/:id/deactivate',
  validateVersionId,
  canUpdateVersion,
  controller.deactivateVersion
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
  validateVersionQuery,
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

// Error handler for this router
router.use(errorHandler);

export default router;
