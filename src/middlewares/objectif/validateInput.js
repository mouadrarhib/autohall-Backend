// src/middlewares/objectif/validateInput.js

const createValidator = (validationRules, extraCrossCheck) => {
  return (req, res, next) => {
    const errors = {};
    for (const [field, rules] of Object.entries(validationRules)) {
      let value = req.body?.[field] ?? req.params?.[field] ?? req.query?.[field];
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
    next();
  };
};

const rules = {
  required: (value, field) => (value === undefined || value === null || value === '') ? `${field} is required` : null,
  positiveInt: (value, field) => {
    if (value === undefined || value === null || value === '') return null;
    const num = Number(value);
    return (!Number.isInteger(num) || num <= 0) ? `${field} must be a positive integer` : null;
  },
  decimal: (value, field) => {
    if (value === undefined || value === null || value === '') return null;
    const num = Number(value);
    return Number.isNaN(num) ? `${field} must be a number` : null;
  },
  maxDecimal: (max) => (value, field) => {
    if (value === undefined || value === null || value === '') return null;
    const num = Number(value);
    return num > max ? `${field} must be <= ${max}` : null;
  }
};

// Cross check: at least one product level
const requireProductLevel = (req) => {
  const { marqueId, modeleId, versionId } = req.body || {};
  if (!marqueId && !modeleId && !versionId) {
    return 'Provide at least one of marqueId, modeleId, or versionId';
  }
  return null;
};

export const validateObjectifCreate = createValidator({
  userId: [rules.required, rules.positiveInt],
  groupementId: [rules.required, rules.positiveInt],
  siteId: [rules.required, rules.positiveInt],
  periodeId: [rules.required, rules.positiveInt],
  typeVenteId: [rules.required, rules.positiveInt],
  typeObjectifId: [rules.required, rules.positiveInt],
  marqueId: [rules.positiveInt],
  modeleId: [rules.positiveInt],
  versionId: [rules.positiveInt],
  volume: [rules.required, rules.positiveInt],
  SalePrice: [rules.required, rules.decimal],
  TMDirect: [rules.required, rules.decimal, rules.maxDecimal(0.40)],
  MargeInterGroupe: [rules.required, rules.decimal, rules.maxDecimal(0.40)]
}, requireProductLevel);

export const validateObjectifUpdate = createValidator({
  userId: [rules.required, rules.positiveInt],
  groupementId: [rules.required, rules.positiveInt],
  siteId: [rules.required, rules.positiveInt],
  periodeId: [rules.required, rules.positiveInt],
  typeVenteId: [rules.required, rules.positiveInt],
  typeObjectifId: [rules.required, rules.positiveInt],
  marqueId: [rules.positiveInt],
  modeleId: [rules.positiveInt],
  versionId: [rules.positiveInt],
  volume: [rules.required, rules.positiveInt],
  SalePrice: [rules.required, rules.decimal],
  TMDirect: [rules.required, rules.decimal, rules.maxDecimal(0.40)],
  MargeInterGroupe: [rules.required, rules.decimal, rules.maxDecimal(0.40)]
}, requireProductLevel);

export const validateObjectifId = (req, res, next) => {
  const id = Number(req.params.id);
  if (!id || id <= 0 || !Number.isInteger(id)) {
    return res.status(400).json({ error: 'Validation failed', details: { id: 'ID must be a positive integer' } });
  }
  req.params.id = id;
  next();
};
