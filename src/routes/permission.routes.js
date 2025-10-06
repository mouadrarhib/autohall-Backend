// src/routes/permission.routes.js

import express from 'express';
import { errorHandler } from '../middlewares/responseHandler.js';

// Import validation middleware
import {
  validatePermissionCreate,
  validatePermissionUpdate,
  validatePermissionId,
  validateUserId,
  validateUserPermissionBody,
  validatePermissionQuery,
  validateSetActive
} from '../middlewares/permission/validateInput.js';

// Import permission checking middleware
import {
  canCreatePermission,
  canReadPermission,
  canUpdatePermission,
  canLinkPermission,
  canReadPermissionLinks
} from '../middlewares/permission/hasPermission.js';

// Import controller functions
import * as permissionController from '../controllers/permission.controller.js';
import { isAuth } from '../middlewares/isAuth.js';

const router = express.Router();

// All routes require authentication
router.use(isAuth);

// ========================================
// Permission CRUD Routes
// ========================================

// POST /api/permissions - Create a new permission
router.post(
  '/',
  canCreatePermission,
  validatePermissionCreate,
  permissionController.createPermission
);

// GET /api/permissions - List all permissions with pagination
router.get(
  '/',
  canReadPermission,
  validatePermissionQuery,
  permissionController.listPermissions
);

// GET /api/permissions/by-name/:name - Get permission by name
// Must be before /:id to avoid route conflict
router.get(
  '/by-name/:name',
  canReadPermission,
  permissionController.getPermissionByName
);

// ========================================
// User-Permission Management Routes
// Must be before /:id routes to avoid conflicts
// ========================================

// GET /api/permissions/user/:idUser/list - List permissions for a user
router.get(
  '/user/:idUser/list',
  validateUserId,
  canReadPermissionLinks,
  permissionController.listUserPermissions
);

// POST /api/permissions/user/:idUser/add - Assign permission to user
router.post(
  '/user/:idUser/add',
  validateUserId,
  canLinkPermission,
  validateUserPermissionBody,
  permissionController.addUserPermission
);

// POST /api/permissions/user/:idUser/activate - Activate user permission
router.post(
  '/user/:idUser/activate',
  validateUserId,
  canLinkPermission,
  validateUserPermissionBody,
  permissionController.activateUserPermission
);

// POST /api/permissions/user/:idUser/deactivate - Deactivate user permission
router.post(
  '/user/:idUser/deactivate',
  validateUserId,
  canLinkPermission,
  validateUserPermissionBody,
  permissionController.deactivateUserPermission
);

// DELETE /api/permissions/user/:idUser/remove - Remove permission from user
router.delete(
  '/user/:idUser/remove',
  validateUserId,
  canLinkPermission,
  validateUserPermissionBody,
  permissionController.removeUserPermission
);

// GET /api/permissions/user/:idUser/check/:permissionName - Check if user has permission
router.get(
  '/user/:idUser/check/:permissionName',
  validateUserId,
  canReadPermissionLinks,
  permissionController.userHasPermissionByName
);

// ========================================
// Permission-Specific Routes (using /:id)
// ========================================

// GET /api/permissions/:id - Get permission by ID
router.get(
  '/:id',
  validatePermissionId,
  canReadPermission,
  permissionController.getPermissionById
);

// PATCH /api/permissions/:id - Update permission
router.patch(
  '/:id',
  validatePermissionId,
  canUpdatePermission,
  validatePermissionUpdate,
  permissionController.updatePermission
);

// POST /api/permissions/:id/activate - Activate permission
router.post(
  '/:id/activate',
  validatePermissionId,
  canUpdatePermission,
  permissionController.activatePermission
);

// POST /api/permissions/:id/deactivate - Deactivate permission
router.post(
  '/:id/deactivate',
  validatePermissionId,
  canUpdatePermission,
  permissionController.deactivatePermission
);

// PATCH /api/permissions/:id/set-active - Set permission active status
router.patch(
  '/:id/set-active',
  validatePermissionId,
  canUpdatePermission,
  validateSetActive,
  permissionController.setPermissionActive
);

// GET /api/permissions/:id/users - List users with this permission
router.get(
  '/:id/users',
  validatePermissionId,
  canReadPermissionLinks,
  permissionController.listUsersByPermission
);

// Error handler
router.use(errorHandler);

export default router;
