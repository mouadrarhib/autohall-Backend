// src/middlewares/typeperiode/validateInput.js

// Reuse the same local validator approach as in marque validateInput
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
  minLength: (min) => (value, field) => (value && value.length < min) ? `${field} must be at least ${min} characters` : null,
  boolean: (value, field) => {
    const v = String(value).toLowerCase();
    const ok = typeof value === 'boolean' || ['true','false','1','0'].includes(v);
    return value !== undefined && !ok ? `${field} must be a boolean` : null;
  },
  integer: (value, field) => {
    const num = Number(value);
    return value !== undefined && (!Number.isInteger(num) || num <= 0) ? `${field} must be a positive integer` : null;
  }
};

// Cross-field: exactly one of hebdomadaire or mensuel must be true
const exactlyOneWeeklyOrMonthly = (req) => {
  const h = req.body?.hebdomadaire;
  const m = req.body?.mensuel;
  if (h === undefined || m === undefined) return null; // let required rules handle missing fields
  const hv = String(h).toLowerCase(); const mv = String(m).toLowerCase();
  const h1 = (h === true) || hv === 'true' || hv === '1';
  const m1 = (m === true) || mv === 'true' || mv === '1';
  return (Number(h1) + Number(m1)) !== 1 ? 'Exactly one of hebdomadaire or mensuel must be true' : null;
};

export const validateTypePeriodeCreate = createValidator({
  name: [rules.required, rules.string, rules.minLength(1), rules.maxLength(50)],
  hebdomadaire: [rules.required, rules.boolean],
  mensuel: [rules.required, rules.boolean]
}, exactlyOneWeeklyOrMonthly);

export const validateTypePeriodeUpdate = createValidator({
  name: [rules.required, rules.string, rules.minLength(1), rules.maxLength(50)],
  hebdomadaire: [rules.required, rules.boolean],
  mensuel: [rules.required, rules.boolean]
}, exactlyOneWeeklyOrMonthly);

export const validateTypePeriodeId = (req, res, next) => {
  const id = Number(req.params.id);
  if (!id || id <= 0 || !Number.isInteger(id)) {
    return res.status(400).json({ error: 'Validation failed', details: { id: 'ID must be a positive integer' } });
  }
  req.params.id = id;
  next();
};
