// src/middlewares/userRole/validateInput.js

const createValidator = (validationRules) => {
  return (req, res, next) => {
    const errors = {};
    
    for (const [field, rules] of Object.entries(validationRules)) {
      let value = req.body?.[field] ?? req.params?.[field] ?? req.query?.[field];
      
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
  
  integer: (value, field) => {
    const num = Number(value);
    return value !== undefined && (!Number.isInteger(num) || num <= 0)
      ? `${field} must be a positive integer`
      : null;
  },
  
  boolean: (value, field) =>
    value !== undefined && typeof value !== 'boolean'
      ? `${field} must be a boolean`
      : null,
  
  intArray: (value, field) => {
    if (value === undefined) return null;
    if (!Array.isArray(value)) return `${field} must be an array`;
    if (value.length === 0) return `${field} cannot be empty`;
    if (!value.every(id => Number.isInteger(Number(id)) && Number(id) > 0)) {
      return `${field} must contain only positive integers`;
    }
    return null;
  }
};

// Validators
export const validateAssign = createValidator({
  userId: [rules.required, rules.integer],
  roleId: [rules.required, rules.integer],
  active: [rules.boolean]
});

export const validateRemove = createValidator({
  userId: [rules.required, rules.integer],
  roleId: [rules.required, rules.integer]
});

export const validateToggle = createValidator({
  userId: [rules.required, rules.integer],
  roleId: [rules.required, rules.integer]
});

export const validateUserId = (req, res, next) => {
  const userId = Number(req.params.userId || req.query.userId);
  if (!userId || userId <= 0 || !Number.isInteger(userId)) {
    return res.status(400).json({
      error: 'Validation failed',
      details: { userId: 'userId must be a positive integer' }
    });
  }
  req.params.userId = userId;
  next();
};

export const validateRoleId = (req, res, next) => {
  const roleId = Number(req.params.roleId || req.query.roleId);
  if (!roleId || roleId <= 0 || !Number.isInteger(roleId)) {
    return res.status(400).json({
      error: 'Validation failed',
      details: { roleId: 'roleId must be a positive integer' }
    });
  }
  req.params.roleId = roleId;
  next();
};

export const validateSyncRoles = createValidator({
  roleIds: [rules.required, rules.intArray],
  active: [rules.boolean]
});

export const validateSyncUsers = createValidator({
  userIds: [rules.required, rules.intArray],
  active: [rules.boolean]
});

export const validateCheck = (req, res, next) => {
  const errors = {};
  
  const userId = Number(req.query.userId);
  if (!userId || userId <= 0 || !Number.isInteger(userId)) {
    errors.userId = 'userId must be a positive integer';
  }
  
  const roleId = Number(req.query.roleId);
  if (!roleId || roleId <= 0 || !Number.isInteger(roleId)) {
    errors.roleId = 'roleId must be a positive integer';
  }
  
  if (Object.keys(errors).length > 0) {
    return res.status(400).json({
      error: 'Validation failed',
      details: errors
    });
  }
  
  next();
};
