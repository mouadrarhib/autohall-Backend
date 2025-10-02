// src/middlewares/typevente/validateInput.js

const createValidator = (validationRules, extraCrossCheck) => {
  return (req, res, next) => {
    const errors = {};
    for (const [field, rules] of Object.entries(validationRules)) {
      let value = req.body?.[field] ?? req.params?.[field] ?? req.query?.[field];
      if (typeof value === 'string') value = value.trim();
      for (const rule of rules) {
        const error = rule(value, field);
        if (error) { errors[field] = error; break; }
      }
    }
    if (typeof extraCrossCheck === 'function') {
      const crossErr = extraCrossCheck(req);
      if (crossErr) errors._schema = crossErr;
    }
    if (Object.keys(errors).length > 0) {
      return res.status(400).json({ error: 'Validation failed', details: errors });
    }
    if (req.body?.name && typeof req.body.name === 'string') {
      req.body.name = req.body.name.trim();
    }
    next();
  };
};

const rules = {
  required: (value, field) => (value === undefined || value === null || value === '') ? `${field} is required` : null,
  string: (value, field) => (value !== undefined && value !== null && typeof value !== 'string') ? `${field} must be a string` : null,
  maxLength: (max) => (value, field) => (value && value.length > max) ? `${field} must be ${max} characters or less` : null,
  minLength: (min) => (value, field) => (value && value.length < min) ? `${field} must be at least ${min} characters` : null
};

export const validateTypeVenteCreate = createValidator({
  name: [rules.required, rules.string, rules.minLength(1), rules.maxLength(100)]
});

export const validateTypeVenteUpdate = createValidator({
  name: [rules.required, rules.string, rules.minLength(1), rules.maxLength(100)]
});

export const validateTypeVenteId = (req, res, next) => {
  const id = Number(req.params.id);
  if (!id || id <= 0 || !Number.isInteger(id)) {
    return res.status(400).json({ error: 'Validation failed', details: { id: 'ID must be a positive integer' } });
  }
  req.params.id = id;
  next();
};
