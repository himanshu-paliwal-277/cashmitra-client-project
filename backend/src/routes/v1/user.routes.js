import express from 'express';

import * as userController from '../../controllers/user.controller.js';
import { isAuthenticated } from '../../middlewares/auth.middleware.js';
import {
  addAddressSchema,
  updateAddressSchema,
  updateUserProfileSchema,
} from '../../validators/user.validation.js';
import { validate } from '../../validators/validator.js';

const router = express.Router();

router.use(isAuthenticated);

router.get('/profile', userController.getUserProfile);

router.put(
  '/profile',
  validate(updateUserProfileSchema),
  userController.updateUserProfile
);

router.get('/orders', userController.getUserOrders);

router.get('/orders/:id', userController.getOrderById);

router.get('/addresses', userController.getUserAddresses);

router.post(
  '/addresses',
  validate(addAddressSchema),
  userController.addAddress
);

router.put(
  '/addresses/:id',
  validate(updateAddressSchema),
  userController.updateAddress
);

router.delete('/addresses/:id', userController.deleteAddress);

router.put(
  '/addresses/:id/default',
  userController.setDefaultAddress
);

export default router;
