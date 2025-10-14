// src/middlewares/rolePermission/validateInput.js

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

const rules = {
  required: (value, field) => !value ? `${field} is required` : null,
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
  array: (value, field) => 
    value !== undefined && !Array.isArray(value)
      ? `${field} must be an array`
      : null
};

export const validateAssign = createValidator({
  idRole: [rules.required, rules.integer],
  idPermission: [rules.required, rules.integer],
  active: [rules.boolean]
});

export const validateRemove = createValidator({
  idRole: [rules.required, rules.integer],
  idPermission: [rules.required, rules.integer]
});

export const validateToggle = createValidator({
  idRole: [rules.required, rules.integer],
  idPermission: [rules.required, rules.integer]
});

export const validateRoleId = (req, res, next) => {
  const idRole = Number(req.params.idRole);
  if (!idRole || idRole <= 0 || !Number.isInteger(idRole)) {
    return res.status(400).json({
      error: 'Validation failed',
      details: { idRole: 'Role ID must be a positive integer' }
    });
  }
  req.params.idRole = idRole;
  next();
};

export const validatePermissionId = (req, res, next) => {
  const idPermission = Number(req.params.idPermission);
  if (!idPermission || idPermission <= 0 || !Number.isInteger(idPermission)) {
    return res.status(400).json({
      error: 'Validation failed',
      details: { idPermission: 'Permission ID must be a positive integer' }
    });
  }
  req.params.idPermission = idPermission;
  next();
};

export const validateSyncPermissions = createValidator({
  permissionIds: [rules.required, rules.array],
  active: [rules.boolean]
});

export const validateSyncRoles = createValidator({
  roleIds: [rules.required, rules.array],
  active: [rules.boolean]
});

export const validateCheck = createValidator({
  idRole: [rules.required, rules.integer],
  idPermission: [rules.required, rules.integer],
  activeOnly: [rules.boolean]
});
