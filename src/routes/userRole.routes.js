// src/routes/userRole.routes.js

import express from 'express';
import { isAuth } from '../middlewares/isAuth.js';
import { errorHandler } from '../middlewares/responseHandler.js';

import {
  validateAssign,
  validateRemove,
  validateToggle,
  validateUserId,
  validateRoleId,
  validateSyncRoles,
  validateSyncUsers,
  validateCheck
} from '../middlewares/userRole/validateInput.js';

import {
  canReadUserRole,
  canCreateUserRole,
  canUpdateUserRole,
  canDeleteUserRole,
  canManageUserRole
} from '../middlewares/userRole/hasPermission.js';

import * as userRoleController from '../controllers/userRole.controller.js';

const router = express.Router();

// All routes require authentication
router.use(isAuth);

// Assign/Remove operations
router.post('/assign',
  canCreateUserRole,
  validateAssign,
  userRoleController.assignUserRole
);

router.delete('/remove',
  canDeleteUserRole,
  validateRemove,
  userRoleController.removeUserRole
);

// Toggle active status
router.patch('/toggle',
  canUpdateUserRole,
  validateToggle,
  userRoleController.toggleUserRole
);

// List operations
router.get('/users/:userId/roles',
  validateUserId,
  canReadUserRole,
  userRoleController.getRolesByUser
);

router.get('/roles/:roleId/users',
  validateRoleId,
  canReadUserRole,
  userRoleController.getUsersByRole
);

// Sync operations (replace all)
router.put('/users/:userId/roles/sync',
  validateUserId,
  canManageUserRole,
  validateSyncRoles,
  userRoleController.syncRolesForUser
);

router.put('/roles/:roleId/users/sync',
  validateRoleId,
  canManageUserRole,
  validateSyncUsers,
  userRoleController.syncUsersForRole
);

// Utility operations
router.get('/check',
  canReadUserRole,
  validateCheck,
  userRoleController.checkUserAccess
);

router.get('/stats',
  canReadUserRole,
  userRoleController.getUserRoleStats
);

// Get all (admin view with pagination)
router.get('/',
  canReadUserRole,
  userRoleController.getAllUserRoles
);

router.use(errorHandler);

export default router;
