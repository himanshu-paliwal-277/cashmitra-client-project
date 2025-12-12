const express = require('express');
const { check } = require('express-validator');
const leadsController = require('../controllers/leads.controller');
const { protect, authorize } = require('../middlewares/auth.middleware');
const { validateRequest } = require('../middlewares/validation.middleware');
const { asyncHandler } = require('../middlewares/errorHandler.middleware');

const router = express.Router();

// Apply authentication and admin authorization to all routes
router.use(protect);
router.use(authorize('admin'));

// Validation rules
const createLeadValidation = [
  check('name')
    .notEmpty()
    .withMessage('Name is required')
    .isLength({ min: 2, max: 100 })
    .withMessage('Name must be between 2 and 100 characters'),
  check('email')
    .isEmail()
    .withMessage('Please provide a valid email')
    .normalizeEmail(),
  check('phone')
    .notEmpty()
    .withMessage('Phone number is required')
    .isMobilePhone('any')
    .withMessage('Please provide a valid phone number'),
  check('interestedIn')
    .isIn(['selling', 'buying', 'both'])
    .withMessage('Interested in must be selling, buying, or both'),
  check('source')
    .optional()
    .isIn([
      'website',
      'social_media',
      'referral',
      'advertisement',
      'direct',
      'other',
    ])
    .withMessage('Invalid source'),
  check('priority')
    .optional()
    .isIn(['low', 'medium', 'high', 'urgent'])
    .withMessage('Invalid priority'),
  check('estimatedValue')
    .optional()
    .isNumeric()
    .withMessage('Estimated value must be a number')
    .isFloat({ min: 0 })
    .withMessage('Estimated value must be positive'),
  check('followUpDate')
    .optional()
    .isISO8601()
    .withMessage('Follow up date must be a valid date'),
];

const updateLeadValidation = [
  check('name')
    .optional()
    .isLength({ min: 2, max: 100 })
    .withMessage('Name must be between 2 and 100 characters'),
  check('email')
    .optional()
    .isEmail()
    .withMessage('Please provide a valid email')
    .normalizeEmail(),
  check('phone')
    .optional()
    .isMobilePhone('any')
    .withMessage('Please provide a valid phone number'),
  check('status')
    .optional()
    .isIn(['new', 'contacted', 'qualified', 'converted', 'lost'])
    .withMessage('Invalid status'),
  check('priority')
    .optional()
    .isIn(['low', 'medium', 'high', 'urgent'])
    .withMessage('Invalid priority'),
  check('source')
    .optional()
    .isIn([
      'website',
      'social_media',
      'referral',
      'advertisement',
      'direct',
      'other',
    ])
    .withMessage('Invalid source'),
  check('interestedIn')
    .optional()
    .isIn(['selling', 'buying', 'both'])
    .withMessage('Interested in must be selling, buying, or both'),
  check('estimatedValue')
    .optional()
    .isNumeric()
    .withMessage('Estimated value must be a number')
    .isFloat({ min: 0 })
    .withMessage('Estimated value must be positive'),
  check('followUpDate')
    .optional()
    .isISO8601()
    .withMessage('Follow up date must be a valid date'),
];

const assignLeadValidation = [
  check('assignedTo')
    .notEmpty()
    .withMessage('Assigned to user ID is required')
    .isMongoId()
    .withMessage('Invalid user ID'),
];

// Routes

// @route   GET /api/admin/leads/stats
// @desc    Get lead statistics
// @access  Private/Admin
router.get('/stats', asyncHandler(leadsController.getLeadStats));

// @route   GET /api/admin/leads/overdue
// @desc    Get overdue leads
// @access  Private/Admin
router.get('/overdue', asyncHandler(leadsController.getOverdueLeads));

// @route   GET /api/admin/leads
// @desc    Get all leads with filtering and pagination
// @access  Private/Admin
router.get('/', asyncHandler(leadsController.getLeads));

// @route   POST /api/admin/leads
// @desc    Create new lead
// @access  Private/Admin
router.post(
  '/',
  createLeadValidation,
  validateRequest,
  asyncHandler(leadsController.createLead)
);

// @route   GET /api/admin/leads/:id
// @desc    Get single lead
// @access  Private/Admin
router.get(
  '/:id',
  [check('id').isMongoId().withMessage('Invalid lead ID')],
  validateRequest,
  asyncHandler(leadsController.getLead)
);

// @route   PUT /api/admin/leads/:id
// @desc    Update lead
// @access  Private/Admin
router.put(
  '/:id',
  [
    check('id').isMongoId().withMessage('Invalid lead ID'),
    ...updateLeadValidation,
  ],
  validateRequest,
  asyncHandler(leadsController.updateLead)
);

// @route   DELETE /api/admin/leads/:id
// @desc    Delete lead
// @access  Private/Admin
router.delete(
  '/:id',
  [check('id').isMongoId().withMessage('Invalid lead ID')],
  validateRequest,
  asyncHandler(leadsController.deleteLead)
);

// @route   PUT /api/admin/leads/:id/assign
// @desc    Assign lead to user
// @access  Private/Admin
router.put(
  '/:id/assign',
  [
    check('id').isMongoId().withMessage('Invalid lead ID'),
    ...assignLeadValidation,
  ],
  validateRequest,
  asyncHandler(leadsController.assignLead)
);

module.exports = router;
