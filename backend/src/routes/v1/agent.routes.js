import express from 'express';
import multer from 'multer';
import path from 'path';

import * as agentController from '../../controllers/agent.controller.js';
import {
  authorize,
  isAuthenticated,
} from '../../middlewares/auth.middleware.js';
import {
  loginAgentSchema,
  recordCustomerDecisionSchema,
  recordPaymentSchema,
  submitDeviceInspectionSchema,
  updatePriceSchema,
  verifyIMEISchema,
  verifyOTPSchema,
} from '../../validators/agent.validation.js';
import { validate } from '../../validators/validator.js';

const router = express.Router();

const storage = multer.memoryStorage();

const upload = multer({
  storage: storage,
  limits: { fileSize: 10 * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    const allowedTypes = /jpeg|jpg|png/;
    const extname = allowedTypes.test(
      path.extname(file.originalname).toLowerCase()
    );
    const mimetype = allowedTypes.test(file.mimetype);

    if (extname && mimetype) {
      return cb(null, true);
    } else {
      cb(new Error('Only .png, .jpg and .jpeg format allowed!'));
    }
  },
});

router.post(
  '/login',
  validate(loginAgentSchema),
  agentController.loginAgent
);

router.use(isAuthenticated);
router.use(authorize('driver', 'admin'));

router.get('/dashboard', agentController.getAgentDashboard);
router.get('/stats', agentController.getAgentStats);

router.get('/pickups', agentController.getAssignedPickups);
router.get(
  '/pickups/:pickupId',
  agentController.getPickupDetails
);

router.put(
  '/pickups/:pickupId/start',
  agentController.startPickup
);

router.put(
  '/pickups/:pickupId/reached',
  agentController.reachedDoorstep
);

router.post(
  '/pickups/:pickupId/selfie',
  upload.single('selfie'),
  agentController.uploadAgentSelfie
);

router.post(
  '/pickups/:pickupId/send-otp',
  agentController.sendCustomerOTP
);

router.post(
  '/pickups/:pickupId/verify-otp',
  validate(verifyOTPSchema),
  agentController.verifyCustomerOTP
);

router.post(
  '/pickups/:pickupId/device-photos',
  upload.fields([
    { name: 'backImage', maxCount: 1 },
    { name: 'frontImage', maxCount: 1 },
    { name: 'edge1', maxCount: 1 },
    { name: 'edge2', maxCount: 1 },
    { name: 'edge3', maxCount: 1 },
    { name: 'edge4', maxCount: 1 },
  ]),
  agentController.uploadDevicePhotos
);

router.post(
  '/pickups/:pickupId/imei',
  validate(verifyIMEISchema),
  agentController.verifyIMEI
);

router.post(
  '/pickups/:pickupId/inspection',
  validate(submitDeviceInspectionSchema),
  agentController.submitDeviceInspection
);

router.get(
  '/pickups/:pickupId/final-price',
  agentController.calculateFinalPrice
);

router.put(
  '/pickups/:pickupId/price',
  validate(updatePriceSchema),
  agentController.updatePrice
);

router.post(
  '/pickups/:pickupId/customer-decision',
  validate(recordCustomerDecisionSchema),
  agentController.recordCustomerDecision
);

router.post(
  '/pickups/:pickupId/payment',
  validate(recordPaymentSchema),
  agentController.recordPayment
);

router.post(
  '/pickups/:pickupId/send-final-otp',
  agentController.sendFinalOTP
);

router.post(
  '/pickups/:pickupId/verify-final-otp',
  validate(verifyOTPSchema),
  agentController.verifyFinalOTP
);

router.post(
  '/pickups/:pickupId/complete',
  agentController.completePickup
);

router.post(
  '/pickups/:pickupId/signature',
  upload.single('signature'),
  agentController.saveCustomerSignature
);

router.get('/history', agentController.getPickupHistory);
router.get('/completed-today', agentController.getCompletedToday);

router.get('/daily-report', agentController.getDailyReport);
router.post(
  '/submit-daily-report',
  agentController.submitDailyReport
);

export default router;
