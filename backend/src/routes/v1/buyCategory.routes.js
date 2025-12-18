import express from 'express';

import {
  createBuyCategory,
  deleteBuyCategory,
  getBuyCategories,
  getBuyCategory,
  getBuyCategoryStats,
  updateBuyCategory,
} from '../../controllers/buyCategory.controller.js';
import {
  authorize,
  isAuthenticated,
} from '../../middlewares/auth.middleware.js';

const router = express.Router();

router.get('/', getBuyCategories);
router.get(
  '/:id',
  getBuyCategory
);

router.use(isAuthenticated);
router.use(authorize('admin'));

router.post('/', createBuyCategory);
router.put('/:id', updateBuyCategory);
router.delete(
  '/:id',
  deleteBuyCategory
);
router.get('/admin/stats', getBuyCategoryStats);

export default router;
