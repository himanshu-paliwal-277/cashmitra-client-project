import express from 'express';

import {
  bulkUpdateStatus,
  createCategory,
  deleteCategory,
  getCategories,
  getCategory,
  getCategoryStats,
  searchCategories,
  updateCategory,
} from '../../controllers/category.controller.js';
import {
  authorize,
  isAuthenticated,
} from '../../middlewares/auth.middleware.js';

const router = express.Router();

router.get('/search', searchCategories);
router.get('/', getCategories);
router.get('/:identifier', getCategory);

router.use(isAuthenticated);
router.use(authorize('admin'));

router.post('/', createCategory);
router.put('/:id', updateCategory);
router.delete('/:id', deleteCategory);
router.get('/admin/stats', getCategoryStats);
router.patch('/bulk-status', bulkUpdateStatus);

export default router;
