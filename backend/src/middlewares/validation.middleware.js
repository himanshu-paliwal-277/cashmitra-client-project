import { validationResult } from 'express-validator';

import { isValidObjectId, validatePassword } from '../utils/validation.utils.js';

export const validateRequest = (req, res, next) => {
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

export const validateObjectId = (paramName) => {
  return (req, res, next) => {
    const id = req.params[paramName];
    if (!isValidObjectId(id)) {
      return res.status(400).json({
        success: false,
        message: `Invalid ${paramName} format`,
      });
    }
    next();
  };
};

export const validateAssessmentId = (paramName) => {
  return (req, res, next) => {
    const id = req.params[paramName];

    if (isValidObjectId(id)) {
      return next();
    }

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

export const validatePasswordStrength = (req, res, next) => {
  const { password } = req.body;
  const validation = validatePassword(password);

  if (!validation.isValid) {
    return res.status(400).json({
      success: false,
      message: validation.message,
    });
  }

  next();
};

