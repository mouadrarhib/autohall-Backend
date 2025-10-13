// src/routes/userRole.routes.js
import express from 'express';
import { isAuth } from '../middlewares/isAuth.js';
import { errorHandler } from '../middlewares/responseHandler.js';

import * as ctrl from '../controllers/userRole.controller.js';

import {
  validateLinkBody,
  validateUnlinkBody,
  validateSetActiveBody,
  validateUserIdParam,
  validateRoleIdParam,
  validateBulkRolesToUser,
  validateBulkUsersToRole,
  validateBulkSetActiveByUser,
  validateBulkSetActiveByRole,
  validateSyncRolesForUser,
  validateSyncUsersForRole,
  validateHasRoleQuery
} from '../middlewares/userRole/validateInput.js';

import {
  canReadUserRole,
  canLinkUserRole,
  canUpdateUserRole,
  canSyncUserRole,
  canDeleteUserRole
} from '../middlewares/userRole/hasPermission.js';

const router = express.Router();
router.use(isAuth);

// Single link ops
router.post('/link', canLinkUserRole, validateLinkBody, ctrl.link);
router.post('/unlink', canDeleteUserRole, validateUnlinkBody, ctrl.unlink);
router.post('/set-active', canUpdateUserRole, validateSetActiveBody, ctrl.setActive);
router.post('/toggle', canUpdateUserRole, validateUnlinkBody, ctrl.toggle);

// Lookups
router.get('/users/:roleId', canReadUserRole, validateRoleIdParam, ctrl.listUsersByRole);
router.get('/users/:roleId/count', canReadUserRole, validateRoleIdParam, ctrl.countUsersForRole);
router.get('/users/:roleId/has', canReadUserRole, validateHasRoleQuery, ctrl.hasRole); // alternative query form

router.get('/roles/:userId', canReadUserRole, validateUserIdParam, ctrl.listRolesByUser);

// Bulk
router.post('/bulk/link-roles-to-user', canLinkUserRole, validateBulkRolesToUser, ctrl.bulkLinkRolesToUser);
router.post('/bulk/link-users-to-role', canLinkUserRole, validateBulkUsersToRole, ctrl.bulkLinkUsersToRole);
router.post('/bulk/set-active-by-user', canUpdateUserRole, validateBulkSetActiveByUser, ctrl.bulkSetActiveByUser);
router.post('/bulk/set-active-by-role', canUpdateUserRole, validateBulkSetActiveByRole, ctrl.bulkSetActiveByRole);

// Sync
router.post('/sync/roles-for-user', canSyncUserRole, validateSyncRolesForUser, ctrl.syncRolesForUser);
router.post('/sync/users-for-role', canSyncUserRole, validateSyncUsersForRole, ctrl.syncUsersForRole);

// Error handler
router.use(errorHandler);

export default router;
