const express = require('express');
const { check } = require('express-validator');
const userController = require('../controllers/user.controller');
const { protect } = require('../middlewares/auth.middleware');
const { validateRequest } = require('../middlewares/validation.middleware');
const { asyncHandler } = require('../middlewares/errorHandler.middleware');

const router = express.Router();

// Apply authentication middleware to all routes
router.use(protect);

// @route   GET /api/user/profile
// @desc    Get user profile
// @access  Private
router.get('/profile', asyncHandler(userController.getUserProfile));

// @route   PUT /api/user/profile
// @desc    Update user profile
// @access  Private
router.put(
  '/profile',
  [
    check('name').optional().notEmpty().withMessage('Name cannot be empty'),
    check('email')
      .optional()
      .isEmail()
      .withMessage('Please include a valid email'),
    check('phone')
      .optional()
      .isMobilePhone()
      .withMessage('Please include a valid phone number'),
    check('dateOfBirth')
      .optional()
      .isISO8601()
      .withMessage('Please provide a valid date'),
    check('address.street')
      .optional()
      .notEmpty()
      .withMessage('Street cannot be empty'),
    check('address.city')
      .optional()
      .notEmpty()
      .withMessage('City cannot be empty'),
    check('address.state')
      .optional()
      .notEmpty()
      .withMessage('State cannot be empty'),
    check('address.pincode')
      .optional()
      .isLength({ min: 6, max: 6 })
      .withMessage('Pincode must be 6 digits'),
  ],
  validateRequest,
  asyncHandler(userController.updateUserProfile)
);

// @route   GET /api/user/orders
// @desc    Get user orders with pagination and filtering
// @access  Private
router.get('/orders', asyncHandler(userController.getUserOrders));

// @route   GET /api/user/orders/:id
// @desc    Get single order by ID
// @access  Private
router.get('/orders/:id', asyncHandler(userController.getOrderById));

// @route   GET /api/user/addresses
// @desc    Get user addresses
// @access  Private
router.get('/addresses', asyncHandler(userController.getUserAddresses));

// @route   POST /api/user/addresses
// @desc    Add new address
// @access  Private
router.post(
  '/addresses',
  [
    check('title').notEmpty().withMessage('Address title is required'),
    check('fullName').notEmpty().withMessage('Full name is required'),
    check('phone')
      .isMobilePhone()
      .withMessage('Please include a valid phone number'),
    check('street').notEmpty().withMessage('Street address is required'),
    check('city').notEmpty().withMessage('City is required'),
    check('state').notEmpty().withMessage('State is required'),
    check('pincode')
      .isLength({ min: 6, max: 6 })
      .withMessage('Pincode must be 6 digits'),
    check('addressType')
      .optional()
      .isIn(['home', 'work', 'other'])
      .withMessage('Invalid address type'),
  ],
  validateRequest,
  asyncHandler(userController.addAddress)
);

// @route   PUT /api/user/addresses/:id
// @desc    Update address
// @access  Private
router.put(
  '/addresses/:id',
  [
    check('title')
      .optional()
      .notEmpty()
      .withMessage('Address title cannot be empty'),
    check('fullName')
      .optional()
      .notEmpty()
      .withMessage('Full name cannot be empty'),
    check('phone')
      .optional()
      .isMobilePhone()
      .withMessage('Please include a valid phone number'),
    check('street')
      .optional()
      .notEmpty()
      .withMessage('Street address cannot be empty'),
    check('city').optional().notEmpty().withMessage('City cannot be empty'),
    check('state').optional().notEmpty().withMessage('State cannot be empty'),
    check('pincode')
      .optional()
      .isLength({ min: 6, max: 6 })
      .withMessage('Pincode must be 6 digits'),
    check('addressType')
      .optional()
      .isIn(['home', 'work', 'other'])
      .withMessage('Invalid address type'),
  ],
  validateRequest,
  asyncHandler(userController.updateAddress)
);

// @route   DELETE /api/user/addresses/:id
// @desc    Delete address
// @access  Private
router.delete('/addresses/:id', asyncHandler(userController.deleteAddress));

// @route   PUT /api/user/addresses/:id/default
// @desc    Set default address
// @access  Private
router.put(
  '/addresses/:id/default',
  asyncHandler(userController.setDefaultAddress)
);

module.exports = router;
