import express from 'express';

import {
  addOption,
  createQuestion,
  deleteOption,
  deleteQuestion,
  getAllQuestions,
  getCustomerQuestions,
  getQuestion,
  getQuestions,
  reorderQuestions,
  updateOption,
  updateQuestion,
} from '../../controllers/sellQuestion.controller.js';
import {
  authorize,
  isAuthenticated,
} from '../../middlewares/auth.middleware.js';

const router = express.Router();

router.get('/customer', getCustomerQuestions);

router.use(isAuthenticated);
router.use(authorize('admin'));

router.put('/reorder', reorderQuestions);

router.post('/', createQuestion);
router.get('/all', getAllQuestions); // New paginated endpoint for admin
router.get('/', getQuestions);
router.get('/:id', getQuestion);
router.put('/:id', updateQuestion);
router.delete('/:id', deleteQuestion);

router.post('/:id/options', addOption);
router.put('/:id/options/:optionId', updateOption);
router.delete('/:id/options/:optionId', deleteOption);

export default router;
