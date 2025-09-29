// src/helpers/queryHelpers.js

/**
 * Helper utilities for processing query parameters and database results
 */

/**
 * Parse boolean values from query parameters
 * Handles various string representations of boolean values
 * @param {any} value - The value to parse
 * @returns {number|null} - 1 for true, 0 for false, null for undefined/invalid
 */
export const parseBoolean = (value) => {
  if (typeof value === 'undefined' || value === null || value === '') {
    return null;
  }
  
  const stringValue = String(value).toLowerCase().trim();
  
  // True values
  if (['1', 'true', 'yes', 'on', 'active'].includes(stringValue)) {
    return 1;
  }
  
  // False values
  if (['0', 'false', 'no', 'off', 'inactive'].includes(stringValue)) {
    return 0;
  }
  
  // Invalid/unknown values return null (no filter)
  return null;
};

/**
 * Parse integer values from query parameters with validation
 * @param {any} value - The value to parse
 * @param {number} defaultValue - Default value if parsing fails
 * @param {number} min - Minimum allowed value
 * @param {number} max - Maximum allowed value
 * @returns {number} - Parsed and validated integer
 */
export const parseInteger = (value, defaultValue = 1, min = 1, max = Number.MAX_SAFE_INTEGER) => {
  const parsed = Number(value);
  
  if (isNaN(parsed) || !Number.isInteger(parsed)) {
    return defaultValue;
  }
  
  if (parsed < min) return min;
  if (parsed > max) return max;
  
  return parsed;
};

/**
 * Parse pagination parameters from query
 * @param {Object} query - Express req.query object
 * @returns {Object} - Parsed pagination parameters
 */
export const parsePagination = (query) => {
  const page = parseInteger(query.page, 1, 1, 10000);
  const pageSize = parseInteger(query.pageSize, 50, 1, 1000);
  
  return { page, pageSize };
};

/**
 * Process paginated results from database
 * Handles both single result set (with totalCount column) and multiple result sets
 * @param {Array} rows - Database result rows
 * @param {number} page - Current page number
 * @param {number} pageSize - Items per page
 * @returns {Object} - Formatted pagination result
 */
export const processPaginatedResult = (rows, page, pageSize) => {
  let data = [];
  let totalCount = 0;

  if (!Array.isArray(rows) || rows.length === 0) {
    return {
      data: [],
      pagination: {
        page,
        pageSize,
        totalCount: 0,
        totalPages: 0,
        hasNext: false,
        hasPrevious: false
      }
    };
  }

  // Check if this is a result set with totalCount in each row
  if (rows[0] && rows[0].hasOwnProperty('totalCount')) {
    totalCount = rows[0].totalCount || 0;
    // Remove totalCount from each row for cleaner response
    data = rows.map(({ totalCount, ...row }) => row);
  } else {
    // Check if there's a separate totalCount result (multi-result set scenario)
    const totalCountIndex = rows.findIndex(row => 
      row.hasOwnProperty('totalCount') && !row.hasOwnProperty('id') && !row.hasOwnProperty('name')
    );
    
    if (totalCountIndex > -1) {
      // Split the results
      data = rows.slice(0, totalCountIndex);
      totalCount = rows[totalCountIndex].totalCount;
    } else {
      // Fallback: assume all rows are data
      data = rows;
      totalCount = rows.length;
    }
  }

  const totalPages = Math.ceil(totalCount / pageSize);

  return {
    data,
    pagination: {
      page,
      pageSize,
      totalCount,
      totalPages,
      hasNext: page < totalPages,
      hasPrevious: page > 1,
      // Additional useful pagination info
      itemsOnPage: data.length,
      firstItemNumber: totalCount > 0 ? ((page - 1) * pageSize) + 1 : 0,
      lastItemNumber: totalCount > 0 ? Math.min(page * pageSize, totalCount) : 0
    }
  };
};

/**
 * Sanitize search query parameters
 * @param {string} search - Search string from query
 * @param {number} maxLength - Maximum allowed length
 * @returns {string|null} - Sanitized search string or null
 */
export const sanitizeSearchQuery = (search, maxLength = 100) => {
  if (!search || typeof search !== 'string') {
    return null;
  }
  
  const sanitized = search.trim();
  
  if (sanitized.length === 0) {
    return null;
  }
  
  // Truncate if too long
  return sanitized.length > maxLength ? sanitized.substring(0, maxLength) : sanitized;
};

/**
 * Build common filter parameters for database queries
 * @param {Object} query - Express req.query object
 * @param {Object} options - Configuration options
 * @returns {Object} - Formatted filter parameters
 */
export const buildCommonFilters = (query, options = {}) => {
  const {
    allowActiveFilter = true,
    allowSearch = true,
    searchMaxLength = 100,
    defaultPageSize = 50,
    maxPageSize = 1000
  } = options;

  const filters = {};

  // Pagination
  const { page, pageSize } = parsePagination(query);
  filters.page = page;
  filters.pageSize = Math.min(pageSize, maxPageSize);

  // Active filter
  if (allowActiveFilter && query.hasOwnProperty('active')) {
    filters.active = parseBoolean(query.active);
  }

  // Search filter
  if (allowSearch && query.search) {
    filters.search = sanitizeSearchQuery(query.search, searchMaxLength);
  }

  return filters;
};

/**
 * Create a standardized error response for invalid query parameters
 * @param {string} parameter - The parameter name that failed validation
 * @param {string} message - Error message
 * @returns {Object} - Error response object
 */
export const createQueryValidationError = (parameter, message) => {
  return {
    error: 'Invalid query parameter',
    details: {
      [parameter]: message
    }
  };
};
