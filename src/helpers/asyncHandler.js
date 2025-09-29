// src/helpers/asyncHandler.js

/**
 * Wraps an async Express route handler so errors
 * automatically propagate to Express error middleware.
 *
 * Usage:
 *   router.get('/users', asyncHandler(async (req, res) => {
 *     const users = await User.findAll();
 *     res.json(users);
 *   }));
 */
export const asyncHandler = (fn) => (req, res, next) => {
  Promise.resolve(fn(req, res, next)).catch(next);
};
