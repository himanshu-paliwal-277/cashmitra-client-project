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
  toggleProductStatus,
} = require('../../controllers/buyProduct.controller');
const { protect, authorize } = require('../../middlewares/auth.middleware');
const {
  validateCreateBuyProduct,
  validateUpdateBuyProduct,
  handleValidationErrors,
} = require('../../middlewares/buyProductValidation.middleware');

const router = express.Router();


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
    .withMessage('Reviewer name must be between 2 and 50 characters'),
];


router.get('/', getBuyProducts);
router.get('/stats', getBuyProductStats);
router.get('/category/:category', getBuyProductsByCategory);
router.get('/:id', getBuyProductById);


router.post(
  '/',
  validateCreateBuyProduct,
  handleValidationErrors,
  createBuyProduct
);


router.use(protect);


const { attachPartner } = require('../../middlewares/partner.middleware');
router.use(attachPartner);


router.put(
  '/:id',
  authorize('admin', 'partner'),
  validateUpdateBuyProduct,
  handleValidationErrors,
  updateBuyProduct
);
router.delete('/:id', authorize('admin', 'partner'), deleteBuyProduct);
router.patch('/:id/toggle-status', authorize('admin'), toggleProductStatus);


router.post('/:id/reviews', validateProductReview, addProductReview);

module.exports = router;
