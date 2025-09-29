// src/routes/usersite.routes.js

import express from 'express';
import { isAuth } from '../middlewares/isAuth.js';

// Import validation middleware
import {
  validateUserSiteCreate,
  validateUserSiteUpdate,
  validateUserSiteSearch,
  validateUserSiteId,
  validateGroupementId,
  validateSiteId
} from '../middlewares/usersite/validateInput.js';

// Import permission middleware
import {
  canCreateUserSite,
  canReadUserSite,
  canUpdateUserSite,
  canDeleteUserSite
} from '../middlewares/usersite/hasPermission.js';

// Import controller
import * as usersiteController from '../controllers/usersite.controller.js';

const router = express.Router();

// All routes require authentication
router.use(isAuth);

// Create usersite
router.post('/', 
  canCreateUserSite,
  validateUserSiteCreate,
  usersiteController.createUserSite
);

// Get usersite by ID
router.get('/:id', 
  validateUserSiteId,
  canReadUserSite,
  usersiteController.getUserSiteById
);

// List all usersites
router.get('/', 
  canReadUserSite,
  usersiteController.listUserSites
);

// Search usersites
router.get('/search', 
  canReadUserSite,
  validateUserSiteSearch,
  usersiteController.searchUserSites
);

// List usersites by groupement
router.get('/by-groupement/:idGroupement', 
  validateGroupementId,
  canReadUserSite,
  usersiteController.listUserSitesByGroupement
);

// List usersites by site
router.get('/by-site/:idSite', 
  validateSiteId,
  canReadUserSite,
  usersiteController.listUserSitesBySite
);

// Update usersite
router.patch('/:id', 
  validateUserSiteId,
  canUpdateUserSite,
  validateUserSiteUpdate,
  usersiteController.updateUserSite
);

// Activate usersite
router.post('/:id/activate', 
  validateUserSiteId,
  canUpdateUserSite,
  usersiteController.activateUserSite
);

// Deactivate usersite
router.post('/:id/deactivate', 
  validateUserSiteId,
  canUpdateUserSite,
  usersiteController.deactivateUserSite
);

export default router;
