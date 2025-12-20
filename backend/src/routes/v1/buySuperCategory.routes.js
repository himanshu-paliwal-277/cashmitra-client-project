import express from 'express';
const router = express.Router();
import * as buySuperCategoryController from '../../controllers/buySuperCategory.controller.js';
import {
  authorize,
  isAuthenticated,
} from '../../middlewares/auth.middleware.js';

router.get('/public', buySuperCategoryController.getPublicSuperCategories);

router.get(
  '/public/:id/categories',
  buySuperCategoryController.getPublicCategoriesBySuperCategory
);

router.use(isAuthenticated);

router.use(authorize('admin'));

router.get('/', buySuperCategoryController.getAllSuperCategories);

router.get(
  '/:id/categories',
  buySuperCategoryController.getCategoriesBySuperCategory
);

router.get('/:id', buySuperCategoryController.getSuperCategory);

router.post('/', buySuperCategoryController.createSuperCategory);

router.put('/:id', buySuperCategoryController.updateSuperCategory);

router.delete('/:id', buySuperCategoryController.deleteSuperCategory);

export default router;
