// src/routes/auth.routes.js

import { Router } from 'express';
import {
  login,
  me,
  myRoles,
  myPermissions,
  register,
  createUserComplete,
  getAllUsers,
  getUserCompleteInfo,
  getAvailableSites,
  logout,
  updateUser,
  updateUserPassword,
  activateUser,
  deactivateUser,
  updateUserSiteAssignment
} from '../controllers/auth.controller.js';
import { isAuth } from '../middlewares/isAuth.js';
import { errorHandler } from '../middlewares/responseHandler.js';
import {
  validateUserRegistration,
  validateUserLogin,
  validateUserCompleteCreation,
  validateUserId,
  validateUserUpdate,
  validatePasswordUpdate,
  validateUserSiteUpdate
} from '../middlewares/auth/validateInput.js';
import {
  canReadAuth,    // ✅ ADDED
  canManageAuth
} from '../middlewares/auth/hasPermission.js';

const r = Router();

// Public/self endpoints (no admin permission required)
r.post('/register', validateUserRegistration, register);
r.post('/login', validateUserLogin, login);
r.post('/logout', isAuth, logout);
r.get('/me', isAuth, me);
r.get('/me/roles', isAuth, myRoles);
r.get('/me/permissions', isAuth, myPermissions);

// ✅ CHANGED: READ endpoints - both admin and intégrateur can access
r.get('/users', isAuth, canReadAuth, getAllUsers);
r.get('/users/:id/complete', isAuth, canReadAuth, validateUserId, getUserCompleteInfo);
r.get('/sites', isAuth, canReadAuth, getAvailableSites);

// ✅ CHANGED: WRITE endpoints - only admin can access
r.post('/create-user-complete', isAuth, canManageAuth, validateUserCompleteCreation, createUserComplete);
r.patch('/users/:id', isAuth, canManageAuth, validateUserId, validateUserUpdate, updateUser);
r.patch('/users/:id/password', isAuth, canManageAuth, validateUserId, validatePasswordUpdate, updateUserPassword);
r.post('/users/:id/activate', isAuth, canManageAuth, validateUserId, activateUser);
r.post('/users/:id/deactivate', isAuth, canManageAuth, validateUserId, deactivateUser);
r.patch('/users/:id/site', isAuth, canManageAuth, validateUserId, validateUserSiteUpdate, updateUserSiteAssignment);

// Error handler for this router
r.use(errorHandler);

export default r;
