import express from 'express';
import { body } from 'express-validator';

import {
  cleanupExpiredSessions,
  createSession,
  deleteSession,
  extendSession,
  getAllSessions,
  getCurrentPrice,
  getSession,
  getUserSessions,
  updateAccessories,
  updateAnswers,
  updateDefects,
  updateSessionStatus,
} from '../../controllers/sellOfferSession.controller.js';
import {
  authorize,
  isAuthenticated,
} from '../../middlewares/auth.middleware.js';

const router = express.Router();

const createSessionValidation = [
  body('userId')
    .optional()
    .isMongoId()
    .withMessage('User ID must be a valid MongoDB ObjectId'),
  body('productId')
    .isMongoId()
    .withMessage('Product ID must be a valid MongoDB ObjectId'),
  body('variantId')
    .isMongoId()
    .withMessage('Variant ID must be a valid MongoDB ObjectId'),
  body('answers')
    .optional()
    .isObject()
    .withMessage('Answers must be an object'),
  body('defects').optional().isArray().withMessage('Defects must be an array'),
  body('accessories')
    .optional()
    .isArray()
    .withMessage('Accessories must be an array'),
];

const updateAnswersValidation = [
  body('answers').isObject().withMessage('Answers object is required'),
  body('answers.*').notEmpty().withMessage('Answer values cannot be empty'),
];

const updateDefectsValidation = [
  body('defects').isArray().withMessage('Defects array is required'),
  body('defects.*').isString().withMessage('Each defect must be a string'),
];

const updateAccessoriesValidation = [
  body('accessories').isArray().withMessage('Accessories array is required'),
  body('accessories.*')
    .isString()
    .withMessage('Each accessory must be a string'),
];

router.post('/create', createSessionValidation, createSession);
router.get('/:sessionId', getSession);
router.get('/:sessionId/price', getCurrentPrice);

router.use(isAuthenticated);

router.post('/', createSessionValidation, createSession);
router.get('/my-sessions', getUserSessions);
router.put('/:sessionId/answers', updateAnswersValidation, updateAnswers);
router.put('/:sessionId/defects', updateDefectsValidation, updateDefects);
router.put(
  '/:sessionId/accessories',
  updateAccessoriesValidation,
  updateAccessories
);
router.post('/:sessionId/extend', extendSession);
router.delete('/:sessionId', deleteSession);

router.get('/admin/all', authorize('admin'), getAllSessions);
router.patch(
  '/admin/:sessionId/status',
  authorize('admin'),
  updateSessionStatus
);
router.post('/admin/cleanup', authorize('admin'), cleanupExpiredSessions);

export default router;
