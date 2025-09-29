// src/middleware/validation.js

export const validatePermissionCreate = (req, res, next) => {
  const { name } = req.body || {};
  
  if (!name || typeof name !== 'string' || name.trim().length === 0) {
    return res.status(400).json({ 
      error: 'Validation failed', 
      details: { name: 'Name is required and must be a non-empty string' }
    });
  }

  if (name.length > 100) {
    return res.status(400).json({ 
      error: 'Validation failed', 
      details: { name: 'Name must be 100 characters or less' }
    });
  }

  // Normalize the name (trim whitespace)
  req.body.name = name.trim();
  next();
};

export const validatePermissionUpdate = (req, res, next) => {
  const { name, active } = req.body || {};
  const errors = {};

  if (name !== undefined) {
    if (typeof name !== 'string' || name.trim().length === 0) {
      errors.name = 'Name must be a non-empty string';
    } else if (name.length > 100) {
      errors.name = 'Name must be 100 characters or less';
    } else {
      req.body.name = name.trim();
    }
  }

  if (active !== undefined && typeof active !== 'boolean') {
    errors.active = 'Active must be a boolean value';
  }

  if (Object.keys(errors).length > 0) {
    return res.status(400).json({ 
      error: 'Validation failed', 
      details: errors 
    });
  }

  next();
};

export const validateIdParam = (req, res, next) => {
  const id = Number(req.params.id);
  
  if (!id || id <= 0 || !Number.isInteger(id)) {
    return res.status(400).json({ 
      error: 'Validation failed', 
      details: { id: 'ID must be a positive integer' }
    });
  }

  req.params.id = id; // Normalize to number
  next();
};

export const validateUserPermissionBody = (req, res, next) => {
  const { idPermission, hardDelete } = req.body || {};
  const errors = {};

  if (!idPermission || !Number.isInteger(Number(idPermission)) || Number(idPermission) <= 0) {
    errors.idPermission = 'Permission ID must be a positive integer';
  }

  if (hardDelete !== undefined && typeof hardDelete !== 'boolean') {
    errors.hardDelete = 'hardDelete must be a boolean value';
  }

  if (Object.keys(errors).length > 0) {
    return res.status(400).json({ 
      error: 'Validation failed', 
      details: errors 
    });
  }

  req.body.idPermission = Number(idPermission);
  next();
};

export const validatePaginationQuery = (req, res, next) => {
  const { page = 1, pageSize = 50 } = req.query;
  
  const pageNum = Number(page);
  const pageSizeNum = Number(pageSize);
  
  if (!Number.isInteger(pageNum) || pageNum < 1) {
    return res.status(400).json({ 
      error: 'Validation failed', 
      details: { page: 'Page must be a positive integer' }
    });
  }

  if (!Number.isInteger(pageSizeNum) || pageSizeNum < 1 || pageSizeNum > 1000) {
    return res.status(400).json({ 
      error: 'Validation failed', 
      details: { pageSize: 'Page size must be between 1 and 1000' }
    });
  }

  req.query.page = pageNum;
  req.query.pageSize = pageSizeNum;
  next();
};
