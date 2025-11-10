// src/middlewares/ventes/validateInput.js

const createValidator = (validationRules, extraCrossCheck) => {
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
  required: (value, field) => {
    return (value === undefined || value === null || value === '') 
      ? `${field} is required` 
      : null;
  },
  
  positiveInt: (value, field) => {
    // Allow null/undefined for optional fields
    if (value === undefined || value === null || value === '') return null;
    const num = Number(value);
    return (!Number.isInteger(num) || num <= 0) 
      ? `${field} must be a positive integer` 
      : null;
  },
  
  decimal: (value, field) => {
    // Allow null/undefined for optional fields
    if (value === undefined || value === null || value === '') return null;
    const num = Number(value);
    return Number.isNaN(num) 
      ? `${field} must be a number` 
      : null;
  },
  
  year: (value, field) => {
    // Required field should be caught by 'required' rule first
    if (value === undefined || value === null || value === '') return null;
    const num = Number(value);
    return (num < 2000 || num > 2100) 
      ? `${field} must be between 2000 and 2100` 
      : null;
  },
  
  month: (value, field) => {
    // Required field should be caught by 'required' rule first
    if (value === undefined || value === null || value === '') return null;
    const num = Number(value);
    return (num < 1 || num > 12) 
      ? `${field} must be between 1 and 12` 
      : null;
  },
  
  positiveDecimal: (value, field) => {
    // Required field should be caught by 'required' rule first
    if (value === undefined || value === null || value === '') return null;
    const num = Number(value);
    return (Number.isNaN(num) || num <= 0) 
      ? `${field} must be a positive number` 
      : null;
  },
  
  nonNegativeDecimal: (value, field) => {
    // Allow null/undefined for optional fields
    if (value === undefined || value === null || value === '') return null;
    const num = Number(value);
    return (Number.isNaN(num) || num < 0) 
      ? `${field} must be a non-negative number` 
      : null;
  },
  
  percentageRange: (value, field) => {
    // Allow null/undefined for optional fields
    if (value === undefined || value === null || value === '') return null;
    const num = Number(value);
    return (Number.isNaN(num) || num < -100 || num > 100) 
      ? `${field} must be between -100 and 100` 
      : null;
  }
};

// Cross check: at least one location (filiale or succursale)
const requireLocation = (req) => {
  const { idFiliale, idSuccursale } = req.body || {};
  // Check if both are missing or falsy (but allow 0 as valid ID)
  const hasFiliale = idFiliale !== undefined && idFiliale !== null && idFiliale !== '';
  const hasSuccursale = idSuccursale !== undefined && idSuccursale !== null && idSuccursale !== '';
  
  if (!hasFiliale && !hasSuccursale) {
    return 'Provide at least one of idFiliale or idSuccursale';
  }
  return null;
};

// Cross check: at least one vehicle level (marque, modele, or version)
const requireVehicleLevel = (req) => {
  const { idMarque, idModele, idVersion } = req.body || {};
  // Check if all are missing or falsy (but allow 0 as valid ID)
  const hasMarque = idMarque !== undefined && idMarque !== null && idMarque !== '';
  const hasModele = idModele !== undefined && idModele !== null && idModele !== '';
  const hasVersion = idVersion !== undefined && idVersion !== null && idVersion !== '';
  
  if (!hasMarque && !hasModele && !hasVersion) {
    return 'Provide at least one of idMarque, idModele, or idVersion';
  }
  return null;
};

// Combined cross check
const requireLocationAndVehicle = (req) => {
  return requireLocation(req) || requireVehicleLevel(req);
};

export const validateVenteCreate = createValidator({
  idTypeVente: [rules.required, rules.positiveInt],
  // Optional location fields (but at least one required via cross-check)
  idFiliale: [rules.positiveInt],
  idSuccursale: [rules.positiveInt],
  // Optional vehicle fields (but at least one required via cross-check)
  idMarque: [rules.positiveInt],
  idModele: [rules.positiveInt],
  idVersion: [rules.positiveInt],
  // Required financial fields
  prixVente: [rules.required, rules.positiveDecimal],
  chiffreAffaires: [rules.required, rules.nonNegativeDecimal],
  // Optional financial fields
  marge: [rules.decimal],
  margePercentage: [rules.decimal, rules.percentageRange],
  // Required volume
  volume: [rules.required, rules.positiveInt],
  // Required date fields
  venteYear: [rules.required, rules.year],
  venteMonth: [rules.required, rules.month]
}, requireLocationAndVehicle);

export const validateVenteUpdate = createValidator({
  idTypeVente: [rules.required, rules.positiveInt],
  // Optional location fields (but at least one required via cross-check)
  idFiliale: [rules.positiveInt],
  idSuccursale: [rules.positiveInt],
  // Optional vehicle fields (but at least one required via cross-check)
  idMarque: [rules.positiveInt],
  idModele: [rules.positiveInt],
  idVersion: [rules.positiveInt],
  // Required financial fields
  prixVente: [rules.required, rules.positiveDecimal],
  chiffreAffaires: [rules.required, rules.nonNegativeDecimal],
  // Optional financial fields
  marge: [rules.decimal],
  margePercentage: [rules.decimal, rules.percentageRange],
  // Required volume
  volume: [rules.required, rules.positiveInt],
  // Required date fields
  venteYear: [rules.required, rules.year],
  venteMonth: [rules.required, rules.month]
}, requireLocationAndVehicle);

export const validateVenteId = (req, res, next) => {
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
