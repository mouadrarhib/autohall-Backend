// src/middlewares/marque/validateInput.js

/**
 * Validation middleware specifically for Marque management operations
 */

// Helper function to create validation middleware

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
  optional: (value, field) => null // Always pass for optional fields
};


const createValidator = (validationRules) => {
    return (req, res, next) => {
        const errors = {};
        for (const [field, rules] of Object.entries(validationRules)) {
            let value = req.body?.[field] ?? req.params?.[field] ?? req.query?.[field];
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
        
        // ✅ REMOVED: imageUrl trimming (no longer needed)
        
        next();
    };
};

// Marque-specific validators
export const validateMarqueCreate = createValidator({
  name: [rules.required, rules.string, rules.minLength(1), rules.maxLength(255)],
  idFiliale: [rules.required, rules.integer],
  active: [rules.boolean]
});

export const validateMarqueUpdate = createValidator({
  name: [rules.string, rules.minLength(1), rules.maxLength(255)],
  idFiliale: [rules.integer],
  active: [rules.boolean]
});

export const validateMarqueSearch = (req, res, next) => {
  const search = req.query.search?.trim();
  const q = req.query.q?.trim();
  
  if (!search && !q) {
    return res.status(400).json({
      error: 'Validation failed',
      details: { searchTerm: 'Either search or q parameter is required' }
    });
  }
  
  const searchTerm = search || q;
  
  if (searchTerm.length < 1 || searchTerm.length > 100) {
    return res.status(400).json({
      error: 'Validation failed',
      details: { searchTerm: 'Search term must be between 1 and 100 characters' }
    });
  }
  
  next();
};



// For route parameters
export const validateMarqueId = (req, res, next) => {
  const id = Number(req.params.id);
  if (!id || id <= 0 || !Number.isInteger(id)) {
    return res.status(400).json({
      error: 'Validation failed',
      details: { id: 'ID must be a positive integer' }
    });
  }
  req.params.id = id;
  next();
};

export const validateFilialeId = (req, res, next) => {
  const idFiliale = Number(req.params.idFiliale);
  if (!idFiliale || idFiliale <= 0 || !Number.isInteger(idFiliale)) {
    return res.status(400).json({
      error: 'Validation failed',
      details: { idFiliale: 'Filiale ID must be a positive integer' }
    });
  }
  req.params.idFiliale = idFiliale;
  next();
};

// Query parameter validation
export const validateMarqueQuery = (req, res, next) => {
  const { idFiliale, onlyActive } = req.query;
  const errors = {};

  if (idFiliale !== undefined) {
    const filialeNum = Number(idFiliale);
    if (!Number.isInteger(filialeNum) || filialeNum <= 0) {
      errors.idFiliale = 'Filiale ID must be a positive integer';
    } else {
      req.query.idFiliale = filialeNum;
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
