// src/middlewares/filiale/validateInput.js

/**
 * Validation middleware specifically for Filiale management operations
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
      : null
};

// Filiale-specific validators
export const validateFilialeCreate = createValidator({
  name: [rules.required, rules.string, rules.minLength(1), rules.maxLength(255)],
  active: [rules.boolean]
});

export const validateFilialeUpdate = createValidator({
  name: [rules.string, rules.minLength(1), rules.maxLength(255)],
  active: [rules.boolean]
});

// For route parameters
export const validateFilialeId = (req, res, next) => {
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
