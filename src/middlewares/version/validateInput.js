// src/middlewares/version/validateInput.js

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

    if (req.body?.name && typeof req.body.name === 'string') {
      req.body.name = req.body.name.trim();
    }

    next();
  };
};

const rules = {
  required: (value, field) =>
    (value === undefined || value === null || value === '')
      ? `${field} is required`
      : null,
  string: (value, field) =>
    value !== undefined && value !== null && typeof value !== 'string'
      ? `${field} must be a string`
      : null,
  maxLength: (max) => (value, field) =>
    value && value.length > max ? `${field} must be ${max} characters or less` : null,
  positiveInt: (value, field) => {
    if (value === undefined || value === null || value === '') return null;
    const num = Number(value);
    return (!Number.isInteger(num) || num < 0)
      ? `${field} must be a non-negative integer`
      : null;
  },
  decimal: (value, field) => {
    if (value === undefined || value === null || value === '') return null;
    const num = Number(value);
    return Number.isNaN(num) || num < 0
      ? `${field} must be a non-negative number`
      : null;
  },
  maxDecimal: (max) => (value, field) => {
    if (value === undefined || value === null || value === '') return null;
    const num = Number(value);
    return num > max
      ? `${field} must be <= ${max}`
      : null;
  }
};

export const validateVersionCreate = createValidator({
  name: [rules.required, rules.string, rules.maxLength(255)],
  idModele: [rules.required, rules.positiveInt],
  volume: [rules.required, rules.positiveInt],
  salePrice: [rules.required, rules.decimal],
  tmDirect: [rules.required, rules.decimal, rules.maxDecimal(1)],
  margeInterGroupe: [rules.required, rules.decimal, rules.maxDecimal(1)]
});

export const validateVersionUpdate = createValidator({
  name: [rules.string, rules.maxLength(255)],
  idModele: [rules.positiveInt],
  volume: [rules.positiveInt],
  salePrice: [rules.decimal],
  tmDirect: [rules.decimal, rules.maxDecimal(1)],
  margeInterGroupe: [rules.decimal, rules.maxDecimal(1)]
});

export const validateVersionId = (req, res, next) => {
  const id = Number(req.params.id);
  if (!id || id <= 0 || !Number.isInteger(id)) {
    return res.status(400).json({
      error: 'Validation failed',
      details: { id: 'Version ID must be a positive integer' }
    });
  }
  req.params.id = id;
  next();
};

export const validateVersionQuery = (req, res, next) => {
  const { idModele, onlyActive } = req.query;
  const errors = {};

  if (idModele !== undefined) {
    const modeleNum = Number(idModele);
    if (!Number.isInteger(modeleNum) || modeleNum <= 0) {
      errors.idModele = 'Modele ID must be a positive integer';
    } else {
      req.query.idModele = modeleNum;
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
