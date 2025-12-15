import express from 'express';
import { body, param, query } from 'express-validator';

import {
  bulkCreateDefects,
  createDefect,
  deleteDefect,
  getDefect,
  getDefectCategories,
  getDefects,
  getDefectsByCategory,
  reorderDefects,
  updateDefect,
} from '../../controllers/sellDefect.controller';
import { authorize, protect } from '../../middlewares/auth.middleware';

const router = express.Router();

const defectValidation = [
  body('categoryId')
    .isMongoId()
    .withMessage('Category ID must be a valid MongoDB ObjectId'),
  body('section')
    .isIn([
      'screen',
      'body',
      'functional',
      'battery',
      'camera',
      'sensor',
      'buttons',
      'others',
    ])
    .withMessage(
      'Section must be one of: screen, body, functional, battery, camera, sensor, buttons, others'
    ),
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
  body('icon')
    .optional()
    .trim()
    .isLength({ max: 100 })
    .withMessage('Icon cannot exceed 100 characters'),
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

router.get(
  '/category/:categoryId',
  param('categoryId')
    .isMongoId()
    .withMessage('Category ID must be a valid MongoDB ObjectId'),
  getDefectsByCategory
);
router.get('/categories', getDefectCategories);

router.use(protect);
router.use(authorize('admin'));

router.post('/', defectValidation, createDefect);
router.get('/', getDefects);
router.get(
  '/:id',
  param('id')
    .isMongoId()
    .withMessage('Defect ID must be a valid MongoDB ObjectId'),
  getDefect
);
router.put(
  '/:id',
  param('id')
    .isMongoId()
    .withMessage('Defect ID must be a valid MongoDB ObjectId'),
  defectValidation,
  updateDefect
);
router.delete(
  '/:id',
  param('id')
    .isMongoId()
    .withMessage('Defect ID must be a valid MongoDB ObjectId'),
  deleteDefect
);

router.post(
  '/bulk',
  body('defects').isArray({ min: 1 }).withMessage('Defects array is required'),
  bulkCreateDefects
);
router.put(
  '/reorder',
  body('defects').isArray({ min: 1 }).withMessage('Defects array is required'),
  reorderDefects
);

export default router;
