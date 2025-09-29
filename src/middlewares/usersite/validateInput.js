// src/middlewares/usersite/validateInput.js

/**
 * Validation middleware specifically for UserSite management operations
 */

// Helper function to create validation middleware
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

    // Normalize string fields if they exist in body
    if (req.body?.groupement_name && typeof req.body.groupement_name === 'string') {
      req.body.groupement_name = req.body.groupement_name.trim();
    }
    if (req.body?.site_type && typeof req.body.site_type === 'string') {
      req.body.site_type = req.body.site_type.trim();
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
  enum: (allowedValues) => (value, field) => 
    value && !allowedValues.includes(value) 
      ? `${field} must be one of: ${allowedValues.join(', ')}` 
      : null
};

// UserSite-specific validators
export const validateUserSiteCreate = createValidator({
  idGroupement: [rules.required, rules.integer],
  idSite: [rules.required, rules.integer],
  active: [rules.boolean]
});

export const validateUserSiteUpdate = createValidator({
  idGroupement: [rules.integer],
  idSite: [rules.integer],
  active: [rules.boolean]
});

// Search validation middleware
export const validateUserSiteSearch = (req, res, next) => {
  const { idGroupement, groupement_name, idSite, site_type, onlyActive } = req.query;
  const errors = {};

  // Validate idGroupement
  if (idGroupement !== undefined) {
    const groupementNum = Number(idGroupement);
    if (!Number.isInteger(groupementNum) || groupementNum <= 0) {
      errors.idGroupement = 'Groupement ID must be a positive integer';
    } else {
      req.query.idGroupement = groupementNum;
    }
  }

  // Validate idSite
  if (idSite !== undefined) {
    const siteNum = Number(idSite);
    if (!Number.isInteger(siteNum) || siteNum <= 0) {
      errors.idSite = 'Site ID must be a positive integer';
    } else {
      req.query.idSite = siteNum;
    }
  }

  // Validate groupement_name
  if (groupement_name !== undefined) {
    if (typeof groupement_name !== 'string') {
      errors.groupement_name = 'Groupement name must be a string';
    } else if (groupement_name.trim().length === 0) {
      errors.groupement_name = 'Groupement name cannot be empty';
    } else if (groupement_name.length > 255) {
      errors.groupement_name = 'Groupement name must be 255 characters or less';
    }
  }

  // Validate site_type
  if (site_type !== undefined) {
    if (typeof site_type !== 'string') {
      errors.site_type = 'Site type must be a string';
    } else if (!['Filiale', 'Succursale'].includes(site_type.trim())) {
      errors.site_type = 'Site type must be either "Filiale" or "Succursale"';
    }
  }

  // Validate onlyActive
  if (onlyActive !== undefined) {
    if (!['true', 'false', '1', '0'].includes(String(onlyActive).toLowerCase())) {
      errors.onlyActive = 'onlyActive must be a boolean value';
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

// Route parameter validators
export const validateUserSiteId = (req, res, next) => {
  const id = Number(req.params.id);
  if (!id || id <= 0 || !Number.isInteger(id)) {
    return res.status(400).json({
      error: 'Validation failed',
      details: { id: 'UserSite ID must be a positive integer' }
    });
  }
  req.params.id = id;
  next();
};

export const validateGroupementId = (req, res, next) => {
  const idGroupement = Number(req.params.idGroupement);
  if (!idGroupement || idGroupement <= 0 || !Number.isInteger(idGroupement)) {
    return res.status(400).json({
      error: 'Validation failed',
      details: { idGroupement: 'Groupement ID must be a positive integer' }
    });
  }
  req.params.idGroupement = idGroupement;
  next();
};

export const validateSiteId = (req, res, next) => {
  const idSite = Number(req.params.idSite);
  if (!idSite || idSite <= 0 || !Number.isInteger(idSite)) {
    return res.status(400).json({
      error: 'Validation failed',
      details: { idSite: 'Site ID must be a positive integer' }
    });
  }
  req.params.idSite = idSite;
  next();
};
