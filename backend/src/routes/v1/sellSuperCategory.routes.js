const express = require('express');
const router = express.Router();
const sellSuperCategoryController = require('../../controllers/sellSuperCategory.controller');
const { protect, authorize } = require('../../middlewares/auth.middleware');

// Public route - must be before auth middleware
router.get('/public', sellSuperCategoryController.getPublicSuperCategories);

// Protect all routes after this
router.use(protect);

// Admin only routes
router.use(authorize('admin'));

// Get all super categories
router.get('/', sellSuperCategoryController.getAllSuperCategories);

// Get categories by super category (must be before /:id route)
router.get(
  '/:id/categories',
  sellSuperCategoryController.getCategoriesBySuperCategory
);

// Get single super category
router.get('/:id', sellSuperCategoryController.getSuperCategory);

// Create super category (expects image URL in body)
router.post('/', sellSuperCategoryController.createSuperCategory);

// Update super category (expects image URL in body)
router.put('/:id', sellSuperCategoryController.updateSuperCategory);

// Delete super category
router.delete('/:id', sellSuperCategoryController.deleteSuperCategory);

module.exports = router;
