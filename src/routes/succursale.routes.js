// src/routes/succursale.routes.js

import express from 'express';
import { isAuth } from '../middlewares/isAuth.js';
import { errorHandler } from '../middlewares/responseHandler.js';

// Import validation middleware
import {
  validateSuccursaleCreate,
  validateSuccursaleUpdate,
  validateSuccursaleSearch,
  validateSuccursaleId,
  validateSuccursaleQuery
} from '../middlewares/succursale/validateInput.js';

// Import permission middleware
import {
  canCreateSuccursale,
  canReadSuccursale,
  canUpdateSuccursale
} from '../middlewares/succursale/hasPermission.js';

// Import controller
import * as succursaleController from '../controllers/succursale.controller.js';

const router = express.Router();

// All routes require authentication
router.use(isAuth);

// Create succursale
router.post('/',
  canCreateSuccursale,
  validateSuccursaleCreate,
  succursaleController.createSuccursale
);

// Search succursales (must be before /:id to avoid route conflicts)
router.get('/search',
  canReadSuccursale,
  validateSuccursaleSearch,
  validateSuccursaleQuery,
  succursaleController.searchSuccursales
);

// Get succursale by ID
router.get('/:id',
  validateSuccursaleId,
  canReadSuccursale,
  succursaleController.getSuccursaleById
);

// List all succursales
router.get('/',
  canReadSuccursale,
  validateSuccursaleQuery,
  succursaleController.listSuccursales
);

// Update succursale
router.patch('/:id',
  validateSuccursaleId,
  canUpdateSuccursale,
  validateSuccursaleUpdate,
  succursaleController.updateSuccursale
);

// Activate succursale
router.post('/:id/activate',
  validateSuccursaleId,
  canUpdateSuccursale,
  succursaleController.activateSuccursale
);

// Deactivate succursale
router.post('/:id/deactivate',
  validateSuccursaleId,
  canUpdateSuccursale,
  succursaleController.deactivateSuccursale
);

// Error handler for this router
router.use(errorHandler);

export default router;
