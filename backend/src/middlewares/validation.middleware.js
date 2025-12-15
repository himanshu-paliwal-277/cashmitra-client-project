import {validationResult} from 'express-validator';
import validationUtils from '../utils/validation.utils';

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

const validateAssessmentId = (paramName) => {
  return (req, res, next) => {
    const id = req.params[paramName];

    if (validationUtils.isValidObjectId(id)) {
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

export default {
  validateRequest,
  validateObjectId,
  validateAssessmentId,
  validatePasswordStrength,
};
