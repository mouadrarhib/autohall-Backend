// src/routes/modele.routes.js

import express from 'express';
import { isAuth } from '../middlewares/isAuth.js';

// Import validation middleware
import {
  validateModeleCreate,
  validateModeleUpdate,
  validateModeleSearch,
  validateModeleId,
  validateMarqueId,
  validateModeleQuery
} from '../middlewares/modele/validateInput.js';

// Import permission middleware
import {
  canCreateModele,
  canReadModele,
  canUpdateModele,
  canDeleteModele
} from '../middlewares/modele/hasPermission.js';

// Import controller
import * as modeleController from '../controllers/modele.controller.js';

const router = express.Router();

// All routes require authentication
router.use(isAuth);

// Create modele
router.post('/', 
  canCreateModele,
  validateModeleCreate,
  modeleController.createModele
);

// Get modele by ID  
router.get('/:id', 
  validateModeleId,
  canReadModele,
  modeleController.getModeleById
);

// List all modeles
router.get('/', 
  canReadModele,
  validateModeleQuery,
  modeleController.listModeles
);

// Search modeles
router.get('/search', 
  canReadModele,
  validateModeleSearch,
  validateModeleQuery,
  modeleController.searchModeles
);

// List modeles by marque
router.get('/by-marque/:idMarque', 
  validateMarqueId,
  canReadModele,
  validateModeleQuery,
  modeleController.listModelesByMarque
);

// Update modele
router.patch('/:id', 
  validateModeleId,
  canUpdateModele,
  validateModeleUpdate,
  modeleController.updateModele
);

// Activate modele
router.post('/:id/activate', 
  validateModeleId,
  canUpdateModele,
  modeleController.activateModele
);

// Deactivate modele
router.post('/:id/deactivate', 
  validateModeleId,
  canUpdateModele,
  modeleController.deactivateModele
);

export default router;
