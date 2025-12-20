import express from 'express';

import { upload } from '../../config/multerConfig.js';
import * as adminController from '../../controllers/admin.controller.js';
import * as categoryController from '../../controllers/category.controller.js';
import {
  authorize,
  isAuthenticated,
} from '../../middlewares/auth.middleware.js';
import {
  addProductSchema,
  assignPartnerToOrderSchema,
  createAdminSchema,
  createBrandSchema,
  createCategorySchema,
  createModelSchema,
  createPartnerSchema,
  createQuestionnaireSchema,
  createUserSchema,
  deleteQuestionnaireSchema,
  loginAdminSchema,
  rejectAgentSchema,
  toggleAgentStatusSchema,
  toggleUserStatusSchema,
  updateBrandSchema,
  updateCategorySchema,
  updateModelSchema,
  updateOrderStatusSchema,
  updatePartnerSchema,
  updatePartnerWalletSchema,
  updateProductStatusSchema,
  updateQuestionnaireSchema,
  updateUserPasswordSchema,
  updateUserSchema,
  verifyPartnerSchema,
} from '../../validators/admin.validation.js';
import { validate } from '../../validators/validator.js';

const router = express.Router();

router.post(
  '/login',
  validate(loginAdminSchema),
  (req, res, next) => {
    req.skipCSRF = true;
    next();
  },
  adminController.loginAdmin
);

router.get(
  '/profile',
  isAuthenticated,
  authorize('admin'),
  adminController.getAdminProfile
);

router.post(
  '/create',
  isAuthenticated,
  authorize('admin'),
  validate(createAdminSchema),
  adminController.createAdmin
);

router.get(
  '/partners',
  isAuthenticated,
  authorize('admin'),
  adminController.getAllPartners
);

router.get(
  '/partners/:id',
  isAuthenticated,
  authorize('admin'),
  adminController.getPartnerById
);

router.post(
  '/partners',
  isAuthenticated,
  authorize('admin'),
  validate(createPartnerSchema),
  adminController.createPartner
);

router.put(
  '/partners/:id',
  isAuthenticated,
  authorize('admin'),
  validate(updatePartnerSchema),
  adminController.updatePartner
);

router.delete(
  '/partners/:id',
  isAuthenticated,
  authorize('admin'),
  adminController.deletePartner
);

router.put(
  '/partners/:id/verify',
  isAuthenticated,
  authorize('admin'),
  validate(verifyPartnerSchema),
  adminController.verifyPartner
);

router.post(
  '/partners/:id/wallet/update',
  isAuthenticated,
  authorize('admin'),
  validate(updatePartnerWalletSchema),
  adminController.updatePartnerWallet
);

router.get(
  '/orders',
  isAuthenticated,
  authorize('admin'),
  adminController.getAllOrders
);

router.get(
  '/orders/:id',
  isAuthenticated,
  authorize('admin'),
  adminController.getOrderById
);

router.get(
  '/analytics',
  isAuthenticated,
  authorize('admin'),
  adminController.getDashboardAnalytics
);

router.get(
  '/catalog',
  isAuthenticated,
  authorize('admin'),
  adminController.getCatalog
);

router.get(
  '/catalog/:id',
  isAuthenticated,
  authorize('admin'),
  adminController.getProductById
);

router.post(
  '/catalog/upload-images',
  isAuthenticated,
  authorize('admin'),
  upload.array('images', 10),
  adminController.uploadProductImages
);

router.post(
  '/catalog',
  isAuthenticated,
  authorize('admin'),
  validate(addProductSchema),
  adminController.addProduct
);

router.put(
  '/catalog/:id',
  isAuthenticated,
  authorize('admin'),
  adminController.updateProduct
);

router.patch(
  '/catalog/:id/status',
  isAuthenticated,
  authorize('admin'),
  validate(updateProductStatusSchema),
  adminController.updateProductStatus
);

router.delete(
  '/catalog/:id',
  isAuthenticated,
  authorize('admin'),
  adminController.deleteProduct
);

router.get(
  '/commission',
  isAuthenticated,
  authorize('admin'),
  adminController.getCommissionSettings
);

router.put(
  '/commission',
  isAuthenticated,
  authorize('admin'),
  adminController.updateCommissionSettings
);

router.get(
  '/users',
  isAuthenticated,
  authorize('admin'),
  adminController.getAllUsers
);

router.get(
  '/users/:id',
  isAuthenticated,
  authorize('admin'),
  adminController.getUserById
);

router.post(
  '/users',
  isAuthenticated,
  authorize('admin'),
  validate(createUserSchema),
  adminController.createUser
);

router.put(
  '/users/:id',
  isAuthenticated,
  authorize('admin'),
  validate(updateUserSchema),
  adminController.updateUser
);

router.put(
  '/users/:id/password',
  isAuthenticated,
  authorize('admin'),
  validate(updateUserPasswordSchema),
  adminController.updateUserPassword
);

router.delete(
  '/users/:id',
  isAuthenticated,
  authorize('admin'),
  adminController.deleteUser
);

router.put(
  '/users/:id/status',
  isAuthenticated,
  authorize('admin'),
  validate(toggleUserStatusSchema),
  adminController.toggleUserStatus
);

router.get('/categories', categoryController.getCategories);

router.post(
  '/categories',
  isAuthenticated,
  authorize('admin'),
  validate(createCategorySchema),
  categoryController.createCategory
);

router.get(
  '/categories/:id',
  isAuthenticated,
  authorize('admin'),
  categoryController.getCategory
);

router.put(
  '/categories/:id',
  isAuthenticated,
  authorize('admin'),
  validate(updateCategorySchema),
  categoryController.updateCategory
);

router.delete(
  '/categories/:id',
  isAuthenticated,
  authorize('admin'),
  categoryController.deleteCategory
);

router.get(
  '/categories/admin/stats',
  isAuthenticated,
  authorize('admin'),
  categoryController.getCategoryStats
);

router.get(
  '/sell-orders',
  isAuthenticated,
  authorize('admin'),
  adminController.getSellOrders
);

router.get(
  '/buy-orders',
  isAuthenticated,
  authorize('admin'),
  adminController.getBuyOrders
);

router.put(
  '/orders/:id/status',
  isAuthenticated,
  authorize('admin'),
  validate(updateOrderStatusSchema),
  adminController.updateOrderStatus
);

router.get(
  '/orders/:id/partner-suggestions',
  isAuthenticated,
  authorize('admin'),
  adminController.getPartnerSuggestionsForOrder
);

router.put(
  '/orders/:id/assign-partner',
  isAuthenticated,
  authorize('admin'),
  validate(assignPartnerToOrderSchema),
  adminController.assignPartnerToOrder
);

router.get(
  '/brands',
  isAuthenticated,
  authorize('admin'),
  adminController.getBrands
);

router.post(
  '/brands',
  isAuthenticated,
  authorize('admin'),
  validate(createBrandSchema),
  adminController.createBrand
);

router.put(
  '/brands/:brandName',
  isAuthenticated,
  authorize('admin'),
  validate(updateBrandSchema),
  adminController.updateBrand
);

router.delete(
  '/brands/:brandName',
  isAuthenticated,
  authorize('admin'),
  adminController.deleteBrand
);

router.get(
  '/models',
  isAuthenticated,
  authorize('admin'),
  adminController.getModels
);

router.post(
  '/models',
  isAuthenticated,
  authorize('admin'),
  validate(createModelSchema),
  adminController.createModel
);

router.put(
  '/models/:modelName',
  isAuthenticated,
  authorize('admin'),
  validate(updateModelSchema),
  adminController.updateModelByName
);

router.delete(
  '/models/:modelName',
  isAuthenticated,
  authorize('admin'),
  adminController.deleteModelByName
);

router.get(
  '/questionnaires',
  isAuthenticated,
  authorize('admin'),
  adminController.getConditionQuestionnaires
);

router.get(
  '/questionnaires/:id',
  isAuthenticated,
  authorize('admin'),
  adminController.getConditionQuestionnaireById
);

router.get(
  '/questionnaires/category/:category',
  isAuthenticated,
  authorize('admin'),
  adminController.getQuestionnairesByCategory
);

router.post(
  '/questionnaires',
  isAuthenticated,
  authorize('admin'),
  validate(createQuestionnaireSchema),
  adminController.createConditionQuestionnaire
);

router.put(
  '/questionnaires/:id',
  isAuthenticated,
  authorize('admin'),
  validate(updateQuestionnaireSchema),
  adminController.updateConditionQuestionnaire
);

router.delete(
  '/questionnaires/:id',
  isAuthenticated,
  authorize('admin'),
  validate(deleteQuestionnaireSchema),
  adminController.deleteConditionQuestionnaire
);

router.get(
  '/agents',
  isAuthenticated,
  authorize('admin'),
  adminController.getAgents
);

router.put(
  '/agents/:id/approve',
  isAuthenticated,
  authorize('admin'),
  adminController.approveAgent
);

router.put(
  '/agents/:id/reject',
  isAuthenticated,
  authorize('admin'),
  validate(rejectAgentSchema),
  adminController.rejectAgent
);

router.put(
  '/agents/:id/status',
  isAuthenticated,
  authorize('admin'),
  validate(toggleAgentStatusSchema),
  adminController.toggleAgentStatus
);

export default router;
