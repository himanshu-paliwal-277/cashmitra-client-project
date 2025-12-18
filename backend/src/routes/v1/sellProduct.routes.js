import express from 'express';

import {
  addVariant,
  createProduct,
  deleteProduct,
  deleteVariant,
  getCustomerProducts,
  getProduct,
  getProducts,
  getProductStats,
  getSellProductsByCategory,
  getVariants,
  updateProduct,
  updateVariant,
} from '../../controllers/sellProduct.controller.js';
import {
  authorize,
  isAuthenticated,
} from '../../middlewares/auth.middleware.js';

const router = express.Router();

router.get('/customer', getCustomerProducts);
router.get('/category/:category', getSellProductsByCategory);
router.get(
  '/customer/:id',
  getProduct
);

router.use(isAuthenticated);

import { attachPartner } from '../../middlewares/partner.middleware.js';

router.use(attachPartner);

router.use(authorize('admin', 'partner'));

router.post('/', createProduct);
router.get('/', getProducts);
router.get('/stats', getProductStats);
router.get(
  '/:id',
  getProduct
);
router.put('/:id', updateProduct);
router.delete(
  '/:id',
  deleteProduct
);

router.get(
  '/:id/variants',
  getVariants
);
router.post('/:id/variants', addVariant);
router.put('/:id/variants/:variantId', updateVariant);
router.delete('/:id/variants/:variantId', deleteVariant);

export default router;
