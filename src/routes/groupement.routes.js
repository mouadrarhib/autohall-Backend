// src/routes/groupement.routes.js

import express from 'express';
import { isAuth } from '../middlewares/isAuth.js';
import { errorHandler } from '../middlewares/responseHandler.js';

// Import validation middleware
import {
  validateGroupementCreate,
  validateGroupementUpdate,
  validateGroupementSearch,
  validateGroupementId
} from '../middlewares/groupement/validateInput.js';

// Import permission middleware
import {
  canCreateGroupement,
  canReadGroupement,
  canUpdateGroupement
} from '../middlewares/groupement/hasPermission.js';

// Import controller
import * as groupementController from '../controllers/groupement.controller.js';

const router = express.Router();

// All routes require authentication
router.use(isAuth);

// Create groupement
router.post('/',
  canCreateGroupement,
  validateGroupementCreate,
  groupementController.createGroupement
);

// Get groupement by ID
router.get('/:id',
  validateGroupementId,
  canReadGroupement,
  groupementController.getGroupementById
);

// List active users in a groupement (must be before generic '/')
router.get('/:id/users',
  validateGroupementId,
  canReadGroupement,
  groupementController.listUsersByGroupement
);

// List all groupements
router.get('/',
  canReadGroupement,
  groupementController.listGroupements
);

// Search groupements
router.get('/search',
  canReadGroupement,
  validateGroupementSearch,
  groupementController.searchGroupements
);

// Update groupement
router.patch('/:id',
  validateGroupementId,
  canUpdateGroupement,
  validateGroupementUpdate,
  groupementController.updateGroupement
);

// Activate groupement
router.post('/:id/activate',
  validateGroupementId,
  canUpdateGroupement,
  groupementController.activateGroupement
);

// Deactivate groupement
router.post('/:id/deactivate',
  validateGroupementId,
  canUpdateGroupement,
  groupementController.deactivateGroupement
);

// Error handler for this router
router.use(errorHandler);

export default router;
