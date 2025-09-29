// validateInput.js - Updated for appparameter service

// Helper function to create validation middleware
const createValidator = (validationRules) => {
  return (req, res, next) => {
    const errors = {};
    for (const [field, rules] of Object.entries(validationRules)) {
      // retrieve value from body, params or query
      let value = req.body?.[field] ?? req.params?.[field] ?? req.query?.[field];

      // If value is string, trim it for consistency
      if (typeof value === "string") value = value.trim();

      for (const rule of rules) {
        const error = rule(value, field);
        if (error) {
          errors[field] = error;
          break;
        }
      }
    }

    if (Object.keys(errors).length > 0) {
      return res.status(400).json({ error: "Validation failed", details: errors });
    }

    // Normalize trimmed key if exists in body
    if (req.body?.key && typeof req.body.key === "string") req.body.key = req.body.key.trim();

    next();
  };
};

// Validation rules
const rules = {
  required: (value, field) => (!value ? `${field} is required` : null),
  string: (value, field) =>
    value !== undefined && value !== null && typeof value !== "string"
      ? `${field} must be a string`
      : null,
  maxLength:
    (max) =>
    (value, field) =>
      value && value.length > max ? `${field} must be ${max} characters or less` : null,
  minLength:
    (min) =>
    (value, field) =>
      value && value.length < min ? `${field} must be at least ${min} characters` : null,
  integer: (value, field) => {
    const num = Number(value);
    if (value !== undefined && (!Number.isInteger(num) || num <= 0)) {
      return `${field} must be a positive integer`;
    }
    return null;
  },
  boolean: (value, field) =>
    value !== undefined && typeof value !== "boolean" && !["true", "false", "1", "0"].includes(String(value).toLowerCase())
      ? `${field} must be a boolean`
      : null,
};

// AppParameter-specific validators
export const validateAppParameterCreate = createValidator({
  key: [rules.required, rules.string, rules.minLength(1), rules.maxLength(255)],
  value: [rules.string, rules.maxLength(4000)],
  description: [rules.string, rules.maxLength(500)],
  type: [rules.string, rules.maxLength(50)],
  scope: [rules.string, rules.maxLength(50)],
  active: [rules.boolean],
});

export const validateAppParameterSet = createValidator({
  key: [rules.required, rules.string, rules.minLength(1), rules.maxLength(255)],
  value: [rules.required, rules.string, rules.maxLength(4000)],
  description: [rules.string, rules.maxLength(500)],
  type: [rules.string, rules.maxLength(50)],
  scope: [rules.string, rules.maxLength(50)],
  active: [rules.boolean],
});

export const validateAppParameterUpdate = createValidator({
  value: [rules.string, rules.maxLength(4000)],
  description: [rules.string, rules.maxLength(500)],
  type: [rules.string, rules.maxLength(50)],
  scope: [rules.string, rules.maxLength(50)],
  active: [rules.boolean],
});

export const validateAppParameterSearch = createValidator({
  q: [rules.required, rules.string, rules.minLength(1), rules.maxLength(100)],
});

export const validateAppParameterId = (req, res, next) => {
  const id = Number(req.params.id);
  if (!id || !Number.isInteger(id) || id <= 0) {
    return res.status(400).json({ error: "Validation failed", details: { id: "ID must be a positive integer" } });
  }
  req.params.id = id;
  next();
};

export const validateAppParameterKey = (req, res, next) => {
  const key = req.params.key?.toString().trim();
  if (!key) {
    return res.status(400).json({ error: "Validation failed", details: { key: "Key is required" } });
  }
  if (key.length > 255) {
    return res.status(400).json({ error: "Validation failed", details: { key: "Key must be 255 characters or less" } });
  }
  req.params.key = key;
  next();
};

export const validateAppParameterQuery = (req, res, next) => {
  const { type, scope, onlyActive } = req.query;
  const errors = {};

  if (type !== undefined && typeof type !== "string") {
    errors.type = "Type must be a string";
  }
  if (scope !== undefined && typeof scope !== "string") {
    errors.scope = "Scope must be a string";
  }
  if (
    onlyActive !== undefined &&
    !["true", "false", "1", "0"].includes(String(onlyActive).toLowerCase())
  ) {
    errors.onlyActive = "OnlyActive must be a boolean value";
  }

  if (Object.keys(errors).length > 0) {
    return res.status(400).json({ error: "Validation failed", details: errors });
  }

  next();
};
