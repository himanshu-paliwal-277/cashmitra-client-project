import express from 'express';
import { body, param, query } from 'express-validator';

import {
  bulkCreateAccessories,
  createAccessory,
  deleteAccessory,
  getAccessories,
  getAccessory,
  getCustomerAccessories,
  reorderAccessories,
  toggleAccessoryStatus,
  updateAccessory,
} from '../../controllers/sellAccessory.controller';
import { authorize, protect } from '../../middlewares/auth.middleware';

const router = express.Router();

const createAccessoryValidation = [
  body('categoryId')
    .isMongoId()
    .withMessage('Category ID must be a valid MongoDB ObjectId'),
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
  body('delta.type')
    .isIn(['abs', 'percent'])
    .withMessage('Delta type must be either abs or percent'),
  body('delta.sign')
    .isIn(['+', '-'])
    .withMessage('Delta sign must be either + or -'),
  body('delta.value')
    .isNumeric({ min: 0 })
    .withMessage('Delta value must be a non-negative number'),
  body('order')
    .optional()
    .isInt({ min: 0 })
    .withMessage('Order must be a non-negative integer'),
  body('isActive')
    .optional()
    .isBoolean()
    .withMessage('isActive must be a boolean'),
];

const updateAccessoryValidation = [
  body('categoryId')
    .optional()
    .isMongoId()
    .withMessage('Category ID must be a valid MongoDB ObjectId'),
  body('key')
    .optional()
    .trim()
    .isLength({ min: 1, max: 100 })
    .withMessage('Key must be between 1 and 100 characters')
    .matches(/^[a-z0-9_]+$/)
    .withMessage(
      'Key must contain only lowercase letters, numbers, and underscores'
    ),
  body('title')
    .optional()
    .trim()
    .isLength({ min: 1, max: 200 })
    .withMessage('Title must be between 1 and 200 characters'),
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
  body('order')
    .optional()
    .isInt({ min: 0 })
    .withMessage('Order must be a non-negative integer'),
  body('isActive')
    .optional()
    .isBoolean()
    .withMessage('isActive must be a boolean'),
];

router.get(
  '/customer',
  query('categoryId')
    .isMongoId()
    .withMessage('Category ID must be a valid MongoDB ObjectId'),
  getCustomerAccessories
);

router.use(protect);
router.use(authorize('admin'));

router.post('/', createAccessoryValidation, createAccessory);
router.get('/', getAccessories);
router.get(
  '/:id',
  param('id')
    .isMongoId()
    .withMessage('Accessory ID must be a valid MongoDB ObjectId'),
  getAccessory
);
router.put(
  '/:id',
  param('id')
    .isMongoId()
    .withMessage('Accessory ID must be a valid MongoDB ObjectId'),
  updateAccessoryValidation,
  updateAccessory
);
router.delete(
  '/:id',
  param('id')
    .isMongoId()
    .withMessage('Accessory ID must be a valid MongoDB ObjectId'),
  deleteAccessory
);

router.post(
  '/bulk',
  body('accessories')
    .isArray({ min: 1 })
    .withMessage('Accessories array is required'),
  bulkCreateAccessories
);
router.put(
  '/reorder',
  body('accessories')
    .isArray({ min: 1 })
    .withMessage('Accessories array is required'),
  reorderAccessories
);

import {
  migrateAndReindexAccessories,
  reindexAccessoryOrders,
} from '../../controllers/sellAccessory.controller';
router.post('/reindex-orders', reindexAccessoryOrders);
router.post('/migrate-and-reindex', migrateAndReindexAccessories);

router.patch(
  '/:id/toggle-status',
  param('id')
    .isMongoId()
    .withMessage('Accessory ID must be a valid MongoDB ObjectId'),
  toggleAccessoryStatus
);

export default router;
