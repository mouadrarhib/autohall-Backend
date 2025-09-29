// src/routes/version.routes.js

import express from 'express';
import { isAuth } from '../middlewares/isAuth.js';

// Import validation middleware
import {
  validateVersionCreate,
  validateVersionUpdate,
  validateVersionSearch,
  validateVersionId,
  validateModeleId,
  validateVersionQuery
} from '../middlewares/version/validateInput.js';

// Import permission middleware
import {
  canCreateVersion,
  canReadVersion,
  canUpdateVersion
} from '../middlewares/version/hasPermission.js';

// Import controller
import * as versionController from '../controllers/version.controller.js';

const router = express.Router();

// All routes require authentication
router.use(isAuth);

// Create version
router.post('/', 
  canCreateVersion,
  validateVersionCreate,
  versionController.createVersion
);

// Get version by ID  
router.get('/:id', 
  validateVersionId,
  canReadVersion,
  versionController.getVersionById
);

// List all versions
router.get('/', 
  canReadVersion,
  validateVersionQuery,
  versionController.listVersions
);

// Search versions
router.get('/search', 
  canReadVersion,
  validateVersionSearch,
  validateVersionQuery,
  versionController.searchVersions
);

// List versions by modele
router.get('/by-modele/:idModele', 
  validateModeleId,
  canReadVersion,
  validateVersionQuery,
  versionController.listVersionsByModele
);

// Update version
router.patch('/:id', 
  validateVersionId,
  canUpdateVersion,
  validateVersionUpdate,
  versionController.updateVersion
);

// Activate version
router.post('/:id/activate', 
  validateVersionId,
  canUpdateVersion,
  versionController.activateVersion
);

// Deactivate version
router.post('/:id/deactivate', 
  validateVersionId,
  canUpdateVersion,
  versionController.deactivateVersion
);
export default router;
