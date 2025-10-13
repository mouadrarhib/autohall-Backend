// src/middlewares/permission/validateInput.js

/**
 * Validation middleware specifically for Permission management operations
 */

// Helper function to create validation middleware
import { body, validationResult } from 'express-validator';

const createValidator = (validationRules) => {
  return (req, res, next) => {
    const errors = {};
    for (const [field, rules] of Object.entries(validationRules)) {
      let value = req.body?.[field] ?? req.params?.[field] ?? req.query?.[field];
      
      // Trim string values
      if (typeof value === 'string') value = value.trim();
      
      for (const rule of rules) {
        const error = rule(value, field);
        if (error) {
          errors[field] = error;
          break;
        }
      }
    }

    if (Object.keys(errors).length > 0) {
      return res.status(400).json({
        error: 'Validation failed',
        details: errors
      });
    }

    // Normalize data - trim name if exists in body
    if (req.body?.name && typeof req.body.name === 'string') {
      req.body.name = req.body.name.trim();
    }
    if (req.body?.search && typeof req.body.search === 'string') {
      req.body.search = req.body.search.trim();
    }

    next();
  };
};

// Validation rules
const rules = {
  required: (value, field) => !value ? `${field} is required` : null,
  string: (value, field) => 
    value !== undefined && value !== null && typeof value !== 'string' 
      ? `${field} must be a string` 
      : null,
  maxLength: (max) => (value, field) => 
    value && value.length > max ? `${field} must be ${max} characters or less` : null,
  minLength: (min) => (value, field) => 
    value && value.length < min ? `${field} must be at least ${min} characters` : null,
  integer: (value, field) => {
    const num = Number(value);
    return value !== undefined && (!Number.isInteger(num) || num <= 0) 
      ? `${field} must be a positive integer` 
      : null;
  },
  boolean: (value, field) => 
    value !== undefined && typeof value !== 'boolean' && !['true', 'false', '1', '0'].includes(String(value).toLowerCase())
      ? `${field} must be a boolean` 
      : null,
  pagination: (value, field) => {
    if (value === undefined) return null;
    const num = Number(value);
    if (!Number.isInteger(num) || num < 1) {
      return `${field} must be a positive integer`;
    }
    if (field === 'pageSize' && num > 1000) {
      return `${field} must be 1000 or less`;
    }
    return null;
  }
};

// Permission-specific validators
export const validatePermissionCreate = createValidator({
  name: [rules.required, rules.string, rules.minLength(1), rules.maxLength(255)],
  active: [rules.boolean]
});

export const validatePermissionUpdate = createValidator({
  name: [rules.string, rules.minLength(1), rules.maxLength(255)],
  active: [rules.boolean]
});

export const validateUserPermissionBody = createValidator({
  idPermission: [rules.required, rules.integer],
  hardDelete: [rules.boolean]
});

export const validateSetActive = [
  // `exists` (with checkNull/Falsy) ensures the key is present even if it's false
  body('active')
    .exists({ checkNull: true })
    .withMessage('active is required')
    .isBoolean()
    .withMessage('active must be a boolean')
    .toBoolean(),
  (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        error: 'Validation failed',
        details: Object.fromEntries(errors.array().map(e => [e.path, e.msg])),
      });
    }
    next();
  },
];

// Query parameter validation for listPermissions
export const validatePermissionQuery = (req, res, next) => {
  const { active, search, page, pageSize } = req.query;
  const errors = {};

  // Validate active parameter
  if (active !== undefined && !['true', 'false', '1', '0'].includes(String(active).toLowerCase())) {
    errors.active = 'Active must be a boolean value';
  }

  // Validate search parameter
  if (search !== undefined) {
    if (typeof search !== 'string') {
      errors.search = 'Search must be a string';
    } else if (search.trim().length === 0) {
      errors.search = 'Search cannot be empty';
    } else if (search.length > 100) {
      errors.search = 'Search must be 100 characters or less';
    }
  }

  // Validate pagination parameters
  if (page !== undefined) {
    const pageNum = Number(page);
    if (!Number.isInteger(pageNum) || pageNum < 1) {
      errors.page = 'Page must be a positive integer';
    }
  }

  if (pageSize !== undefined) {
    const pageSizeNum = Number(pageSize);
    if (!Number.isInteger(pageSizeNum) || pageSizeNum < 1) {
      errors.pageSize = 'PageSize must be a positive integer';
    } else if (pageSizeNum > 1000) {
      errors.pageSize = 'PageSize must be 1000 or less';
    }
  }

  if (Object.keys(errors).length > 0) {
    return res.status(400).json({
      error: 'Validation failed',
      details: errors
    });
  }

  next();
};

// For route parameters
export const validatePermissionId = (req, res, next) => {
  const id = Number(req.params.id);
  if (!id || id <= 0 || !Number.isInteger(id)) {
    return res.status(400).json({
      error: 'Validation failed',
      details: { id: 'Permission ID must be a positive integer' }
    });
  }
  req.params.id = id;
  next();
};

export const validateUserId = (req, res, next) => {
  const idUser = Number(req.params.idUser);
  if (!idUser || idUser <= 0 || !Number.isInteger(idUser)) {
    return res.status(400).json({
      error: 'Validation failed',
      details: { idUser: 'User ID must be a positive integer' }
    });
  }
  req.params.idUser = idUser;
  next();
};

export const validatePermissionName = (req, res, next) => {
  const name = req.params.name?.toString().trim();
  if (!name) {
    return res.status(400).json({
      error: 'Validation failed',
      details: { name: 'Permission name is required' }
    });
  }
  if (name.length > 255) {
    return res.status(400).json({
      error: 'Validation failed',
      details: { name: 'Permission name must be 255 characters or less' }
    });
  }
  req.params.name = name;
  next();
};

// Composite validator for user-permission operations
export const validateUserPermissionParams = (req, res, next) => {
  const idUser = Number(req.params.idUser);
  const idPermission = Number(req.params.idPermission);
  const errors = {};

  if (!idUser || idUser <= 0 || !Number.isInteger(idUser)) {
    errors.idUser = 'User ID must be a positive integer';
  }

  if (!idPermission || idPermission <= 0 || !Number.isInteger(idPermission)) {
    errors.idPermission = 'Permission ID must be a positive integer';
  }

  if (Object.keys(errors).length > 0) {
    return res.status(400).json({
      error: 'Validation failed',
      details: errors
    });
  }

  req.params.idUser = idUser;
  req.params.idPermission = idPermission;
  next();
};
