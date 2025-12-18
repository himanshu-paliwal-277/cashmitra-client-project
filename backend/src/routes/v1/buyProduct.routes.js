import express from 'express';

import {
  addProductReview,
  createBuyProduct,
  deleteBuyProduct,
  getBuyProductById,
  getBuyProducts,
  getBuyProductsByCategory,
  getBuyProductStats,
  toggleProductStatus,
  updateBuyProduct,
} from '../../controllers/buyProduct.controller.js';
import {
  authorize,
  isAuthenticated,
} from '../../middlewares/auth.middleware.js';

const router = express.Router();

router.get('/', getBuyProducts);
router.get('/stats', getBuyProductStats);
router.get('/category/:category', getBuyProductsByCategory);
router.get('/:id', getBuyProductById);

router.post('/', createBuyProduct);

router.use(isAuthenticated);

import { attachPartner } from '../../middlewares/partner.middleware.js';
router.use(attachPartner);

router.put('/:id', authorize('admin', 'partner'), updateBuyProduct);
router.delete('/:id', authorize('admin', 'partner'), deleteBuyProduct);
router.patch('/:id/toggle-status', authorize('admin'), toggleProductStatus);

router.post('/:id/reviews', addProductReview);

export default router;
