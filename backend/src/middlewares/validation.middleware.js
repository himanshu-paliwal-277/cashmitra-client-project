import { isValidObjectId } from '../utils/validation.utils.js';

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
