// validateInput.js - Updated for auth service

// Helper function to create validation middleware
const createValidator = (validationRules) => {
  return (req, res, next) => {
    const errors = {};
    for (const [field, rules] of Object.entries(validationRules)) {
      let value = req.body?.[field] ?? req.params?.[field] ?? req.query?.[field];

      // Trim string values
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

    // Normalize data - trim username and email if they exist in body
    if (req.body?.username && typeof req.body.username === "string") {
      req.body.username = req.body.username.trim();
    }
    if (req.body?.email && typeof req.body.email === "string") {
      req.body.email = req.body.email.trim().toLowerCase();
    }

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
  email: (value, field) => {
    if (!value) return null;
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return !emailRegex.test(value) ? `${field} must be a valid email address` : null;
  },
  username: (value, field) => {
    if (!value) return null;
    const usernameRegex = /^[a-zA-Z0-9_.-]+$/;
    return !usernameRegex.test(value) ? `${field} can only contain letters, numbers, dots, hyphens, and underscores` : null;
  },
  password: (value, field) => {
    if (!value) return null;
    // Password should be at least 8 characters with at least one letter and one number
    const passwordRegex = /^(?=.*[A-Za-z])(?=.*\d).{8,}$/;
    return !passwordRegex.test(value) ? `${field} must be at least 8 characters long and contain at least one letter and one number` : null;
  },
  integer: (value, field) => {
    const num = Number(value);
    if (value !== undefined && (!Number.isInteger(num) || num <= 0)) {
      return `${field} must be a positive integer`;
    }
    return null;
  },
};

// Auth-specific validators
export const validateUserRegistration = createValidator({
  username: [rules.required, rules.string, rules.minLength(3), rules.maxLength(50), rules.username],
  email: [rules.required, rules.string, rules.maxLength(255), rules.email],
  password: [rules.required, rules.string, rules.minLength(8), rules.maxLength(128), rules.password],
});

export const validateUserLogin = createValidator({
  username: [rules.required, rules.string, rules.minLength(3), rules.maxLength(50), rules.username],
  password: [rules.required, rules.string, rules.minLength(1), rules.maxLength(128)],
});

export const validateUserLoginByUsername = createValidator({
  username: [rules.required, rules.string, rules.minLength(3), rules.maxLength(50), rules.username],
  password: [rules.required, rules.string, rules.minLength(1), rules.maxLength(128)],
});

export const validateEmailParam = createValidator({
  email: [rules.required, rules.string, rules.maxLength(255), rules.email],
});

export const validateUsernameParam = createValidator({
  username: [rules.required, rules.string, rules.minLength(3), rules.maxLength(50), rules.username],
});

export const validatePasswordCheck = createValidator({
  inputPassword: [rules.required, rules.string, rules.minLength(1), rules.maxLength(128)],
  hashedPasswordOrLegacy: [rules.required, rules.string],
});

// Validate user ID route parameter
export const validateUserId = (req, res, next) => {
  const id = Number(req.params.id);
  if (!id || !Number.isInteger(id) || id <= 0) {
    return res.status(400).json({ 
      error: "Validation failed", 
      details: { id: "User ID must be a positive integer" } 
    });
  }
  req.params.id = id;
  next();
};

// Validate email route parameter
export const validateEmailRouteParam = (req, res, next) => {
  const email = req.params.email?.toString().trim().toLowerCase();
  if (!email) {
    return res.status(400).json({ 
      error: "Validation failed", 
      details: { email: "Email is required" } 
    });
  }
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    return res.status(400).json({ 
      error: "Validation failed", 
      details: { email: "Email must be a valid email address" } 
    });
  }
  if (email.length > 255) {
    return res.status(400).json({ 
      error: "Validation failed", 
      details: { email: "Email must be 255 characters or less" } 
    });
  }
  req.params.email = email;
  next();
};

// Validate username route parameter
export const validateUsernameRouteParam = (req, res, next) => {
  const username = req.params.username?.toString().trim();
  if (!username) {
    return res.status(400).json({ 
      error: "Validation failed", 
      details: { username: "Username is required" } 
    });
  }
  const usernameRegex = /^[a-zA-Z0-9_.-]+$/;
  if (!usernameRegex.test(username)) {
    return res.status(400).json({ 
      error: "Validation failed", 
      details: { username: "Username can only contain letters, numbers, dots, hyphens, and underscores" } 
    });
  }
  if (username.length < 3 || username.length > 50) {
    return res.status(400).json({ 
      error: "Validation failed", 
      details: { username: "Username must be between 3 and 50 characters" } 
    });
  }
  req.params.username = username;
  next();
};

export const validateUserCompleteCreation = createValidator({
    full_name: [rules.required, rules.string, rules.minLength(2), rules.maxLength(255)],
    username: [rules.required, rules.string, rules.minLength(3), rules.maxLength(50), rules.username],
    email: [rules.required, rules.string, rules.maxLength(255), rules.email],
    password: [rules.required, rules.string, rules.minLength(8), rules.maxLength(128), rules.password],
    groupement_name: [rules.required, rules.string],
    site_id: [rules.required, rules.integer],
});

// User update validation
export const validateUserUpdate = createValidator({
  fullName: [rules.string, rules.minLength(2), rules.maxLength(255)],
  email: [rules.string, rules.maxLength(255), rules.email],
  username: [rules.string, rules.minLength(3), rules.maxLength(50), rules.username],
  idUserSite: [rules.integer],
});

// Password update validation
export const validatePasswordUpdate = createValidator({
  newPassword: [rules.required, rules.string, rules.minLength(8), rules.maxLength(128), rules.password],
});

// User site update validation
export const validateUserSiteUpdate = createValidator({
  idUserSite: [rules.required, rules.integer],
});

