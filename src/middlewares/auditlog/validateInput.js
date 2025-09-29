// src/middlewares/auditlog/validateInput.js

/**
 * Validation middleware specifically for AuditLog operations
 */

// Helper function to create validation middleware
const createValidator = (validationRules) => {
  return (req, res, next) => {
    const errors = {};
    
    for (const [field, rules] of Object.entries(validationRules)) {
      const value = req.body?.[field] || req.params?.[field] || req.query?.[field];
      
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

    next();
  };
};

// Validation rules
const rules = {
  required: (value, field) => !value ? `${field} is required` : null,
  string: (value, field) => value && typeof value !== 'string' ? `${field} must be a string` : null,
  maxLength: (max) => (value, field) => value && value.length > max ? `${field} must be ${max} characters or less` : null,
  minLength: (min) => (value, field) => value && value.length < min ? `${field} must be at least ${min} characters` : null,
  integer: (value, field) => {
    const num = Number(value);
    return value && (!Number.isInteger(num) || num <= 0) ? `${field} must be a positive integer` : null;
  },
  positiveInteger: (value, field) => {
    const num = Number(value);
    return value && (!Number.isInteger(num) || num < 0) ? `${field} must be a non-negative integer` : null;
  },
  datetime: (value, field) => {
    if (!value) return null;
    const date = new Date(value);
    return isNaN(date.getTime()) ? `${field} must be a valid datetime` : null;
  }
};

// AuditLog-specific validators
export const validateTimeWindow = createValidator({
  fromUtc: [rules.required, rules.datetime],
  toUtc: [rules.required, rules.datetime]
});

export const validateExportWindow = createValidator({
  fromUtc: [rules.required, rules.datetime],
  toUtc: [rules.required, rules.datetime],
  lastId: [rules.positiveInteger],
  batchSize: [rules.integer]
});

export const validateWriteAuditLog = createValidator({
  module: [rules.required, rules.string, rules.minLength(1), rules.maxLength(100)],
  action: [rules.required, rules.string, rules.minLength(1), rules.maxLength(100)],
  scope: [rules.string, rules.maxLength(50)],
  message: [rules.string, rules.maxLength(4000)],
  description: [rules.string, rules.maxLength(4000)]
});

export const validatePurgeRolling = createValidator({
  retainDays: [rules.integer],
  module: [rules.string, rules.maxLength(100)],
  action: [rules.string, rules.maxLength(100)]
});

// For route parameters
export const validateAuditLogId = (req, res, next) => {
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

// Query parameter validation
export const validateAuditLogQuery = (req, res, next) => {
  const { module, action, topN } = req.query;
  const errors = {};
  
  if (module !== undefined && (typeof module !== 'string' || module.length > 100)) {
    errors.module = 'Module must be a string with max 100 characters';
  }
  
  if (action !== undefined && (typeof action !== 'string' || action.length > 100)) {
    errors.action = 'Action must be a string with max 100 characters';
  }
  
  if (topN !== undefined) {
    const topNNum = Number(topN);
    if (!Number.isInteger(topNNum) || topNNum <= 0 || topNNum > 1000) {
      errors.topN = 'TopN must be a positive integer between 1 and 1000';
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
