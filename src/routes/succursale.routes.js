// src/routes/succursale.routes.js

import express from 'express';
import { isAuth } from '../middlewares/isAuth.js';

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

// Search succursales
router.get('/search', 
  canReadSuccursale,
  validateSuccursaleSearch,
  validateSuccursaleQuery,
  succursaleController.searchSuccursales
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

export default router;
