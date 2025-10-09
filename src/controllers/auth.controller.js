// src/controllers/auth.controller.js

import { AppError, sendSuccess } from '../middlewares/responseHandler.js';
import { signToken } from '../helpers/jwt.js';
import { mapSqlError } from '../helpers/sqlErrorMapper.js';
import * as authService from '../services/auth.service.js';

/**
 * @openapi
 * tags:
 *   - name: Auth
 *     description: Authentication endpoints
 */

/**
 * @openapi
 * /api/auth/register:
 *   post:
 *     tags:
 *       - Auth
 *     summary: Register a new user (calls stored procedure sp_CreateUser)
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - username
 *               - email
 *               - full_name
 *               - password
 *             properties:
 *               username:
 *                 type: string
 *                 example: jdoe
 *               email:
 *                 type: string
 *                 format: email
 *                 example: jdoe@example.com
 *               full_name:
 *                 type: string
 *                 example: John Doe
 *               password:
 *                 type: string
 *                 example: P@ssw0rd!
 *               idUserSite:
 *                 type: integer
 *                 nullable: true
 *                 example: 10
 *               actif:
 *                 type: boolean
 *                 default: true
 *     responses:
 *       '201':
 *         description: User created and JWT returned
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 token:
 *                   type: string
 *                 user:
 *                   type: object
 *       '400':
 *         description: Validation error
 *       '409':
 *         description: Username or email already exists
 *       '500':
 *         description: Server / stored-proc error
 */
export const register = async (req, res, next) => {
  const { username, email, full_name, password, idUserSite = null, actif = true } = req.body || {};

  if (!username || !email || !full_name || !password) {
    return next(new AppError('username, email, full_name and password are required', 400));
  }

  try {
    const { createdRow } = await authService.createUser({
      username,
      email,
      full_name,
      password,
      idUserSite,
      actif
    });

    if (!createdRow || typeof createdRow.NewUserId === 'undefined') {
      console.error('sp_CreateUser returned unexpected result:', { createdRow });
      return next(new AppError('User creation failed (no id returned)', 500));
    }

    const newUserId = createdRow.NewUserId;

    // Fetch roles & perms (best-effort; failures fall back to empty arrays)
    const rolesRows = await authService.getRolesForUser(newUserId).catch(err => {
      console.warn('getRolesForUser failed for new user', newUserId, err?.message || err);
      return [];
    });

    const permsRows = await authService.getPermsForUser(newUserId).catch(err => {
      console.warn('getPermsForUser failed for new user', newUserId, err?.message || err);
      return [];
    });

    const roleNames = (rolesRows || []).map(r => r.roleName || r.name).filter(Boolean);
    const permNames = (permsRows || []).map(p => p.permissionName || p.name).filter(Boolean);

    const token = signToken({
      id: newUserId,
      username,
      roles: roleNames,
      permissions: permNames
    });

    const responseData = {
      token,
      user: {
        id: newUserId,
        username,
        email,
        full_name,
        actif: !!actif,
        idUserSite
      },
      roles: roleNames,
      permissions: permNames
    };

    sendSuccess(res, responseData, createdRow?.Message || 'User created successfully', 201);
  } catch (err) {
    const { status, message } = mapSqlError(err);
    console.error('sp_CreateUser error:', {
      message,
      original: err?.original || err
    });

    const errorMessage = process.env.NODE_ENV !== 'production' && status === 500
      ? 'Registration failed'
      : message;
    
    next(new AppError(errorMessage, status || 500));
  }
};

/**
 * @openapi
 * /api/auth/login:
 *   post:
 *     tags:
 *       - Auth
 *     summary: Login and obtain a JWT
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - username
 *               - password
 *             properties:
 *               username:
 *                 type: string
 *                 example: admin
 *               password:
 *                 type: string
 *                 example: secret
 *     responses:
 *       '200':
 *         description: JWT + user info
 *       '400':
 *         description: Missing username/password
 *       '401':
 *         description: Invalid credentials
 */
export const login = async (req, res, next) => {
  try {
    const { username, password } = req.body;
    const user = await authService.findUserByUsername(username);
    
    if (!user) {
      return next(new AppError('Invalid credentials', 401));
    }
    
    const ok = await authService.checkPassword(password, user.password);
    if (!ok) {
      return next(new AppError('Invalid credentials', 401));
    }
    
    const token = signToken(user.id);
    
    // Set JWT in httpOnly cookie
    res.cookie('token', token, {
      httpOnly: true,      // Prevents client-side JS from accessing the cookie
      secure: process.env.NODE_ENV === 'production',  // Only send over HTTPS in production
      sameSite: 'strict',  // CSRF protection
      maxAge: 7 * 24 * 60 * 60 * 1000  // 7 days in milliseconds
    });
    
    const responseData = {
      user: {
        id: user.id,
        username: user.username,
        email: user.email,
        full_name: user.full_name,
        actif: user.actif
      }
    };
    
    sendSuccess(res, responseData, 'Login successful');
  } catch (err) {
    next(new AppError(err.message, 500));
  }
};


/**
 * @openapi
 * /api/auth/me:
 *   get:
 *     tags:
 *       - Auth
 *     summary: Get current user profile
 *     security:
 *       - BearerAuth: []
 *     responses:
 *       '200':
 *         description: Current user profile
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 data:
 *                   type: object
 *       '401':
 *         description: Unauthorized
 */
export const me = async (req, res, next) => {
  try {
    const userId = req.user?.id;
    
    if (!userId) {
      return next(new AppError('Unauthorized', 401));
    }

    const profile = await authService.getUserById(userId);
    sendSuccess(res, profile || null, 'Profile retrieved successfully');
  } catch (err) {
    next(new AppError(err.message, 500));
  }
};

/**
 * @openapi
 * /api/auth/me/roles:
 *   get:
 *     tags:
 *       - Auth
 *     summary: List current user's roles
 *     security:
 *       - BearerAuth: []
 *     responses:
 *       '200':
 *         description: Roles list
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 data:
 *                   type: array
 *       '401':
 *         description: Unauthorized
 */
export const myRoles = async (req, res, next) => {
  try {
    const userId = req.user?.id;
    
    if (!userId) {
      return next(new AppError('Unauthorized', 401));
    }

    const roles = await authService.getRolesForUser(userId);
    sendSuccess(res, roles, 'Roles retrieved successfully');
  } catch (err) {
    next(new AppError(err.message, 500));
  }
};

/**
 * @openapi
 * /api/auth/me/permissions:
 *   get:
 *     tags:
 *       - Auth
 *     summary: List current user's permissions
 *     security:
 *       - BearerAuth: []
 *     responses:
 *       '200':
 *         description: Permissions list
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 data:
 *                   type: array
 *       '401':
 *         description: Unauthorized
 */
export const myPermissions = async (req, res, next) => {
  try {
    const userId = req.user?.id;
    
    if (!userId) {
      return next(new AppError('Unauthorized', 401));
    }

    const perms = await authService.getPermsForUser(userId);
    sendSuccess(res, perms, 'Permissions retrieved successfully');
  } catch (err) {
    next(new AppError(err.message, 500));
  }
};

/**
 * @openapi
 * /api/auth/create-user-complete:
 *   post:
 *     tags:
 *       - Auth
 *     summary: Create user with roles, permissions, and site assignment
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - full_name
 *               - email
 *               - username
 *               - password
 *               - groupement_name
 *               - site_id
 *             properties:
 *               full_name:
 *                 type: string
 *                 example: "John Doe"
 *               email:
 *                 type: string
 *                 example: "john.doe@example.com"
 *               username:
 *                 type: string
 *                 example: "jdoe"
 *               password:
 *                 type: string
 *                 example: "P@ssw0rd!"
 *               groupement_name:
 *                 type: string
 *                 enum: [filiale, succursale]
 *                 example: "filiale"
 *               site_id:
 *                 type: integer
 *                 example: 1
 *               role_ids:
 *                 type: array
 *                 items:
 *                   type: integer
 *                 example: [1, 2]
 *               permission_ids:
 *                 type: array
 *                 items:
 *                   type: integer
 *                 example: [1, 3, 5]
 *     responses:
 *       '201':
 *         description: User created successfully
 *       '400':
 *         description: Validation error
 *       '409':
 *         description: Username or email already exists
 *       '500':
 *         description: Server error
 */
export const createUserComplete = async (req, res, next) => {
  const {
    full_name,
    email,
    username,
    password,
    groupement_name,
    site_id,
    role_ids = [],
    permission_ids = []
  } = req.body || {};

  if (!full_name || !email || !username || !password || !groupement_name || !site_id) {
    return next(new AppError('full_name, email, username, password, groupement_name, and site_id are required', 400));
  }

  if (!['filiale', 'succursale'].includes(groupement_name.toLowerCase())) {
    return next(new AppError('groupement_name must be either "filiale" or "succursale"', 400));
  }

  try {
    const { createdRow } = await authService.createUserWithRolePermissionsAndSite({
      full_name,
      email,
      username,
      password,
      groupement_name: groupement_name.toLowerCase(),
      site_id: parseInt(site_id),
      role_ids: Array.isArray(role_ids) ? role_ids.map(id => parseInt(id)) : [],
      permission_ids: Array.isArray(permission_ids) ? permission_ids.map(id => parseInt(id)) : []
    });

    if (!createdRow || typeof createdRow.UserId === 'undefined') {
      console.error('sp_CreateUserWithRolePermissionsAndSite returned unexpected result:', { createdRow });
      return next(new AppError('User creation failed', 500));
    }

    // Fetch complete user information
    const userCompleteInfo = await authService.getUserCompleteInfoById(createdRow.UserId);

    const token = signToken({
      id: createdRow.UserId,
      username,
      roles: userCompleteInfo?.UserRoles?.split(', ') || [],
      permissions: userCompleteInfo?.UserPermissions?.split(', ') || []
    });

    const responseData = {
      token,
      user: userCompleteInfo
    };

    sendSuccess(res, responseData, createdRow.Message || 'User created successfully', 201);
  } catch (err) {
    const { status, message } = mapSqlError(err);
    console.error('createUserComplete error:', { message, original: err?.original || err });
    
    const errorMessage = process.env.NODE_ENV !== 'production' && status === 500
      ? 'User creation failed'
      : message;
    
    next(new AppError(errorMessage, status || 500));
  }
};

/**
 * @openapi
 * /api/auth/users:
 *   get:
 *     tags:
 *       - Auth
 *     summary: Get all users with complete information
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: query
 *         name: site_type
 *         schema:
 *           type: string
 *           enum: [filiale, succursale]
 *         description: Filter users by site type
 *       - in: query
 *         name: active_only
 *         schema:
 *           type: boolean
 *         description: Get only active users
 *     responses:
 *       '200':
 *         description: List of users with complete information
 */
export const getAllUsers = async (req, res, next) => {
  try {
    const { site_type, active_only } = req.query;
    let users;

    if (active_only === 'true') {
      users = await authService.getActiveUsersCompleteInfo();
    } else if (site_type) {
      users = await authService.getUsersBySiteType(site_type);
    } else {
      users = await authService.getAllUsersCompleteInfo();
    }

    const responseData = {
      data: users,
      total: users.length
    };

    sendSuccess(res, responseData, 'Users retrieved successfully');
  } catch (err) {
    next(new AppError(err.message, 500));
  }
};

/**
 * @openapi
 * /api/auth/users/{id}/complete:
 *   get:
 *     tags:
 *       - Auth
 *     summary: Get user complete information by ID
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: User ID
 *     responses:
 *       '200':
 *         description: User complete information
 *       '404':
 *         description: User not found
 */
export const getUserCompleteInfo = async (req, res, next) => {
  try {
    const userId = parseInt(req.params.id);

    if (!userId || userId <= 0) {
      return next(new AppError('Valid user ID is required', 400));
    }

    const user = await authService.getUserCompleteInfoById(userId);

    if (!user) {
      return next(new AppError('User not found', 404));
    }

    sendSuccess(res, user, 'User information retrieved successfully');
  } catch (err) {
    next(new AppError(err.message, 500));
  }
};

/**
 * @openapi
 * /api/auth/sites:
 *   get:
 *     tags:
 *       - Auth
 *     summary: Get available sites for user assignment
 *     security:
 *       - BearerAuth: []
 *     responses:
 *       '200':
 *         description: Available sites (filiales, succursales, groupements)
 */
export const getAvailableSites = async (req, res, next) => {
  try {
    const sites = await authService.getAvailableSites();
    sendSuccess(res, sites, 'Available sites retrieved successfully');
  } catch (err) {
    next(new AppError(err.message, 500));
  }
};

/**
 * @openapi
 * /api/auth/logout:
 *   post:
 *     tags:
 *       - Auth
 *     summary: Logout user and clear authentication cookie
 *     responses:
 *       '200':
 *         description: Logout successful
 *       '500':
 *         description: Server error
 */
export const logout = async (req, res, next) => {
  try {
    // Clear the authentication cookie
    res.clearCookie('token', {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      path: '/'
    });
    
    sendSuccess(res, null, 'Logout successful');
  } catch (err) {
    next(new AppError(err.message, 500));
  }
};

