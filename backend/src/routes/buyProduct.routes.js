const express = require('express');
const { body } = require('express-validator');
const {
  getBuyProducts,
  getBuyProductById,
  getBuyProductsByCategory,
  createBuyProduct,
  updateBuyProduct,
  deleteBuyProduct,
  getBuyProductStats,
  addProductReview,
  toggleProductStatus
} = require('../controllers/buyProduct.controller');
const { protect, authorize } = require('../middlewares/auth.middleware');
const {
  validateCreateBuyProduct,
  validateUpdateBuyProduct,
  handleValidationErrors
} = require('../middlewares/buyProductValidation.middleware');

const router = express.Router();

// Validation middleware for product reviews
const validateProductReview = [
  body('rating')
    .isInt({ min: 1, max: 5 })
    .withMessage('Rating must be between 1 and 5'),
  body('comment')
    .optional()
    .trim()
    .isLength({ max: 500 })
    .withMessage('Comment must not exceed 500 characters'),
  body('reviewer')
    .optional()
    .trim()
    .isLength({ min: 2, max: 50 })
    .withMessage('Reviewer name must be between 2 and 50 characters')
];

// Public routes (no authentication required)
router.get('/', getBuyProducts);
router.get('/stats', getBuyProductStats);
router.get('/category/:category', getBuyProductsByCategory);
router.get('/:id', getBuyProductById);

// Temporarily moved POST route for testing (no authentication)
router.post('/', validateCreateBuyProduct, handleValidationErrors, createBuyProduct);

// Protected routes (authentication required)
router.use(protect);

// 🔒 Import and apply partner middleware for data isolation
const { attachPartner } = require('../middlewares/partner.middleware');
router.use(attachPartner);

// Admin and Partner routes (both can manage buy products)
router.put('/:id', authorize('admin', 'partner'), validateUpdateBuyProduct, handleValidationErrors, updateBuyProduct);
router.delete('/:id', authorize('admin', 'partner'), deleteBuyProduct);
router.patch('/:id/toggle-status', authorize('admin'), toggleProductStatus);

// Review routes (authenticated users can add reviews)
router.post('/:id/reviews', validateProductReview, addProductReview);

module.exports = router;