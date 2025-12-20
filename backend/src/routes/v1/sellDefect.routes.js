import express from 'express';

import {
  bulkCreateDefects,
  createDefect,
  deleteDefect,
  getDefect,
  getDefectCategories,
  getDefects,
  getDefectsByCategory,
  reorderDefects,
  updateDefect,
} from '../../controllers/sellDefect.controller.js';
import {
  authorize,
  isAuthenticated,
} from '../../middlewares/auth.middleware.js';

const router = express.Router();

router.get('/category/:categoryId', getDefectsByCategory);
router.get('/categories', getDefectCategories);

router.use(isAuthenticated);
router.use(authorize('admin'));

router.post('/', createDefect);
router.get('/', getDefects);
router.get('/:id', getDefect);
router.put('/:id', updateDefect);
router.delete('/:id', deleteDefect);

router.post('/bulk', bulkCreateDefects);
router.put('/reorder', reorderDefects);

export default router;
