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
  getAvailableSites
} from '../controllers/auth.controller.js';
import { isAuth } from '../middlewares/isAuth.js';
import { errorHandler } from '../middlewares/responseHandler.js';
import {
  validateUserRegistration,
  validateUserLogin,
  validateUserCompleteCreation
} from '../middlewares/auth/validateInput.js';
import {
  canManageAuth
} from '../middlewares/auth/hasPermission.js';

const r = Router();

// Public/self endpoints (no admin permission required)
r.post('/register', validateUserRegistration, register);
r.post('/login', validateUserLogin, login);
r.get('/me', isAuth, me);
r.get('/me/roles', isAuth, myRoles);
r.get('/me/permissions', isAuth, myPermissions);

// Everything below requires authentication + auth-domain permission
r.use(isAuth, canManageAuth);

// Admin endpoints
r.post('/create-user-complete', validateUserCompleteCreation, createUserComplete);
r.get('/users', getAllUsers);
r.get('/users/:id/complete', getUserCompleteInfo);
r.get('/sites', getAvailableSites);

// Error handler for this router
r.use(errorHandler);

export default r;
