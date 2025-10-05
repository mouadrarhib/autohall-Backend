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

// ---------- Permission CRUD Routes ----------

/**
 * POST /api/permissions
 * Create a new permission
 * Requires: PERMISSION_CREATE permission
 */
router.post('/',
  canCreatePermission,
  validatePermissionCreate,
  permissionController.createPermission
);

/**
 * GET /api/permissions
 * List permissions with pagination and search
 * Requires: PERMISSION_READ permission
 */
router.get('/',
  canReadPermission,
  validatePermissionQuery,
  permissionController.listPermissions
);

/**
 * GET /api/permissions/by-name/:name
 * Get permission by name (must be before /:id to avoid route conflicts)
 * Requires: PERMISSION_READ permission
 */
router.get('/by-name/:name',
  canReadPermission,
  permissionController.getPermissionByName
);

/**
 * GET /api/permissions/user/:idUser/list
 * List all permissions for a specific user (must be before /:id)
 * Requires: PERMISSION_LINK_READ permission
 */
router.get('/user/:idUser/list',
  validateUserId,
  canReadPermissionLinks,
  permissionController.listUserPermissions
);

/**
 * POST /api/permissions/user/:idUser/add
 * Add/link a permission to a user (must be before /:id)
 * Requires: PERMISSION_LINK permission
 */
router.post('/user/:idUser/add',
  validateUserId,
  canLinkPermission,
  validateUserPermissionBody,
  permissionController.addUserPermission
);

/**
 * POST /api/permissions/user/:idUser/activate
 * Activate a user-permission link (must be before /:id)
 * Requires: PERMISSION_LINK permission
 */
router.post('/user/:idUser/activate',
  validateUserId,
  canLinkPermission,
  validateUserPermissionBody,
  permissionController.activateUserPermission
);

/**
 * POST /api/permissions/user/:idUser/deactivate
 * Deactivate a user-permission link (must be before /:id)
 * Requires: PERMISSION_LINK permission
 */
router.post('/user/:idUser/deactivate',
  validateUserId,
  canLinkPermission,
  validateUserPermissionBody,
  permissionController.deactivateUserPermission
);

/**
 * POST /api/permissions/user/:idUser/remove
 * Remove a user-permission link (soft or hard delete) (must be before /:id)
 * Requires: PERMISSION_LINK permission
 */
router.post('/user/:idUser/remove',
  validateUserId,
  canLinkPermission,
  validateUserPermissionBody,
  permissionController.removeUserPermission
);

/**
 * GET /api/permissions/user/:idUser/has/:permissionName
 * Check if a user has a specific permission (must be before /:id)
 * Requires: PERMISSION_LINK_READ permission
 */
router.get('/user/:idUser/has/:permissionName',
  validateUserId,
  canReadPermissionLinks,
  permissionController.userHasPermissionByName
);

/**
 * GET /api/permissions/:id
 * Get permission by ID
 * Requires: PERMISSION_READ permission
 */
router.get('/:id',
  validatePermissionId,
  canReadPermission,
  permissionController.getPermissionById
);

/**
 * PATCH /api/permissions/:id
 * Update permission (name/active)
 * Requires: PERMISSION_UPDATE permission
 */
router.patch('/:id',
  validatePermissionId,
  canUpdatePermission,
  validatePermissionUpdate,
  permissionController.updatePermission
);

/**
 * POST /api/permissions/:id/activate
 * Activate a permission
 * Requires: PERMISSION_UPDATE permission
 */
router.post('/:id/activate',
  validatePermissionId,
  canUpdatePermission,
  permissionController.activatePermission
);

/**
 * POST /api/permissions/:id/deactivate
 * Deactivate a permission
 * Requires: PERMISSION_UPDATE permission
 */
router.post('/:id/deactivate',
  validatePermissionId,
  canUpdatePermission,
  permissionController.deactivatePermission
);

/**
 * POST /api/permissions/:id/set-active
 * Set permission active status
 * Requires: PERMISSION_UPDATE permission
 */
router.post('/:id/set-active',
  validatePermissionId,
  canUpdatePermission,
  validateSetActive,
  permissionController.setPermissionActive
);

/**
 * GET /api/permissions/:idPermission/users
 * List all users that have a specific permission
 * Requires: PERMISSION_LINK_READ permission
 */
router.get('/:idPermission/users',
  validatePermissionId,
  canReadPermissionLinks,
  permissionController.listUsersByPermission
);

// Error handler for this router
router.use(errorHandler);

export default router;
