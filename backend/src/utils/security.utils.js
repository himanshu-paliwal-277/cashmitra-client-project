const xss = require('xss');
const crypto = require('crypto');

/**
 * Sanitize user input to prevent XSS attacks
 * @param {Object|String} data - Data to sanitize
 * @returns {Object|String} - Sanitized data
 */
const sanitizeData = (data) => {
  if (typeof data === 'string') {
    return xss(data);
  }
  
  if (Array.isArray(data)) {
    return data.map(item => sanitizeData(item));
  }
  
  if (typeof data === 'object' && data !== null) {
    const sanitized = {};
    for (const [key, value] of Object.entries(data)) {
      sanitized[key] = sanitizeData(value);
    }
    return sanitized;
  }
  
  return data;
};

/**
 * Generate a secure random token
 * @param {Number} bytes - Number of bytes for the token
 * @returns {String} - Hex string token
 */
const generateSecureToken = (bytes = 32) => {
  return crypto.randomBytes(bytes).toString('hex');
};

/**
 * Hash a string using SHA-256
 * @param {String} data - Data to hash
 * @returns {String} - Hashed data
 */
const hashData = (data) => {
  return crypto.createHash('sha256').update(data).digest('hex');
};

/**
 * Create a CSRF token
 * @returns {String} - CSRF token
 */
const generateCSRFToken = () => {
  return generateSecureToken();
};

/**
 * Validate CSRF token
 * @param {String} token - Token to validate
 * @param {String} storedToken - Stored token to compare against
 * @returns {Boolean} - Whether the token is valid
 */
const validateCSRFToken = (token, storedToken) => {
  if (!token || !storedToken) {
    return false;
  }
  return token === storedToken;
};

module.exports = {
  sanitizeData,
  generateSecureToken,
  hashData,
  generateCSRFToken,
  validateCSRFToken
};