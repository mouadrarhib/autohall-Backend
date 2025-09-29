// src/helpers/errors.js
export class ApiError extends Error {
  constructor(status, message) {
    super(message);
    this.status = status;
  }
}

export function errorHandler(err, req, res, next) { // eslint-disable-line
  const status = err.status || 500;
  res.status(status).json({ error: err.message || 'Server error' });
}
