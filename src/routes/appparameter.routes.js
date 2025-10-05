// src/routes/appparameter.routes.js

import express from 'express';
import { isAuth } from '../middlewares/isAuth.js';
import { errorHandler } from '../middlewares/responseHandler.js';

// Import validation middleware
import {
  validateAppParameterCreate,
  validateAppParameterSet,
  validateAppParameterUpdate,
  validateAppParameterSearch,
  validateAppParameterId,
  validateAppParameterKey,
  validateAppParameterQuery
} from '../middlewares/appparameter/validateInput.js';

// Import permission middleware
import {
  canCreateAppParameter,
  canReadAppParameter,
  canUpdateAppParameter,
  canSetAppParameter
} from '../middlewares/appparameter/hasPermission.js';

// Import controller
import * as appparameterController from '../controllers/appparameter.controller.js';

const router = express.Router();

// All routes require authentication
router.use(isAuth);

// Create app parameter
router.post('/',
  canCreateAppParameter,
  validateAppParameterCreate,
  appparameterController.createAppParameter
);

// Get app parameter by ID
router.get('/:id',
  validateAppParameterId,
  canReadAppParameter,
  appparameterController.getAppParameterById
);

// Get app parameter by key
router.get('/by-key/:key',
  validateAppParameterKey,
  canReadAppParameter,
  appparameterController.getAppParameterByKey
);

// List all app parameters
router.get('/',
  canReadAppParameter,
  validateAppParameterQuery,
  appparameterController.listAppParameters
);

// Search app parameters
router.get('/search',
  canReadAppParameter,
  validateAppParameterSearch,
  validateAppParameterQuery,
  appparameterController.searchAppParameters
);

// Upsert app parameter by key
router.put('/set',
  canSetAppParameter,
  validateAppParameterSet,
  appparameterController.setAppParameter
);

// Update app parameter by ID
router.patch('/:id',
  validateAppParameterId,
  canUpdateAppParameter,
  validateAppParameterUpdate,
  appparameterController.updateAppParameterById
);

// Update app parameter by key
router.patch('/by-key/:key',
  validateAppParameterKey,
  canUpdateAppParameter,
  validateAppParameterUpdate,
  appparameterController.updateAppParameterByKey
);

// Activate app parameter
router.post('/:id/activate',
  validateAppParameterId,
  canUpdateAppParameter,
  appparameterController.activateAppParameter
);

// Deactivate app parameter
router.post('/:id/deactivate',
  validateAppParameterId,
  canUpdateAppParameter,
  appparameterController.deactivateAppParameter
);

// Error handler for this router
router.use(errorHandler);

export default router;
