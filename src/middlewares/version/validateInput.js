// src/middlewares/version/validateInput.js

/**
 * Validation middleware specifically for Version management operations
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
    // Normalize data - trim name if exists in body
    if (req.body?.name && typeof req.body.name === 'string') {
      req.body.name = req.body.name.trim();
    }
    next();
  };
};

// Validation rules
const rules = {
  required: (value, field) => 
    (value === undefined || value === null || value === '') 
      ? `${field} is required` 
      : null,
  
  string: (value, field) =>
    value !== undefined && value !== null && typeof value !== 'string'
      ? `${field} must be a string`
      : null,
  
  maxLength: (max) => (value, field) =>
    value && value.length > max ? `${field} must be ${max} characters or less` : null,
  
  minLength: (min) => (value, field) =>
    value && value.length < min ? `${field} must be at least ${min} characters` : null,
  
  positiveInt: (value, field) => {
    if (value === undefined || value === null || value === '') return null;
    const num = Number(value);
    return (!Number.isInteger(num) || num <= 0)
      ? `${field} must be a positive integer`
      : null;
  },
  
  decimal: (value, field) => {
    if (value === undefined || value === null || value === '') return null;
    const num = Number(value);
    return Number.isNaN(num) || num < 0
      ? `${field} must be a non-negative number`
      : null;
  },
  
  maxDecimal: (max) => (value, field) => {
    if (value === undefined || value === null || value === '') return null;
    const num = Number(value);
    return num > max
      ? `${field} must be <= ${max}`
      : null;
  },
  
  boolean: (value, field) =>
    value !== undefined && 
    typeof value !== 'boolean' && 
    !['true', 'false', '1', '0'].includes(String(value).toLowerCase())
      ? `${field} must be a boolean`
      : null
};

// Version-specific validators
export const validateVersionCreate = createValidator({
  name: [rules.required, rules.string, rules.maxLength(100)],
  idModele: [rules.required, rules.positiveInt],
  volume: [rules.required, rules.positiveInt],
  price: [rules.required, rules.decimal],
  tm: [rules.required, rules.decimal, rules.maxDecimal(0.4)],
  margin: [rules.required, rules.decimal, rules.maxDecimal(0.4)]
});

export const validateVersionUpdate = createValidator({
  name: [rules.required, rules.string, rules.maxLength(100)],
  idModele: [rules.required, rules.positiveInt],
  volume: [rules.required, rules.positiveInt],
  price: [rules.required, rules.decimal],
  tm: [rules.required, rules.decimal, rules.maxDecimal(0.4)],
  margin: [rules.required, rules.decimal, rules.maxDecimal(0.4)]
});

export const validateVersionSearch = createValidator({
  searchTerm: [rules.required, rules.string, rules.minLength(1), rules.maxLength(100)]
});

export const validateSetActive = createValidator({
  active: [rules.required, rules.boolean]
});

// For route parameters
export const validateVersionId = (req, res, next) => {
  const id = Number(req.params.id);
  if (!id || id <= 0 || !Number.isInteger(id)) {
    return res.status(400).json({
      error: 'Validation failed',
      details: { id: 'Version ID must be a positive integer' }
    });
  }
  req.params.id = id;
  next();
};

export const validateModeleId = (req, res, next) => {
  const idModele = Number(req.params.idModele);
  if (!idModele || idModele <= 0 || !Number.isInteger(idModele)) {
    return res.status(400).json({
      error: 'Validation failed',
      details: { idModele: 'Modele ID must be a positive integer' }
    });
  }
  req.params.idModele = idModele;
  next();
};

// Query parameter validation
export const validateVersionQuery = (req, res, next) => {
  const { idModele, onlyActive } = req.query;
  const errors = {};

  if (idModele !== undefined) {
    const modeleNum = Number(idModele);
    if (!Number.isInteger(modeleNum) || modeleNum <= 0) {
      errors.idModele = 'Modele ID must be a positive integer';
    } else {
      req.query.idModele = modeleNum;
    }
  }

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

// Search parameter validation
export const validateVersionSearchQuery = (req, res, next) => {
  const { q, idModele, onlyActive } = req.query;
  const errors = {};

  // Validate search query (optional, but if provided must be valid)
  if (q !== undefined) {
    if (typeof q !== 'string') {
      errors.q = 'Search query must be a string';
    } else if (q.trim().length === 0) {
      errors.q = 'Search query cannot be empty';
    } else if (q.length > 100) {
      errors.q = 'Search query must be 100 characters or less';
    }
  }

  // Validate optional idModele filter
  if (idModele !== undefined) {
    const modeleNum = Number(idModele);
    if (!Number.isInteger(modeleNum) || modeleNum <= 0) {
      errors.idModele = 'Modele ID must be a positive integer';
    } else {
      req.query.idModele = modeleNum;
    }
  }

  // Validate optional onlyActive filter
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
