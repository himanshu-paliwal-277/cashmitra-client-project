import express from 'express';

import {
  createProduct,
  deleteProduct,
  getProduct,
  getProductBrands,
  getProductCategories,
  getProductFilters,
  getProducts,
  getProductSuggestions,
  updateProduct,
} from '../../controllers/product.controller.js';
import { isAuthenticated } from '../../middlewares/auth.middleware.js';

const router = express.Router();

router.get('/', getProducts);
router.get('/categories', getProductCategories);
router.get('/brands', getProductBrands);
router.get('/filters', getProductFilters);
router.get('/:id', getProduct);
router.get('/:id/suggestions', getProductSuggestions);

router.post('/', isAuthenticated, createProduct);
router.put('/:id', isAuthenticated, updateProduct);
router.delete('/:id', isAuthenticated, deleteProduct);

export default router;
