// src/routes/typeobjectif.routes.js

import express from 'express';
import { isAuth } from '../middlewares/isAuth.js';

import {
  validateTypeObjectifCreate,
  validateTypeObjectifUpdate,
  validateTypeObjectifId
} from '../middlewares/typeobjectif/validateInput.js';

import {
  canCreateTypeObjectif,
  canReadTypeObjectif,
  canUpdateTypeObjectif
} from '../middlewares/typeobjectif/hasPermission.js';

import * as controller from '../controllers/typeobjectif.controller.js';

const router = express.Router();

router.use(isAuth);

// Create
router.post(
  '/',
  canCreateTypeObjectif,
  validateTypeObjectifCreate,
  controller.createTypeObjectif
);

// Get active by id
router.get(
  '/:id',
  validateTypeObjectifId,
  canReadTypeObjectif,
  controller.getTypeObjectifById
);

// List active
router.get(
  '/',
  canReadTypeObjectif,
  controller.listActiveTypeObjectifs
);

// Update
router.patch(
  '/:id',
  validateTypeObjectifId,
  canUpdateTypeObjectif,
  validateTypeObjectifUpdate,
  controller.updateTypeObjectif
);

// Activate
router.post(
  '/:id/activate',
  validateTypeObjectifId,
  canUpdateTypeObjectif,
  controller.activateTypeObjectif
);

// Deactivate
router.post(
  '/:id/deactivate',
  validateTypeObjectifId,
  canUpdateTypeObjectif,
  controller.deactivateTypeObjectif
);

export default router;
