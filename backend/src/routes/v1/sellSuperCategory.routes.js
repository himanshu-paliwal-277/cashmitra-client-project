const express = require('express');
const router = express.Router();
const sellSuperCategoryController = require('../../controllers/sellSuperCategory.controller');
const { protect, authorize } = require('../../middlewares/auth.middleware');


router.get('/public', sellSuperCategoryController.getPublicSuperCategories);


router.use(protect);


router.use(authorize('admin'));


router.get('/', sellSuperCategoryController.getAllSuperCategories);


router.get(
  '/:id/categories',
  sellSuperCategoryController.getCategoriesBySuperCategory
);


router.get('/:id', sellSuperCategoryController.getSuperCategory);


router.post('/', sellSuperCategoryController.createSuperCategory);


router.put('/:id', sellSuperCategoryController.updateSuperCategory);


router.delete('/:id', sellSuperCategoryController.deleteSuperCategory);

module.exports = router;
