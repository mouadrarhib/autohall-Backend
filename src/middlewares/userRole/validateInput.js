// src/middlewares/userRole/validateInput.js

const createValidator = (validationRules) => (req, res, next) => {
  const errors = {};
  for (const [field, rules] of Object.entries(validationRules)) {
    let value = req.body?.[field] ?? req.params?.[field] ?? req.query?.[field];
    if (typeof value === 'string') value = value.trim();

    for (const rule of rules) {
      const error = rule(value, field);
      if (error) { errors[field] = error; break; }
    }
  }
  if (Object.keys(errors).length > 0) {
    return res.status(400).json({ error: 'Validation failed', details: errors });
  }
  next();
};

const rules = {
  required: (v, f) => (v === undefined || v === null || v === '') ? `${f} is required` : null,
  integer: (v, f) => (v !== undefined && (!Number.isInteger(Number(v)) || Number(v) <= 0)) ? `${f} must be a positive integer` : null,
  boolean: (v, f) => (v !== undefined && typeof v !== 'boolean' && !['true','false','1','0'].includes(String(v).toLowerCase())) ? `${f} must be a boolean` : null,
  arrayOfInt: (v, f) => {
    if (v === undefined) return null;
    if (!Array.isArray(v)) return `${f} must be an array`;
    return v.some(x => !Number.isInteger(Number(x)) || Number(x) <= 0) ? `${f} must contain positive integers` : null;
  }
};

// POST /link, /unlink, /set-active, /toggle
export const validateLinkBody = createValidator({
  userId: [rules.required, rules.integer],
  roleId: [rules.required, rules.integer],
  active: [rules.boolean]
});
export const validateUnlinkBody = createValidator({
  userId: [rules.required, rules.integer],
  roleId: [rules.required, rules.integer]
});
export const validateSetActiveBody = createValidator({
  userId: [rules.required, rules.integer],
  roleId: [rules.required, rules.integer],
  active: [rules.required, rules.boolean]
});

// GET /users/:roleId, /users/:roleId/count
export const validateRoleIdParam = (req, res, next) => {
  const id = Number(req.params.roleId);
  if (!Number.isInteger(id) || id <= 0) {
    return res.status(400).json({ error: 'Validation failed', details: { roleId: 'roleId must be a positive integer' }});
  }
  req.params.roleId = id;
  next();
};

// GET /users/:roleId, /users/:roleId/count
export const validateUserIdParam = (req, res, next) => {
  const id = Number(req.params.userId);
  if (!Number.isInteger(id) || id <= 0) {
    return res.status(400).json({ error: 'Validation failed', details: { userId: 'userId must be a positive integer' }});
  }
  req.params.userId = id;
  next();
};

// Bulk bodies
export const validateBulkRolesToUser = createValidator({
  userId: [rules.required, rules.integer],
  roleIds: [rules.required, rules.arrayOfInt],
  active: [rules.boolean]
});
export const validateBulkUsersToRole = createValidator({
  roleId: [rules.required, rules.integer],
  userIds: [rules.required, rules.arrayOfInt],
  active: [rules.boolean]
});
export const validateBulkSetActiveByUser = createValidator({
  userId: [rules.required, rules.integer],
  roleIds: [rules.required, rules.arrayOfInt],
  active: [rules.required, rules.boolean]
});
export const validateBulkSetActiveByRole = createValidator({
  roleId: [rules.required, rules.integer],
  userIds: [rules.required, rules.arrayOfInt],
  active: [rules.required, rules.boolean]
});

// Sync bodies
export const validateSyncRolesForUser = createValidator({
  userId: [rules.required, rules.integer],
  roleIds: [rules.required, rules.arrayOfInt],
  active: [rules.boolean]
});
export const validateSyncUsersForRole = createValidator({
  roleId: [rules.required, rules.integer],
  userIds: [rules.required, rules.arrayOfInt],
  active: [rules.boolean]
});

// Query checks
export const validateHasRoleQuery = createValidator({
  userId: [rules.required, rules.integer],
  roleId: [rules.required, rules.integer],
  activeOnly: [rules.boolean]
});
