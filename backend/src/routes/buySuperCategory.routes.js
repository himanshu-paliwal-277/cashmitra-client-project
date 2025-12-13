const express = require('express');
const router = express.Router();
const buySuperCategoryController = require('../controllers/buySuperCategory.controller');
const { protect, authorize } = require('../middlewares/auth.middleware');

// Public route: Get active super categories
router.get('/public', buySuperCategoryController.getPublicSuperCategories);

// Public route: Get categories by super category
router.get('/public/:id/categories', buySuperCategoryController.getPublicCategoriesBySuperCategory);

// Protect all routes
router.use(protect);

// Admin only routes
router.use(authorize('admin'));

// Get all super categories
router.get('/', buySuperCategoryController.getAllSuperCategories);

// Get categories by super category (must be before /:id route)
router.get(
  '/:id/categories',
  buySuperCategoryController.getCategoriesBySuperCategory
);

// Get single super category
router.get('/:id', buySuperCategoryController.getSuperCategory);

// Create super category (expects image URL in body)
router.post('/', buySuperCategoryController.createSuperCategory);

// Update super category (expects image URL in body)
router.put('/:id', buySuperCategoryController.updateSuperCategory);

// Delete super category
router.delete('/:id', buySuperCategoryController.deleteSuperCategory);

module.exports = router;
