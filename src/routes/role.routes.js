// src/routes/role.routes.js

import express from 'express';
import { isAuth } from '../middlewares/isAuth.js';
import { errorHandler } from '../middlewares/responseHandler.js';

// Import validation middleware
import {
  validateRoleCreate,
  validateRoleUpdate,
  validateRoleSearch,
  validateRoleId
} from '../middlewares/role/validateInput.js';

// Import permission middleware
import {
  canCreateRole,
  canReadRole,
  canUpdateRole
} from '../middlewares/role/hasPermission.js';

// Import controller
import * as roleController from '../controllers/role.controller.js';

const router = express.Router();

// All routes require authentication
router.use(isAuth);

// Create role
router.post('/',
  canCreateRole,
  validateRoleCreate,
  roleController.createRole
);

// Search roles (must be before /:id to avoid route conflicts)
router.get('/search',
  canReadRole,
  validateRoleSearch,
  roleController.searchRoles
);

// Get role by ID
router.get('/:id',
  validateRoleId,
  canReadRole,
  roleController.getRoleById
);

// List all roles
router.get('/',
  canReadRole,
  roleController.listRoles
);

// Update role
router.patch('/:id',
  validateRoleId,
  canUpdateRole,
  validateRoleUpdate,
  roleController.updateRole
);

// Activate role
router.post('/:id/activate',
  validateRoleId,
  canUpdateRole,
  roleController.activateRole
);

// Deactivate role
router.post('/:id/deactivate',
  validateRoleId,
  canUpdateRole,
  roleController.deactivateRole
);

// Error handler for this router
router.use(errorHandler);

export default router;
