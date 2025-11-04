// src/routes/marque.routes.js

import express from 'express';
import { isAuth } from '../middlewares/isAuth.js';
import { errorHandler } from '../middlewares/responseHandler.js';

// Import validation middleware
import {
  validateMarqueCreate,
  validateMarqueUpdate,
  validateMarqueSearch,
  validateMarqueId,
  validateFilialeId,
  validateMarqueQuery
} from '../middlewares/marque/validateInput.js';

// Import permission middleware
import {
  canCreateMarque,
  canReadMarque,
  canUpdateMarque
} from '../middlewares/marque/hasPermission.js';

// Import controller
import * as marqueController from '../controllers/marque.controller.js';

const router = express.Router();

// All routes require authentication
router.use(isAuth);

// Create marque
router.post('/',
  canCreateMarque,
  validateMarqueCreate,
  marqueController.createMarque
);

// Search marques (must be before /:id to avoid route conflicts)
router.get('/search',
  canReadMarque,
  validateMarqueSearch,
  validateMarqueQuery,
  marqueController.searchMarques
);

// List marques by filiale (must be before /:id to avoid route conflicts)
router.get('/by-filiale/:idFiliale',
  validateFilialeId,
  canReadMarque,
  validateMarqueQuery,
  marqueController.listMarquesByFiliale
);

// List marques for the connected user (role-aware)
router.get('/current-user',
  canReadMarque,
  validateMarqueQuery,
  marqueController.listMarquesForCurrentUser
);

// Get marque by ID
router.get('/:id',
  validateMarqueId,
  canReadMarque,
  marqueController.getMarqueById
);

// List all marques
router.get('/',
  canReadMarque,
  validateMarqueQuery,
  marqueController.listMarques
);

// Update marque
router.patch('/:id',
  validateMarqueId,
  canUpdateMarque,
  validateMarqueUpdate,
  marqueController.updateMarque
);

// Activate marque
router.post('/:id/activate',
  validateMarqueId,
  canUpdateMarque,
  marqueController.activateMarque
);

// Deactivate marque
router.post('/:id/deactivate',
  validateMarqueId,
  canUpdateMarque,
  marqueController.deactivateMarque
);

// Error handler for this router
router.use(errorHandler);

export default router;
