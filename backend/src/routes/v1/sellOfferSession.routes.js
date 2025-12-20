import express from 'express';

import {
  cleanupExpiredSessions,
  createSession,
  deleteSession,
  extendSession,
  getAllSessions,
  getCurrentPrice,
  getSession,
  getUserSessions,
  updateAccessories,
  updateAnswers,
  updateDefects,
  updateSessionStatus,
} from '../../controllers/sellOfferSession.controller.js';
import {
  authorize,
  isAuthenticated,
} from '../../middlewares/auth.middleware.js';

const router = express.Router();

router.post('/create', createSession);
router.get('/:sessionId', getSession);
router.get('/:sessionId/price', getCurrentPrice);

router.use(isAuthenticated);

router.post('/', createSession);
router.get('/my-sessions', getUserSessions);
router.put('/:sessionId/answers', updateAnswers);
router.put('/:sessionId/defects', updateDefects);
router.put('/:sessionId/accessories', updateAccessories);
router.post('/:sessionId/extend', extendSession);
router.delete('/:sessionId', deleteSession);

router.get('/admin/all', authorize('admin'), getAllSessions);
router.patch(
  '/admin/:sessionId/status',
  authorize('admin'),
  updateSessionStatus
);
router.post('/admin/cleanup', authorize('admin'), cleanupExpiredSessions);

export default router;
