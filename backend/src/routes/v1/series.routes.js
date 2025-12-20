import express from 'express';

import {
  createSeries,
  deleteSeries,
  getSeries,
  getSeriesById,
  updateSeries,
} from '../../controllers/series.controller.js';
import {
  authorize,
  isAuthenticated,
} from '../../middlewares/auth.middleware.js';

const router = express.Router();

router.get('/', getSeries);
router.get('/:id', isAuthenticated, getSeriesById);
router.post('/', isAuthenticated, authorize('admin'), createSeries);
router.put('/:id', isAuthenticated, authorize('admin'), updateSeries);
router.delete('/:id', isAuthenticated, authorize('admin'), deleteSeries);

export default router;
