// src/middlewares/periode/validateInput.js

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
    next();
  };
};

const rules = {
  positiveInt: (value, field) => {
    if (value === undefined || value === null || value === '') return null;
    const num = Number(value);
    return (!Number.isInteger(num) || num <= 0) ? `${field} must be a positive integer` : null;
  },
  string: (value, field) => {
    if (value === undefined || value === null || value === '') return null;
    return typeof value !== 'string' ? `${field} must be a string` : null;
  },
  monthInRange: (value, field) => {
    if (value === undefined || value === null || value === '') return null;
    const num = Number(value);
    return (num < 1 || num > 12) ? `${field} must be between 1 and 12` : null;
  },
  integer: (value, field) => {
    if (value === undefined || value === null || value === '') return null;
    const num = Number(value);
    return (!Number.isInteger(num)) ? `${field} must be an integer` : null;
  },
  boolean: (value, field) => {
    if (value === undefined || value === null || value === '') return null;
    const s = String(value).toLowerCase();
    const ok = (value === true || value === false || s === 'true' || s === 'false' || s === '1' || s === '0');
    return !ok ? `${field} must be a boolean` : null;
  }
};

const startedBeforeOrEqualEnd = (req) => {
  const s = req.body?.startedDate, e = req.body?.endDate;
  if (!s || !e) return null;
  const sd = new Date(s), ed = new Date(e);
  return sd > ed ? 'startedDate must be <= endDate' : null;
};

export const validatePeriodeCreate = createValidator({
  year: [rules.required, rules.integer],
  month: [rules.required, rules.integer, rules.monthInRange],
  week: [rules.required, rules.nonNegativeInt],
  startedDate: [rules.required, rules.isoDate],
  endDate: [rules.required, rules.isoDate],
  typePeriodeId: [rules.positiveInt]
}, startedBeforeOrEqualEnd);

export const validatePeriodeUpdate = createValidator({
  year: [rules.required, rules.integer],
  month: [rules.required, rules.integer, rules.monthInRange],
  week: [rules.required, rules.nonNegativeInt],
  startedDate: [rules.required, rules.isoDate],
  endDate: [rules.required, rules.isoDate],
  typePeriodeId: [rules.positiveInt]
}, startedBeforeOrEqualEnd);

export const validatePeriodeId = (req, res, next) => {
  const id = Number(req.params.id);
  if (!Number.isInteger(id) || id <= 0) {
    return res.status(400).json({ error: 'Validation failed', details: { id: 'ID must be a positive integer' } });
  }
  req.params.id = id;
  next();
};

// Cross-field: must provide one of (id) or (name) or exactly one flag
const requireSelector = (req) => {
  const id = req.query?.typePeriodeId;
  const name = req.query?.typePeriodeName && String(req.query.typePeriodeName).trim();
  const h = req.query?.hebdomadaire;
  const m = req.query?.mensuel;

  const hasId = id !== undefined && id !== null && id !== '';
  const hasName = !!name;
  const hasH = h !== undefined && h !== null && h !== '';
  const hasM = m !== undefined && m !== null && m !== '';

  if (hasId || hasName) return null;

  if (!hasH && !hasM) {
    return 'Provide typePeriodeId or typePeriodeName or exactly one of hebdomadaire/mensuel';
  }
  const h1 = String(h).toLowerCase(); const m1 = String(m).toLowerCase();
  const hBit = (h === true || h1 === 'true' || h1 === '1') ? 1 : 0;
  const mBit = (m === true || m1 === 'true' || m1 === '1') ? 1 : 0;
  return (hBit + mBit) !== 1 ? 'Provide exactly one of hebdomadaire or mensuel' : null;
};

export const validatePeriodeListByType = createValidator({
  typePeriodeId: [rules.positiveInt],
  typePeriodeName: [rules.string],
  hebdomadaire: [rules.boolean],
  mensuel: [rules.boolean],
  year: [rules.integer],
  month: [rules.integer, rules.monthInRange],
}, requireSelector);

export const validatePeriodeYearParam = (req, res, next) => {
  const year = Number(req.params.year);
  if (!Number.isInteger(year)) {
    return res.status(400).json({
      error: 'Validation failed',
      details: { year: 'year must be an integer' }
    });
  }
  req.params.year = year;
  next();
};
