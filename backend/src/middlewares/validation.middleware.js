const { validationResult } = require('express-validator');
const validationUtils = require('../utils/validation.utils');

/**
 * Middleware to validate request data using express-validator
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next middleware function
 * @returns {Object} - Returns error response if validation fails
 */
const validateRequest = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      errors: errors.array().map((error) => ({
        field: error.param,
        message: error.msg,
      })),
    });
  }
  next();
};

/**
 * Middleware to validate MongoDB ObjectId parameters
 * @param {String} paramName - The parameter name to validate
 * @returns {Function} - Express middleware function
 */
const validateObjectId = (paramName) => {
  return (req, res, next) => {
    const id = req.params[paramName];
    if (!validationUtils.isValidObjectId(id)) {
      return res.status(400).json({
        success: false,
        message: `Invalid ${paramName} format`,
      });
    }
    next();
  };
};

/**
 * Middleware to validate assessmentId parameters (accepts both ObjectId and custom assessment format)
 * @param {String} paramName - The parameter name to validate
 * @returns {Function} - Express middleware function
 */
const validateAssessmentId = (paramName) => {
  return (req, res, next) => {
    const id = req.params[paramName];

    // Check if it's a valid ObjectId
    if (validationUtils.isValidObjectId(id)) {
      return next();
    }

    // Check if it's a valid custom assessment format: assessment_timestamp_randomstring
    const assessmentPattern = /^assessment_\d+_[a-zA-Z0-9]+$/;
    if (assessmentPattern.test(id)) {
      return next();
    }

    return res.status(400).json({
      success: false,
      message: `Invalid ${paramName} format`,
    });
  };
};

/**
 * Middleware to validate password strength
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next middleware function
 * @returns {Object} - Returns error response if validation fails
 */
const validatePasswordStrength = (req, res, next) => {
  const { password } = req.body;
  const validation = validationUtils.validatePassword(password);

  if (!validation.isValid) {
    return res.status(400).json({
      success: false,
      message: validation.message,
    });
  }

  next();
};

module.exports = {
  validateRequest,
  validateObjectId,
  validateAssessmentId,
  validatePasswordStrength,
};
