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
  // NEW: Add these imports
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
  // NEW: Add these imports
  validateUserUpdate,
  validatePasswordUpdate,
  validateUserSiteUpdate
} from '../middlewares/auth/validateInput.js';
import {
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

// Everything below requires authentication + auth-domain permission
r.use(isAuth, canManageAuth);

// Admin endpoints
r.post('/create-user-complete', validateUserCompleteCreation, createUserComplete);
r.get('/users', getAllUsers);
r.get('/users/:id/complete', validateUserId, getUserCompleteInfo);
r.get('/sites', getAvailableSites);

// NEW: User update endpoints
r.patch('/users/:id', validateUserId, validateUserUpdate, updateUser);
r.patch('/users/:id/password', validateUserId, validatePasswordUpdate, updateUserPassword);
r.post('/users/:id/activate', validateUserId, activateUser);
r.post('/users/:id/deactivate', validateUserId, deactivateUser);
r.patch('/users/:id/site', validateUserId, validateUserSiteUpdate, updateUserSiteAssignment);

// Error handler for this router
r.use(errorHandler);

export default r;
