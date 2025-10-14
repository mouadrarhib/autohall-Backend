// src/routes/rolePermission.routes.js
import express from 'express';
import { isAuth } from '../middlewares/isAuth.js';
import { errorHandler } from '../middlewares/responseHandler.js';
import {
  validateAssign,
  validateRemove,
  validateToggle,
  validateRoleId,
  validatePermissionId,
  validateSyncPermissions,
  validateSyncRoles,
  validateCheck
} from '../middlewares/rolePermission/validateInput.js';
import {
  canCreateRolePermission,
  canReadRolePermission,
  canUpdateRolePermission,
  canDeleteRolePermission,
  canManageRolePermission
} from '../middlewares/rolePermission/hasPermission.js';
import * as rolePermissionController from '../controllers/rolePermission.controller.js';

const router = express.Router();

// All routes require authentication
router.use(isAuth);

// Assign/Remove operations
router.post('/assign',
  canCreateRolePermission,
  validateAssign,
  rolePermissionController.assignRolePermission
);

router.delete('/remove',
  canDeleteRolePermission,
  validateRemove,
  rolePermissionController.removeRolePermission
);

router.patch('/toggle',
  canUpdateRolePermission,
  validateToggle,
  rolePermissionController.toggleRolePermission
);

// Get operations
router.get('/roles/:idRole/permissions',
  validateRoleId,
  canReadRolePermission,
  rolePermissionController.getPermissionsByRole
);

router.get('/permissions/:idPermission/roles',
  validatePermissionId,
  canReadRolePermission,
  rolePermissionController.getRolesByPermission
);

// Sync operations
router.put('/roles/:idRole/permissions/sync',
  validateRoleId,
  canManageRolePermission,
  validateSyncPermissions,
  rolePermissionController.syncPermissionsForRole
);

router.put('/permissions/:idPermission/roles/sync',
  validatePermissionId,
  canManageRolePermission,
  validateSyncRoles,
  rolePermissionController.syncRolesForPermission
);

// Utility operations
router.get('/check',
  canReadRolePermission,
  validateCheck,
  rolePermissionController.checkRolePermission
);

router.get('/stats',
  canReadRolePermission,
  rolePermissionController.getRolePermissionStats
);

router.get('/',
  canReadRolePermission,
  rolePermissionController.listRolePermissions
);

router.use(errorHandler);

export default router;
