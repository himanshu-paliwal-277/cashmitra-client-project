const {
  generateCSRFToken,
  validateCSRFToken,
} = require('../utils/security.utils');

/**
 * Middleware to generate CSRF token and set it in the response
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next middleware function
 */
const generateToken = (req, res, next) => {
  // Generate a new CSRF token
  const csrfToken = generateCSRFToken();

  // Store the token in the session
  req.session.csrfToken = csrfToken;

  // Set the token in the response headers
  res.setHeader('X-CSRF-Token', csrfToken);

  next();
};

/**
 * Middleware to validate CSRF token in the request
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next middleware function
 * @returns {Object} - Returns error response if validation fails
 */
const validateToken = (req, res, next) => {
  // Skip validation for GET, HEAD, OPTIONS requests
  if (['GET', 'HEAD', 'OPTIONS'].includes(req.method)) {
    return next();
  }

  // Skip validation if skipCSRF flag is set
  if (req.skipCSRF) {
    return next();
  }

  // Get the token from the request headers or body
  const token = req.headers['x-csrf-token'] || req.body._csrf;

  // Get the stored token from the session
  const storedToken = req.session?.csrfToken;

  // Validate the token
  if (!validateCSRFToken(token, storedToken)) {
    return res.status(403).json({
      success: false,
      message: 'Invalid or missing CSRF token',
    });
  }

  next();
};

module.exports = {
  generateToken,
  validateToken,
};
