// src/routes/modele.routes.js

import express from 'express';
import { isAuth } from '../middlewares/isAuth.js';
import { errorHandler } from '../middlewares/responseHandler.js';
import { upload } from '../storage/cloudinaryConfig.js'; // ✅ NEW: Import upload

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

// ✅ MODIFIED: Create modele with image upload
router.post('/',
    canCreateModele,
    upload.single('image'), // ✅ NEW: Handle file upload
    validateModeleCreate,
    modeleController.createModele
);

// Search modeles (must be before /:id to avoid route conflicts)
router.get('/search',
    canReadModele,
    validateModeleSearch,
    validateModeleQuery,
    modeleController.searchModeles
);

// List modeles by marque (must be before /:id to avoid route conflicts)
router.get('/by-marque/:idMarque',
    validateMarqueId,
    canReadModele,
    validateModeleQuery,
    modeleController.listModelesByMarque
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

// ✅ MODIFIED: Update modele with optional image upload
router.patch('/:id',
    validateModeleId,
    canUpdateModele,
    upload.single('image'), // ✅ NEW: Handle file upload
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

// Error handler for this router
router.use(errorHandler);

export default router;
