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

import {
  validateUserRegistration,
  validateUserLogin,
  validateUserCompleteCreation
} from '../middlewares/auth/validateInput.js';

import {
  canManageAuth,   // or canReadAuth / canAdminAuth depending on sensitivity
} from '../middlewares/auth/hasPermission.js';

const r = Router();

// Public/self endpoints (no admin permission required)
r.post('/register', validateUserRegistration, register);            // open to unauthenticated users [file:34]
r.post('/login', validateUserLogin, login);                         // open to unauthenticated users [file:34]
r.get('/me', isAuth, me);                                           // authenticated self endpoint [file:34]
r.get('/me/roles', isAuth, myRoles);                                // authenticated self endpoint [file:34]
r.get('/me/permissions', isAuth, myPermissions);                    // authenticated self endpoint [file:34]

// Everything below requires authentication + auth-domain permission
r.use(isAuth, canManageAuth);                                       // gate admin endpoints [file:33]

// Admin endpoints
r.post('/create-user-complete', validateUserCompleteCreation, createUserComplete);  // admin create [file:34]
r.get('/users', getAllUsers);                                       // admin list users [file:34]
r.get('/users/:id/complete', getUserCompleteInfo);                  // admin user detail [file:34]
r.get('/sites', getAvailableSites);                                 // admin sites listing [file:34]

export default r;
