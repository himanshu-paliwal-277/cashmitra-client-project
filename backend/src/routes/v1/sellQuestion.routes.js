import express from 'express';
import { body, param, query } from 'express-validator';

import {
  addOption,
  createQuestion,
  deleteOption,
  deleteQuestion,
  getCustomerQuestions,
  getQuestion,
  getQuestions,
  reorderQuestions,
  updateOption,
  updateQuestion,
} from '../../controllers/sellQuestion.controller.js';
import {
  authorize,
  isAuthenticated,
} from '../../middlewares/auth.middleware.js';

const router = express.Router();

const questionValidation = [
  body('categoryId')
    .isMongoId()
    .withMessage('Category ID must be a valid MongoDB ObjectId'),
  body('variantIds')
    .optional()
    .isArray()
    .withMessage('Variant IDs must be an array'),
  body('variantIds.*')
    .optional()
    .isMongoId()
    .withMessage('Each variant ID must be a valid MongoDB ObjectId'),
  body('section')
    .trim()
    .isLength({ min: 1, max: 100 })
    .withMessage('Section must be between 1 and 100 characters'),
  body('order')
    .optional()
    .isInt({ min: 0 })
    .withMessage('Order must be a non-negative integer'),
  body('key')
    .trim()
    .isLength({ min: 1, max: 100 })
    .withMessage('Key must be between 1 and 100 characters')
    .matches(/^[a-z0-9_]+$/)
    .withMessage(
      'Key must contain only lowercase letters, numbers, and underscores'
    ),
  body('title')
    .trim()
    .isLength({ min: 1, max: 200 })
    .withMessage('Title must be between 1 and 200 characters'),
  body('description')
    .optional()
    .trim()
    .isLength({ max: 500 })
    .withMessage('Description cannot exceed 500 characters'),
  body('uiType')
    .isIn(['radio', 'checkbox', 'select', 'multiselect', 'slider', 'toggle'])
    .withMessage(
      'UI type must be one of: radio, checkbox, select, multiselect, slider, toggle'
    ),
  body('multiSelect')
    .optional()
    .isBoolean()
    .withMessage('multiSelect must be a boolean'),
  body('required')
    .optional()
    .isBoolean()
    .withMessage('required must be a boolean'),
  body('showIf').optional().isObject().withMessage('showIf must be an object'),
  body('showIf.questionKey')
    .optional()
    .trim()
    .isLength({ min: 1 })
    .withMessage('showIf questionKey is required'),
  body('showIf.value')
    .optional()
    .notEmpty()
    .withMessage('showIf value is required'),
  body('options').optional().isArray().withMessage('Options must be an array'),
  body('options.*.key')
    .optional()
    .trim()
    .isLength({ min: 1, max: 100 })
    .withMessage('Option key must be between 1 and 100 characters'),
  body('options.*.label')
    .optional()
    .trim()
    .isLength({ min: 1, max: 200 })
    .withMessage('Option label must be between 1 and 200 characters'),
  body('options.*.value')
    .optional()
    .notEmpty()
    .withMessage('Option value is required'),
  body('options.*.delta')
    .optional()
    .isObject()
    .withMessage('Option delta must be an object'),
  body('options.*.delta.type')
    .optional()
    .isIn(['abs', 'percent'])
    .withMessage('Delta type must be either abs or percent'),
  body('options.*.delta.sign')
    .optional()
    .isIn(['+', '-'])
    .withMessage('Delta sign must be either + or -'),
  body('options.*.delta.value')
    .optional()
    .isNumeric({ min: 0 })
    .withMessage('Delta value must be a non-negative number'),
  body('options.*.showIf')
    .optional()
    .isObject()
    .withMessage('Option showIf must be an object'),
  body('isActive')
    .optional()
    .isBoolean()
    .withMessage('isActive must be a boolean'),
];

const optionValidation = [
  body('key')
    .trim()
    .isLength({ min: 1, max: 100 })
    .withMessage('Key must be between 1 and 100 characters'),
  body('label')
    .trim()
    .isLength({ min: 1, max: 200 })
    .withMessage('Label must be between 1 and 200 characters'),
  body('value').notEmpty().withMessage('Value is required'),
  body('delta').optional().isObject().withMessage('Delta must be an object'),
  body('delta.type')
    .optional()
    .isIn(['abs', 'percent'])
    .withMessage('Delta type must be either abs or percent'),
  body('delta.sign')
    .optional()
    .isIn(['+', '-'])
    .withMessage('Delta sign must be either + or -'),
  body('delta.value')
    .optional()
    .isNumeric({ min: 0 })
    .withMessage('Delta value must be a non-negative number'),
  body('showIf').optional().isObject().withMessage('showIf must be an object'),
];

router.get(
  '/customer',
  query('productId')
    .isMongoId()
    .withMessage('Product ID must be a valid MongoDB ObjectId'),
  query('variantId')
    .optional()
    .isMongoId()
    .withMessage('Variant ID must be a valid MongoDB ObjectId'),
  getCustomerQuestions
);

router.use(isAuthenticated);
router.use(authorize('admin'));

router.put(
  '/reorder',
  body('categoryId')
    .optional()
    .isMongoId()
    .withMessage('Category ID must be a valid MongoDB ObjectId'),
  body('section').notEmpty().withMessage('Section is required'),
  body('questionIds')
    .isArray({ min: 1 })
    .withMessage('Question IDs array is required'),
  body('questionIds.*')
    .isMongoId()
    .withMessage('Each question ID must be a valid MongoDB ObjectId'),
  reorderQuestions
);

router.post('/', questionValidation, createQuestion);
router.get('/', getQuestions);
router.get(
  '/:id',
  param('id')
    .isMongoId()
    .withMessage('Question ID must be a valid MongoDB ObjectId'),
  getQuestion
);
router.put(
  '/:id',
  param('id')
    .isMongoId()
    .withMessage('Question ID must be a valid MongoDB ObjectId'),
  updateQuestion
);
router.delete(
  '/:id',
  param('id')
    .isMongoId()
    .withMessage('Question ID must be a valid MongoDB ObjectId'),
  deleteQuestion
);

router.post(
  '/:id/options',
  param('id')
    .isMongoId()
    .withMessage('Question ID must be a valid MongoDB ObjectId'),
  optionValidation,
  addOption
);
router.put(
  '/:id/options/:optionId',
  param('id')
    .isMongoId()
    .withMessage('Question ID must be a valid MongoDB ObjectId'),
  param('optionId')
    .isMongoId()
    .withMessage('Option ID must be a valid MongoDB ObjectId'),
  optionValidation,
  updateOption
);
router.delete(
  '/:id/options/:optionId',
  param('id')
    .isMongoId()
    .withMessage('Question ID must be a valid MongoDB ObjectId'),
  param('optionId')
    .isMongoId()
    .withMessage('Option ID must be a valid MongoDB ObjectId'),
  deleteOption
);

export default router;
