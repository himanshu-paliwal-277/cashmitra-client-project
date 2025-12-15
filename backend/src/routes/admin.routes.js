const express = require('express');
const { check } = require('express-validator');
const multer = require('multer');
const adminController = require('../controllers/admin.controller');
const categoryController = require('../controllers/category.controller');
const { protect, authorize } = require('../middlewares/auth.middleware');
const { validateRequest } = require('../middlewares/validation.middleware');
const { asyncHandler } = require('../middlewares/errorHandler.middleware');
const { authRateLimiter } = require('../middlewares/rateLimiter.middleware');

// Configure multer for file uploads (using memory storage for Cloudinary)
const storage = multer.memoryStorage();

const upload = multer({
  storage: storage,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB limit
  },
  fileFilter: function (req, file, cb) {
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('Only image files are allowed'), false);
    }
  },
});

const router = express.Router();

// Apply auth rate limiter to admin login route
// router.use('/login', authLimiter);

// Admin login (CSRF protection disabled for this endpoint)
router.post(
  '/login',
  [
    check('email').isEmail().withMessage('Please include a valid email'),
    check('password').exists().withMessage('Password is required'),
  ],
  validateRequest,
  (req, res, next) => {
    // Skip CSRF validation for admin login
    req.skipCSRF = true;
    next();
  },
  asyncHandler(adminController.loginAdmin)
);

// Get admin profile
router.get(
  '/profile',
  protect,
  authorize('admin'),
  asyncHandler(adminController.getAdminProfile)
);

// Create a new admin user
router.post(
  '/create',
  [
    check('name').notEmpty().withMessage('Name is required'),
    check('email').isEmail().withMessage('Please include a valid email'),
    check('phone')
      .isMobilePhone()
      .withMessage('Please include a valid phone number'),
    check('password')
      .isLength({ min: 8 })
      .withMessage('Password must be at least 8 characters long'),
  ],
  protect,
  authorize('admin'),
  validateRequest,
  asyncHandler(adminController.createAdmin)
);

// Partner Management Routes
// Get all partners
router.get(
  '/partners',
  protect,
  authorize('admin'),
  asyncHandler(adminController.getAllPartners)
);

// Get partner by ID
router.get(
  '/partners/:id',
  protect,
  authorize('admin'),
  asyncHandler(adminController.getPartnerById)
);

// Create new partner
router.post(
  '/partners',
  [
    // Custom validation to ensure either userId OR user details are provided
    check('userId').custom((value, { req }) => {
      // If userId is provided, it must be a valid MongoDB ID
      if (value && value.trim()) {
        if (!value.match(/^[0-9a-fA-F]{24}$/)) {
          throw new Error('Valid user ID is required');
        }
        return true;
      }

      // If no userId, then user details are required
      const { name, email, phone, password } = req.body;
      if (!name || !email || !phone || !password) {
        throw new Error(
          'Either userId or complete user details (name, email, phone, password) are required'
        );
      }

      return true;
    }),

    // User details (required when userId is not provided)
    check('name').custom((value, { req }) => {
      // Only validate if userId is not provided
      if (!req.body.userId || !req.body.userId.trim()) {
        if (!value || value.trim().length < 2 || value.trim().length > 100) {
          throw new Error('Name must be between 2 and 100 characters');
        }
      }
      return true;
    }),

    check('email').custom((value, { req }) => {
      // Only validate if userId is not provided
      if (!req.body.userId || !req.body.userId.trim()) {
        if (!value || !/\S+@\S+\.\S+/.test(value)) {
          throw new Error('Valid email is required');
        }
      }
      return true;
    }),

    check('phone').custom((value, { req }) => {
      // Only validate if userId is not provided
      if (!req.body.userId || !req.body.userId.trim()) {
        if (!value || value.length < 10) {
          throw new Error('Valid phone number is required');
        }
      }
      return true;
    }),

    check('password').custom((value, { req }) => {
      // Only validate if userId is not provided
      if (!req.body.userId || !req.body.userId.trim()) {
        if (!value || value.length < 6) {
          throw new Error('Password must be at least 6 characters long');
        }
      }
      return true;
    }),

    // Partner details (always required)
    check('shopName')
      .trim()
      .isLength({ min: 2, max: 100 })
      .withMessage('Shop name must be between 2 and 100 characters'),
    check('shopAddress.street')
      .notEmpty()
      .withMessage('Street address is required'),
    check('shopAddress.city').notEmpty().withMessage('City is required'),
    check('shopAddress.state').notEmpty().withMessage('State is required'),
    check('shopAddress.pincode')
      .isLength({ min: 6, max: 6 })
      .withMessage('Pincode must be 6 digits'),
    check('shopEmail').isEmail().withMessage('Valid shop email is required'),
    check('upiId')
      .optional()
      .matches(/^[a-zA-Z0-9._-]+@[a-zA-Z0-9]+$/)
      .withMessage(
        'UPI ID must be in format: username@provider (e.g., user@paytm, phone@ybl)'
      ),
  ],
  protect,
  authorize('admin'),
  validateRequest,
  asyncHandler(adminController.createPartner)
);

// Update partner
router.put(
  '/partners/:id',
  [
    check('shopName')
      .optional()
      .trim()
      .isLength({ min: 2, max: 100 })
      .withMessage('Shop name must be between 2 and 100 characters'),
    check('shopAddress.street')
      .optional()
      .notEmpty()
      .withMessage('Street address cannot be empty'),
    check('shopAddress.city')
      .optional()
      .notEmpty()
      .withMessage('City cannot be empty'),
    check('shopAddress.state')
      .optional()
      .notEmpty()
      .withMessage('State cannot be empty'),
    check('shopAddress.pincode')
      .optional()
      .isLength({ min: 6, max: 6 })
      .withMessage('Pincode must be 6 digits'),
    // check('gstNumber').optional().matches(/^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}Z[0-9A-Z]{1}$/).withMessage('Invalid GST number format'),
    // check('shopPhone').optional().isMobilePhone('en-IN').withMessage('Valid Indian phone number is required'),
    check('shopEmail')
      .optional()
      .isEmail()
      .withMessage('Valid email is required'),
    // check('bankDetails.accountNumber').optional().isLength({ min: 9, max: 18 }).withMessage('Invalid account number'),
    // check('bankDetails.ifscCode').optional().matches(/^[A-Z]{4}0[A-Z0-9]{6}$/).withMessage('Invalid IFSC code'),
    check('upiId')
      .optional()
      .matches(/^[a-zA-Z0-9._-]+@[a-zA-Z0-9]+$/)
      .withMessage(
        'UPI ID must be in format: username@provider (e.g., user@paytm, phone@ybl)'
      ),
    check('verificationStatus')
      .optional()
      .isIn(['pending', 'approved', 'rejected'])
      .withMessage('Invalid verification status'),
    check('isVerified')
      .optional()
      .isBoolean()
      .withMessage('isVerified must be boolean'),
  ],
  protect,
  authorize('admin'),
  validateRequest,
  asyncHandler(adminController.updatePartner)
);

// Delete partner
router.delete(
  '/partners/:id',
  protect,
  authorize('admin'),
  asyncHandler(adminController.deletePartner)
);

// Verify/Reject partner
router.put(
  '/partners/:id/verify',
  [
    check('status')
      .isIn(['approved', 'rejected'])
      .withMessage('Status must be approved or rejected'),
    check('notes').optional().isString().withMessage('Notes must be a string'),
  ],
  protect,
  authorize('admin'),
  validateRequest,
  asyncHandler(adminController.verifyPartner)
);

// Update partner wallet balance
router.post(
  '/partners/:id/wallet/update',
  [
    check('amount').isNumeric().withMessage('Amount must be a number'),
    check('reason').notEmpty().withMessage('Reason is required'),
    check('type')
      .isIn(['credit', 'debit'])
      .withMessage('Type must be credit or debit'),
  ],
  protect,
  authorize('admin'),
  validateRequest,
  asyncHandler(adminController.updatePartnerWallet)
);

// Order Management Routes
// Get all orders
router.get(
  '/orders',
  protect,
  authorize('admin'),
  asyncHandler(adminController.getAllOrders)
);

// Get single order by ID
router.get(
  '/orders/:id',
  protect,
  authorize('admin'),
  asyncHandler(adminController.getOrderById)
);

// Analytics Routes
// Get dashboard analytics
router.get(
  '/analytics',
  protect,
  authorize('admin'),
  asyncHandler(adminController.getDashboardAnalytics)
);

// Product Catalog Management Routes
// Get catalog
router.get(
  '/catalog',
  protect,
  authorize('admin'),
  asyncHandler(adminController.getCatalog)
);

// Get product by ID
router.get(
  '/catalog/:id',
  protect,
  authorize('admin'),
  asyncHandler(adminController.getProductById)
);

// Upload product images
router.post(
  '/catalog/upload-images',
  protect,
  authorize('admin'),
  upload.array('images', 10), // Allow up to 10 images
  asyncHandler(adminController.uploadProductImages)
);

// Add product to catalog
router.post(
  '/catalog',
  [
    check('category').notEmpty().withMessage('Category is required'),
    check('brand').notEmpty().withMessage('Brand is required'),
    // check('series').notEmpty().withMessage('Series is required'),
    check('model').notEmpty().withMessage('Model is required'),
    // check('basePrice').isNumeric().withMessage('Base price must be a number'),
    // check('depreciationRate').isNumeric().withMessage('Depreciation rate must be a number')
  ],
  protect,
  authorize('admin'),
  validateRequest,
  asyncHandler(adminController.addProduct)
);

// Update product in catalog
router.put(
  '/catalog/:id',
  protect,
  authorize('admin'),
  asyncHandler(adminController.updateProduct)
);

// Update product status
router.patch(
  '/catalog/:id/status',
  [
    check('status')
      .isIn(['active', 'inactive', 'draft', 'archived'])
      .withMessage('Invalid status value'),
  ],
  protect,
  authorize('admin'),
  validateRequest,
  asyncHandler(adminController.updateProductStatus)
);

// Delete product from catalog
router.delete(
  '/catalog/:id',
  protect,
  authorize('admin'),
  asyncHandler(adminController.deleteProduct)
);

// Commission Management Routes
// Get commission settings
router.get(
  '/commission',
  protect,
  authorize('admin'),
  asyncHandler(adminController.getCommissionSettings)
);

// Update commission settings
router.put(
  '/commission',
  protect,
  authorize('admin'),
  asyncHandler(adminController.updateCommissionSettings)
);

// User Management Routes
// Get all users
router.get(
  '/users',
  protect,
  authorize('admin'),
  asyncHandler(adminController.getAllUsers)
);

// Get user by ID
router.get(
  '/users/:id',
  protect,
  authorize('admin'),
  asyncHandler(adminController.getUserById)
);

// Create new user
router.post(
  '/users',
  [
    check('name').notEmpty().withMessage('Name is required'),
    check('email').isEmail().withMessage('Please include a valid email'),
    check('phone')
      .isMobilePhone()
      .withMessage('Please include a valid phone number'),
    check('password')
      .isLength({ min: 6 })
      .withMessage('Password must be at least 6 characters long'),
    check('role')
      .optional()
      .isIn(['user', 'partner', 'admin', 'driver'])
      .withMessage('Invalid role'),
  ],
  protect,
  authorize('admin'),
  validateRequest,
  asyncHandler(adminController.createUser)
);

// Update user
router.put(
  '/users/:id',
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
    check('role')
      .optional()
      .isIn(['user', 'partner', 'admin', 'driver'])
      .withMessage('Invalid role'),
  ],
  protect,
  authorize('admin'),
  validateRequest,
  asyncHandler(adminController.updateUser)
);

// Update user password
router.put(
  '/users/:id/password',
  [
    check('newPassword')
      .isLength({ min: 6 })
      .withMessage('Password must be at least 6 characters long'),
  ],
  protect,
  authorize('admin'),
  validateRequest,
  asyncHandler(adminController.updateUserPassword)
);

// Delete user
router.delete(
  '/users/:id',
  protect,
  authorize('admin'),
  asyncHandler(adminController.deleteUser)
);

// Toggle user active status
router.put(
  '/users/:id/status',
  [check('isActive').isBoolean().withMessage('isActive must be a boolean')],
  protect,
  authorize('admin'),
  validateRequest,
  asyncHandler(adminController.toggleUserStatus)
);

// Category Management Routes
router.get('/categories', asyncHandler(categoryController.getCategories));

router.post(
  '/categories',
  [
    check('name')
      .trim()
      .isLength({ min: 2, max: 100 })
      .withMessage('Category name must be between 2 and 100 characters'),
    check('description')
      .optional()
      .isLength({ max: 500 })
      .withMessage('Description cannot exceed 500 characters'),
    check('image').optional().isURL().withMessage('Image must be a valid URL'),
    check('icon').optional().isString().withMessage('Icon must be a string'),
    check('isActive')
      .optional()
      .isBoolean()
      .withMessage('isActive must be a boolean'),
  ],
  protect,
  authorize('admin'),
  validateRequest,
  asyncHandler(categoryController.createCategory)
);

router.get(
  '/categories/:id',
  protect,
  authorize('admin'),
  asyncHandler(categoryController.getCategory)
);

router.put(
  '/categories/:id',
  [
    check('name')
      .optional()
      .trim()
      .isLength({ min: 2, max: 100 })
      .withMessage('Category name must be between 2 and 100 characters'),
    check('description')
      .optional()
      .isLength({ max: 500 })
      .withMessage('Description cannot exceed 500 characters'),
    check('image').optional().isURL().withMessage('Image must be a valid URL'),
    check('icon').optional().isString().withMessage('Icon must be a string'),
    check('isActive')
      .optional()
      .isBoolean()
      .withMessage('isActive must be a boolean'),
  ],
  protect,
  authorize('admin'),
  validateRequest,
  asyncHandler(categoryController.updateCategory)
);

router.delete(
  '/categories/:id',
  protect,
  authorize('admin'),
  asyncHandler(categoryController.deleteCategory)
);

router.get(
  '/categories/admin/stats',
  protect,
  authorize('admin'),
  asyncHandler(categoryController.getCategoryStats)
);

// Sell Orders Routes
router.get(
  '/sell-orders',
  protect,
  authorize('admin'),
  asyncHandler(adminController.getSellOrders)
);

// Buy Orders Routes
router.get(
  '/buy-orders',
  protect,
  authorize('admin'),
  asyncHandler(adminController.getBuyOrders)
);

// Update Order Status
router.put(
  '/orders/:id/status',
  [
    check('status')
      .isIn([
        'pending',
        'confirmed',
        'processing',
        'shipped',
        'delivered',
        'cancelled',
        'refunded',
      ])
      .withMessage('Invalid status'),
    check('notes')
      .optional()
      .isLength({ max: 500 })
      .withMessage('Notes must not exceed 500 characters'),
  ],
  protect,
  authorize('admin'),
  validateRequest,
  asyncHandler(adminController.updateOrderStatus)
);

// Get Partner Suggestions for Order Assignment
router.get(
  '/orders/:id/partner-suggestions',
  protect,
  authorize('admin'),
  asyncHandler(adminController.getPartnerSuggestionsForOrder)
);

// Assign Partner to Order
router.put(
  '/orders/:id/assign-partner',
  [
    check('partner')
      .isMongoId()
      .withMessage('Partner ID must be a valid MongoDB ObjectId'),
  ],
  protect,
  authorize('admin'),
  validateRequest,
  asyncHandler(adminController.assignPartnerToOrder)
);

// Brand Management Routes
router.get(
  '/brands',
  protect,
  authorize('admin'),
  asyncHandler(adminController.getBrands)
);

router.post(
  '/brands',
  [
    check('brand')
      .trim()
      .isLength({ min: 2, max: 50 })
      .withMessage('Brand name must be between 2 and 50 characters'),
    check('category')
      .isIn(['mobile', 'laptop', 'tablet'])
      .withMessage('Category must be one of: mobile, laptop, tablet'),
  ],
  protect,
  authorize('admin'),
  validateRequest,
  asyncHandler(adminController.createBrand)
);

router.put(
  '/brands/:brandName',
  [
    check('newBrandName')
      .trim()
      .isLength({ min: 2, max: 50 })
      .withMessage('New brand name must be between 2 and 50 characters'),
  ],
  protect,
  authorize('admin'),
  validateRequest,
  asyncHandler(adminController.updateBrand)
);

router.delete(
  '/brands/:brandName',
  protect,
  authorize('admin'),
  asyncHandler(adminController.deleteBrand)
);

// Model Management Routes
router.get(
  '/models',
  protect,
  authorize('admin'),
  asyncHandler(adminController.getModels)
);

router.post(
  '/models',
  [
    check('brand')
      .trim()
      .isLength({ min: 2, max: 50 })
      .withMessage('Brand name must be between 2 and 50 characters'),
    check('model')
      .trim()
      .isLength({ min: 2, max: 100 })
      .withMessage('Model name must be between 2 and 100 characters'),
    check('category')
      .optional()
      .isIn([
        'smartphone',
        'laptop',
        'tablet',
        'smartwatch',
        'headphones',
        'camera',
        'gaming',
        'general',
      ])
      .withMessage(
        'Category must be one of: smartphone, laptop, tablet, smartwatch, headphones, camera, gaming, general'
      ),
  ],
  protect,
  authorize('admin'),
  validateRequest,
  asyncHandler(adminController.createModel)
);

router.put(
  '/models/:modelName',
  [
    check('brand')
      .optional()
      .trim()
      .isLength({ min: 2, max: 50 })
      .withMessage('Brand name must be between 2 and 50 characters'),
    check('model')
      .optional()
      .trim()
      .isLength({ min: 2, max: 100 })
      .withMessage('Model name must be between 2 and 100 characters'),
    check('category')
      .optional()
      .isIn([
        'smartphone',
        'laptop',
        'tablet',
        'smartwatch',
        'headphones',
        'camera',
        'gaming',
        'general',
      ])
      .withMessage(
        'Category must be one of: smartphone, laptop, tablet, smartwatch, headphones, camera, gaming, general'
      ),
    check('description')
      .optional()
      .isLength({ max: 1000 })
      .withMessage('Description cannot exceed 1000 characters'),
    check('releaseYear')
      .optional()
      .isInt({ min: 1990, max: new Date().getFullYear() + 2 })
      .withMessage('Invalid release year'),
    check('isActive')
      .optional()
      .isBoolean()
      .withMessage('isActive must be a boolean'),
    // check('variants').optional().isArray().withMessage('Variants must be an array')
  ],
  protect,
  authorize('admin'),
  validateRequest,
  asyncHandler(adminController.updateModelByName)
);

router.delete(
  '/models/:modelName',
  protect,
  authorize('admin'),
  asyncHandler(adminController.deleteModelByName)
);

// ===== CONDITION QUESTIONNAIRE ROUTES =====

// Get all condition questionnaires
router.get(
  '/questionnaires',
  protect,
  authorize('admin'),
  asyncHandler(adminController.getConditionQuestionnaires)
);

// Get condition questionnaire by ID
router.get(
  '/questionnaires/:id',
  protect,
  authorize('admin'),
  asyncHandler(adminController.getConditionQuestionnaireById)
);

// Get questionnaires by category
router.get(
  '/questionnaires/category/:category',
  protect,
  authorize('admin'),
  asyncHandler(adminController.getQuestionnairesByCategory)
);

// Create new condition questionnaire
router.post(
  '/questionnaires',
  [
    check('title')
      .trim()
      .isLength({ min: 3, max: 200 })
      .withMessage('Title must be between 3 and 200 characters'),
    check('description')
      .optional()
      .isLength({ max: 1000 })
      .withMessage('Description cannot exceed 1000 characters'),
    check('category')
      .isIn([
        'smartphone',
        'laptop',
        'tablet',
        'smartwatch',
        'headphones',
        'camera',
        'gaming',
        'general',
      ])
      .withMessage(
        'Category must be one of: smartphone, laptop, tablet, smartwatch, headphones, camera, gaming, general'
      ),
    check('subcategory')
      .optional()
      .isString()
      .withMessage('Subcategory must be a string'),
    check('brand').optional().isString().withMessage('Brand must be a string'),
    check('model').optional().isString().withMessage('Model must be a string'),
    // check('questions').isArray({ min: 1 }).withMessage('At least one question is required'),
    check('questions.*.id').notEmpty().withMessage('Question ID is required'),
    check('questions.*.title')
      .trim()
      .isLength({ min: 5, max: 500 })
      .withMessage('Question title must be between 5 and 500 characters'),
    check('questions.*.type')
      .isIn([
        'single_choice',
        'multiple_choice',
        'text',
        'number',
        'boolean',
        'rating',
      ])
      .withMessage('Invalid question type'),
    check('questions.*.required')
      .optional()
      .isBoolean()
      .withMessage('Required field must be boolean'),
    // check('questions.*.options').optional().isArray().withMessage('Options must be an array'),
    // check('version').optional().matches(/^\d+\.\d+\.\d+$/).withMessage('Version must be in semantic versioning format (e.g., 1.0.0)'),
    check('isActive')
      .optional()
      .isBoolean()
      .withMessage('isActive must be a boolean'),
    check('isDefault')
      .optional()
      .isBoolean()
      .withMessage('isDefault must be a boolean'),
    check('metadata.estimatedTime')
      .optional()
      .isInt({ min: 1, max: 60 })
      .withMessage('Estimated time must be between 1 and 60 minutes'),
    check('metadata.difficulty')
      .optional()
      .isIn(['easy', 'medium', 'hard'])
      .withMessage('Difficulty must be easy, medium, or hard'),
    // check('metadata.tags').optional().isArray().withMessage('Tags must be an array'),
    check('metadata.instructions')
      .optional()
      .isString()
      .withMessage('Instructions must be a string'),
  ],
  protect,
  authorize('admin'),
  validateRequest,
  asyncHandler(adminController.createConditionQuestionnaire)
);

// Update condition questionnaire
router.put(
  '/questionnaires/:id',
  [
    check('title')
      .optional()
      .trim()
      .isLength({ min: 3, max: 200 })
      .withMessage('Title must be between 3 and 200 characters'),
    check('description')
      .optional()
      .isLength({ max: 1000 })
      .withMessage('Description cannot exceed 1000 characters'),
    check('category')
      .optional()
      .isIn([
        'smartphone',
        'laptop',
        'tablet',
        'smartwatch',
        'headphones',
        'camera',
        'gaming',
        'general',
      ])
      .withMessage(
        'Category must be one of: smartphone, laptop, tablet, smartwatch, headphones, camera, gaming, general'
      ),
    check('subcategory')
      .optional()
      .isString()
      .withMessage('Subcategory must be a string'),
    check('brand').optional().isString().withMessage('Brand must be a string'),
    check('model').optional().isString().withMessage('Model must be a string'),
    check('questions')
      .optional()
      .isArray({ min: 1 })
      .withMessage('At least one question is required'),
    check('questions.*.id')
      .optional()
      .notEmpty()
      .withMessage('Question ID is required'),
    check('questions.*.title')
      .optional()
      .trim()
      .isLength({ min: 5, max: 500 })
      .withMessage('Question title must be between 5 and 500 characters'),
    check('questions.*.type')
      .optional()
      .isIn([
        'single_choice',
        'multiple_choice',
        'text',
        'number',
        'boolean',
        'rating',
      ])
      .withMessage('Invalid question type'),
    check('questions.*.required')
      .optional()
      .isBoolean()
      .withMessage('Required field must be boolean'),
    check('questions.*.options')
      .optional()
      .isArray()
      .withMessage('Options must be an array'),
    // check('version').optional().matches(/^\d+\.\d+\.\d+$/).withMessage('Version must be in semantic versioning format (e.g., 1.0.0)'),
    check('isActive')
      .optional()
      .isBoolean()
      .withMessage('isActive must be a boolean'),
    check('isDefault')
      .optional()
      .isBoolean()
      .withMessage('isDefault must be a boolean'),
    check('metadata.estimatedTime')
      .optional()
      .isInt({ min: 1, max: 60 })
      .withMessage('Estimated time must be between 1 and 60 minutes'),
    check('metadata.difficulty')
      .optional()
      .isIn(['easy', 'medium', 'hard'])
      .withMessage('Difficulty must be easy, medium, or hard'),
    check('metadata.tags')
      .optional()
      .isArray()
      .withMessage('Tags must be an array'),
    check('metadata.instructions')
      .optional()
      .isString()
      .withMessage('Instructions must be a string'),
  ],
  protect,
  authorize('admin'),
  validateRequest,
  asyncHandler(adminController.updateConditionQuestionnaire)
);

// Delete condition questionnaire
router.delete(
  '/questionnaires/:id',
  [
    check('reason')
      .optional()
      .isString()
      .withMessage('Deletion reason must be a string'),
  ],
  protect,
  authorize('admin'),
  validateRequest,
  asyncHandler(adminController.deleteConditionQuestionnaire)
);

// Agent Management Routes
// Get all agents
router.get(
  '/agents',
  protect,
  authorize('admin'),
  asyncHandler(adminController.getAgents)
);

// Approve agent
router.put(
  '/agents/:id/approve',
  protect,
  authorize('admin'),
  asyncHandler(adminController.approveAgent)
);

// Reject agent
router.put(
  '/agents/:id/reject',
  [check('reason').notEmpty().withMessage('Rejection reason is required')],
  protect,
  authorize('admin'),
  validateRequest,
  asyncHandler(adminController.rejectAgent)
);

// Toggle agent status
router.put(
  '/agents/:id/status',
  [check('isActive').isBoolean().withMessage('isActive must be a boolean')],
  protect,
  authorize('admin'),
  validateRequest,
  asyncHandler(adminController.toggleAgentStatus)
);

module.exports = router;
