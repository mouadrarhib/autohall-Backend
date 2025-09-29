import express from 'express';

// Import validation middleware with correct export names
import {
  validatePermissionCreate,
  validatePermissionUpdate,
  validatePermissionId,        // Changed from validateIdParam
  validateUserId,              // Changed from validateUserIdParam
  validateUserPermissionBody,
  validatePermissionQuery,     // Changed from validatePagination
  validateSetActive
} from '../middlewares/permission/validateInput.js';

// Import permission checking middleware directly
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
  validatePermissionQuery,        // Changed from validatePagination
  permissionController.listPermissions
);

/**
 * GET /api/permissions/by-name/:name
 * Get permission by name
 * Requires: PERMISSION_READ permission
 */
router.get('/by-name/:name',
  canReadPermission,
  permissionController.getPermissionByName
);

/**
 * GET /api/permissions/:id
 * Get permission by ID
 * Requires: PERMISSION_READ permission
 */
router.get('/:id',
  validatePermissionId,           // Changed from validateIdParam
  canReadPermission,
  permissionController.getPermissionById
);

/**
 * PATCH /api/permissions/:id
 * Update permission (name/active)
 * Requires: PERMISSION_UPDATE permission
 */
router.patch('/:id',
  validatePermissionId,           // Changed from validateIdParam
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
  validatePermissionId,           // Changed from validateIdParam
  canUpdatePermission,
  permissionController.activatePermission
);

/**
 * POST /api/permissions/:id/deactivate
 * Deactivate a permission
 * Requires: PERMISSION_UPDATE permission
 */
router.post('/:id/deactivate',
  validatePermissionId,           // Changed from validateIdParam
  canUpdatePermission,
  permissionController.deactivatePermission
);

/**
 * POST /api/permissions/:id/set-active
 * Set permission active status
 * Requires: PERMISSION_UPDATE permission
 */
router.post('/:id/set-active',
  validatePermissionId,           // Changed from validateIdParam
  canUpdatePermission,
  validateSetActive,
  permissionController.setPermissionActive
);

// ---------- User-Permission Relationship Routes ----------

/**
 * GET /api/permissions/user/:idUser/list
 * List all permissions for a specific user
 * Requires: PERMISSION_LINK_READ permission
 */
router.get('/user/:idUser/list',
  validateUserId,                 // Changed from validateUserIdParam
  canReadPermissionLinks,
  permissionController.listUserPermissions
);

/**
 * GET /api/permissions/:idPermission/users
 * List all users that have a specific permission
 * Requires: PERMISSION_LINK_READ permission
 */
router.get('/:idPermission/users',
  validatePermissionId,           // Changed from validateIdParam
  canReadPermissionLinks,
  permissionController.listUsersByPermission
);

/**
 * POST /api/permissions/user/:idUser/add
 * Add/link a permission to a user
 * Requires: PERMISSION_LINK permission
 */
router.post('/user/:idUser/add',
  validateUserId,                 // Changed from validateUserIdParam
  canLinkPermission,
  validateUserPermissionBody,
  permissionController.addUserPermission
);

/**
 * POST /api/permissions/user/:idUser/activate
 * Activate a user-permission link
 * Requires: PERMISSION_LINK permission
 */
router.post('/user/:idUser/activate',
  validateUserId,                 // Changed from validateUserIdParam
  canLinkPermission,
  validateUserPermissionBody,
  permissionController.activateUserPermission
);

/**
 * POST /api/permissions/user/:idUser/deactivate
 * Deactivate a user-permission link
 * Requires: PERMISSION_LINK permission
 */
router.post('/user/:idUser/deactivate',
  validateUserId,                 // Changed from validateUserIdParam
  canLinkPermission,
  validateUserPermissionBody,
  permissionController.deactivateUserPermission
);

/**
 * POST /api/permissions/user/:idUser/remove
 * Remove a user-permission link (soft or hard delete)
 * Requires: PERMISSION_LINK permission
 */
router.post('/user/:idUser/remove',
  validateUserId,                 // Changed from validateUserIdParam
  canLinkPermission,
  validateUserPermissionBody,
  permissionController.removeUserPermission
);

/**
 * GET /api/permissions/user/:idUser/has/:permissionName
 * Check if a user has a specific permission
 * Requires: PERMISSION_LINK_READ permission
 */
router.get('/user/:idUser/has/:permissionName',
  validateUserId,                 // Changed from validateUserIdParam
  canReadPermissionLinks,
  permissionController.userHasPermissionByName
);

export default router;
