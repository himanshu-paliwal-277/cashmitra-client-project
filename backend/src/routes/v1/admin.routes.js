import express from 'express';
import {check} from 'express-validator';
import multer from 'multer';
import adminController from '../../controllers/admin.controller';
import categoryController from '../../controllers/category.controller';
import {protect, authorize} from '../../middlewares/auth.middleware';
import {validateRequest} from '../../middlewares/validation.middleware';
import {asyncHandler} from '../../middlewares/errorHandler.middleware';
import {authRateLimiter} from '../../middlewares/rateLimiter.middleware';

const storage = multer.memoryStorage();

const upload = multer({
  storage: storage,
  limits: {
    fileSize: 5 * 1024 * 1024,
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

router.post(
  '/login',
  [
    check('email').isEmail().withMessage('Please include a valid email'),
    check('password').exists().withMessage('Password is required'),
  ],
  validateRequest,
  (req, res, next) => {
    req.skipCSRF = true;
    next();
  },
  asyncHandler(adminController.loginAdmin)
);

router.get(
  '/profile',
  protect,
  authorize('admin'),
  asyncHandler(adminController.getAdminProfile)
);

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

router.get(
  '/partners',
  protect,
  authorize('admin'),
  asyncHandler(adminController.getAllPartners)
);

router.get(
  '/partners/:id',
  protect,
  authorize('admin'),
  asyncHandler(adminController.getPartnerById)
);

router.post(
  '/partners',
  [
    check('userId').custom((value, { req }) => {
      if (value && value.trim()) {
        if (!value.match(/^[0-9a-fA-F]{24}$/)) {
          throw new Error('Valid user ID is required');
        }
        return true;
      }

      const { name, email, phone, password } = req.body;
      if (!name || !email || !phone || !password) {
        throw new Error(
          'Either userId or complete user details (name, email, phone, password) are required'
        );
      }

      return true;
    }),

    check('name').custom((value, { req }) => {
      if (!req.body.userId || !req.body.userId.trim()) {
        if (!value || value.trim().length < 2 || value.trim().length > 100) {
          throw new Error('Name must be between 2 and 100 characters');
        }
      }
      return true;
    }),

    check('email').custom((value, { req }) => {
      if (!req.body.userId || !req.body.userId.trim()) {
        if (!value || !/\S+@\S+\.\S+/.test(value)) {
          throw new Error('Valid email is required');
        }
      }
      return true;
    }),

    check('phone').custom((value, { req }) => {
      if (!req.body.userId || !req.body.userId.trim()) {
        if (!value || value.length < 10) {
          throw new Error('Valid phone number is required');
        }
      }
      return true;
    }),

    check('password').custom((value, { req }) => {
      if (!req.body.userId || !req.body.userId.trim()) {
        if (!value || value.length < 6) {
          throw new Error('Password must be at least 6 characters long');
        }
      }
      return true;
    }),

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

    check('shopEmail')
      .optional()
      .isEmail()
      .withMessage('Valid email is required'),

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

router.delete(
  '/partners/:id',
  protect,
  authorize('admin'),
  asyncHandler(adminController.deletePartner)
);

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

router.get(
  '/orders',
  protect,
  authorize('admin'),
  asyncHandler(adminController.getAllOrders)
);

router.get(
  '/orders/:id',
  protect,
  authorize('admin'),
  asyncHandler(adminController.getOrderById)
);

router.get(
  '/analytics',
  protect,
  authorize('admin'),
  asyncHandler(adminController.getDashboardAnalytics)
);

router.get(
  '/catalog',
  protect,
  authorize('admin'),
  asyncHandler(adminController.getCatalog)
);

router.get(
  '/catalog/:id',
  protect,
  authorize('admin'),
  asyncHandler(adminController.getProductById)
);

router.post(
  '/catalog/upload-images',
  protect,
  authorize('admin'),
  upload.array('images', 10),
  asyncHandler(adminController.uploadProductImages)
);

router.post(
  '/catalog',
  [
    check('category').notEmpty().withMessage('Category is required'),
    check('brand').notEmpty().withMessage('Brand is required'),

    check('model').notEmpty().withMessage('Model is required'),
  ],
  protect,
  authorize('admin'),
  validateRequest,
  asyncHandler(adminController.addProduct)
);

router.put(
  '/catalog/:id',
  protect,
  authorize('admin'),
  asyncHandler(adminController.updateProduct)
);

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

router.delete(
  '/catalog/:id',
  protect,
  authorize('admin'),
  asyncHandler(adminController.deleteProduct)
);

router.get(
  '/commission',
  protect,
  authorize('admin'),
  asyncHandler(adminController.getCommissionSettings)
);

router.put(
  '/commission',
  protect,
  authorize('admin'),
  asyncHandler(adminController.updateCommissionSettings)
);

router.get(
  '/users',
  protect,
  authorize('admin'),
  asyncHandler(adminController.getAllUsers)
);

router.get(
  '/users/:id',
  protect,
  authorize('admin'),
  asyncHandler(adminController.getUserById)
);

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

router.delete(
  '/users/:id',
  protect,
  authorize('admin'),
  asyncHandler(adminController.deleteUser)
);

router.put(
  '/users/:id/status',
  [check('isActive').isBoolean().withMessage('isActive must be a boolean')],
  protect,
  authorize('admin'),
  validateRequest,
  asyncHandler(adminController.toggleUserStatus)
);

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

router.get(
  '/sell-orders',
  protect,
  authorize('admin'),
  asyncHandler(adminController.getSellOrders)
);

router.get(
  '/buy-orders',
  protect,
  authorize('admin'),
  asyncHandler(adminController.getBuyOrders)
);

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

router.get(
  '/orders/:id/partner-suggestions',
  protect,
  authorize('admin'),
  asyncHandler(adminController.getPartnerSuggestionsForOrder)
);

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

router.get(
  '/questionnaires',
  protect,
  authorize('admin'),
  asyncHandler(adminController.getConditionQuestionnaires)
);

router.get(
  '/questionnaires/:id',
  protect,
  authorize('admin'),
  asyncHandler(adminController.getConditionQuestionnaireById)
);

router.get(
  '/questionnaires/category/:category',
  protect,
  authorize('admin'),
  asyncHandler(adminController.getQuestionnairesByCategory)
);

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

router.get(
  '/agents',
  protect,
  authorize('admin'),
  asyncHandler(adminController.getAgents)
);

router.put(
  '/agents/:id/approve',
  protect,
  authorize('admin'),
  asyncHandler(adminController.approveAgent)
);

router.put(
  '/agents/:id/reject',
  [check('reason').notEmpty().withMessage('Rejection reason is required')],
  protect,
  authorize('admin'),
  validateRequest,
  asyncHandler(adminController.rejectAgent)
);

router.put(
  '/agents/:id/status',
  [check('isActive').isBoolean().withMessage('isActive must be a boolean')],
  protect,
  authorize('admin'),
  validateRequest,
  asyncHandler(adminController.toggleAgentStatus)
);

export default router;
