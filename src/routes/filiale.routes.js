// src/routes/filiale.routes.js

import express from 'express';
import { isAuth } from '../middlewares/isAuth.js';
import { errorHandler } from '../middlewares/responseHandler.js';

// Import validation middleware
import {
  validateFilialeCreate,
  validateFilialeUpdate,
  validateFilialeId
} from '../middlewares/filiale/validateInput.js';

// Import permission middleware
import {
  canCreateFiliale,
  canReadFiliale,
  canUpdateFiliale
} from '../middlewares/filiale/hasPermission.js';

// Import controller
import * as filialeController from '../controllers/filiale.controller.js';

const router = express.Router();

// All routes require authentication
router.use(isAuth);

// Create filiale
router.post('/',
  canCreateFiliale,
  validateFilialeCreate,
  filialeController.createFiliale
);

// Get filiale by ID
router.get('/:id',
  validateFilialeId,
  canReadFiliale,
  filialeController.getFilialeById
);

// List all filiales
router.get('/',
  canReadFiliale,
  filialeController.listFiliales
);

// Update filiale
router.patch('/:id',
  validateFilialeId,
  canUpdateFiliale,
  validateFilialeUpdate,
  filialeController.updateFiliale
);

// Activate filiale
router.post('/:id/activate',
  validateFilialeId,
  canUpdateFiliale,
  filialeController.activateFiliale
);

// Deactivate filiale
router.post('/:id/deactivate',
  validateFilialeId,
  canUpdateFiliale,
  filialeController.deactivateFiliale
);

// Error handler for this router
router.use(errorHandler);

export default router;
