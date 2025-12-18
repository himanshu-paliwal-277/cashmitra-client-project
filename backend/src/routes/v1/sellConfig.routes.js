import express from 'express';

import {
  createOrUpdateConfig,
  deleteConfig,
  getConfig,
  getCustomerConfig,
  resetToDefault,
  testPricing,
  updateRules,
  updateSteps,
} from '../../controllers/sellConfig.controller.js';
import {
  authorize,
  isAuthenticated,
} from '../../middlewares/auth.middleware.js';

const router = express.Router();

router.get('/customer/:productId', getCustomerConfig);

router.use(isAuthenticated);
router.use(authorize('admin'));

router.post('/', createOrUpdateConfig);
router.get('/:productId', getConfig);
router.delete('/:productId', deleteConfig);

router.put('/:productId/steps', updateSteps);
router.put('/:productId/rules', updateRules);

router.post('/:productId/reset', resetToDefault);

router.post('/:productId/test-pricing', testPricing);

export default router;
