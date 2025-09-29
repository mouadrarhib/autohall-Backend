// src/helpers/databaseHelpers.js

/**
 * Database utility functions for common operations
 */

/**
 * Extract the first result from database operation
 * @param {Array} rows - Database result rows
 * @returns {Object|null} - First row or null if empty
 */
export const getFirstResult = (rows) => {
  if (!Array.isArray(rows) || rows.length === 0) {
    return null;
  }
  return rows[0];
};

/**
 * Check if a database operation returned any results
 * @param {Array} rows - Database result rows
 * @returns {boolean} - True if results exist
 */
export const hasResults = (rows) => {
  return Array.isArray(rows) && rows.length > 0;
};

/**
 * Extract specific field values from result rows
 * @param {Array} rows - Database result rows
 * @param {string} fieldName - Field name to extract
 * @returns {Array} - Array of field values
 */
export const extractField = (rows, fieldName) => {
  if (!Array.isArray(rows)) {
    return [];
  }
  
  return rows
    .filter(row => row && row.hasOwnProperty(fieldName))
    .map(row => row[fieldName]);
};

/**
 * Group database results by a specific field
 * @param {Array} rows - Database result rows
 * @param {string} groupByField - Field to group by
 * @returns {Object} - Grouped results
 */
export const groupResults = (rows, groupByField) => {
  if (!Array.isArray(rows)) {
    return {};
  }

  return rows.reduce((groups, row) => {
    const key = row[groupByField];
    if (!groups[key]) {
      groups[key] = [];
    }
    groups[key].push(row);
    return groups;
  }, {});
};

/**
 * Convert database boolean values to JavaScript booleans
 * @param {any} value - Database boolean value (0/1, true/false, etc.)
 * @returns {boolean} - JavaScript boolean
 */
export const convertDbBoolean = (value) => {
  if (typeof value === 'boolean') {
    return value;
  }
  
  if (typeof value === 'number') {
    return value === 1;
  }
  
  if (typeof value === 'string') {
    return ['1', 'true', 'yes'].includes(value.toLowerCase());
  }
  
  return false;
};

/**
 * Prepare parameters for stored procedure execution
 * @param {Object} params - Parameters object
 * @param {Object} defaults - Default values
 * @returns {Object} - Processed parameters
 */
export const prepareStoredProcParams = (params, defaults = {}) => {
  const prepared = { ...defaults, ...params };
  
  // Convert undefined values to null for SQL Server compatibility
  Object.keys(prepared).forEach(key => {
    if (prepared[key] === undefined) {
      prepared[key] = null;
    }
  });
  
  return prepared;
};
