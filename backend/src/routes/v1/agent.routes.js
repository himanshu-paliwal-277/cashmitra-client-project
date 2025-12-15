const express = require('express');
const { check } = require('express-validator');
const agentController = require('../../controllers/agent.controller');
const { protect, authorize } = require('../../middlewares/auth.middleware');
const { validateRequest } = require('../../middlewares/validation.middleware');
const { asyncHandler } = require('../../middlewares/errorHandler.middleware');
const multer = require('multer');
const path = require('path');

const router = express.Router();

// Configure multer for image uploads (using memory storage for Cloudinary)
const storage = multer.memoryStorage();

const upload = multer({
  storage: storage,
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB limit
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

// Agent Authentication
router.post(
  '/login',
  [
    check('email').isEmail().withMessage('Please include a valid email'),
    check('password').exists().withMessage('Password is required'),
  ],
  validateRequest,
  asyncHandler(agentController.loginAgent)
);

// Protected routes - require agent authentication
router.use(protect);
router.use(authorize('driver', 'admin'));

// Dashboard & Statistics
router.get('/dashboard', asyncHandler(agentController.getAgentDashboard));
router.get('/stats', asyncHandler(agentController.getAgentStats));

// Pickup Management
router.get('/pickups', asyncHandler(agentController.getAssignedPickups));
router.get(
  '/pickups/:pickupId',
  asyncHandler(agentController.getPickupDetails)
);

// Pickup Status Updates
router.put(
  '/pickups/:pickupId/start',
  asyncHandler(agentController.startPickup)
);

router.put(
  '/pickups/:pickupId/reached',
  asyncHandler(agentController.reachedDoorstep)
);

// Agent Selfie Verification
router.post(
  '/pickups/:pickupId/selfie',
  upload.single('selfie'),
  asyncHandler(agentController.uploadAgentSelfie)
);

// OTP Verification (Customer)
router.post(
  '/pickups/:pickupId/send-otp',
  asyncHandler(agentController.sendCustomerOTP)
);

router.post(
  '/pickups/:pickupId/verify-otp',
  [
    check('otp')
      .isLength({ min: 6, max: 6 })
      .withMessage('OTP must be 6 digits'),
  ],
  validateRequest,
  asyncHandler(agentController.verifyCustomerOTP)
);

// Device Photo Upload
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
  asyncHandler(agentController.uploadDevicePhotos)
);

// IMEI Verification
router.post(
  '/pickups/:pickupId/imei',
  [
    check('imei1')
      .isLength({ min: 15, max: 15 })
      .withMessage('IMEI 1 must be 15 digits'),
    check('imei2')
      .optional()
      .isLength({ min: 15, max: 15 })
      .withMessage('IMEI 2 must be 15 digits'),
  ],
  validateRequest,
  asyncHandler(agentController.verifyIMEI)
);

// Device Inspection
router.post(
  '/pickups/:pickupId/inspection',
  [
    check('inspectionData')
      .isObject()
      .withMessage('Inspection data is required'),
    check('inspectionData.screenCondition')
      .notEmpty()
      .withMessage('Screen condition is required'),
    check('inspectionData.sim1Working')
      .isBoolean()
      .withMessage('SIM 1 status is required'),
    check('inspectionData.sim2Working').optional().isBoolean(),
  ],
  validateRequest,
  asyncHandler(agentController.submitDeviceInspection)
);

// Final Price Calculation
router.get(
  '/pickups/:pickupId/final-price',
  asyncHandler(agentController.calculateFinalPrice)
);

// Update Price (if issues found)
router.put(
  '/pickups/:pickupId/price',
  [
    check('adjustedPrice')
      .isNumeric()
      .withMessage('Adjusted price must be a number'),
    check('reason')
      .notEmpty()
      .withMessage('Reason for price adjustment is required'),
  ],
  validateRequest,
  asyncHandler(agentController.updatePrice)
);

// Customer Acceptance/Rejection
router.post(
  '/pickups/:pickupId/customer-decision',
  [
    check('accepted').isBoolean().withMessage('Accepted status is required'),
    check('rejectionReason').optional().notEmpty(),
  ],
  validateRequest,
  asyncHandler(agentController.recordCustomerDecision)
);

// Payment Recording
router.post(
  '/pickups/:pickupId/payment',
  [
    check('amount').isNumeric().withMessage('Payment amount is required'),
    check('method')
      .isIn(['cash', 'upi', 'neft', 'bank_transfer'])
      .withMessage('Invalid payment method'),
    check('transactionId').optional().notEmpty(),
  ],
  validateRequest,
  asyncHandler(agentController.recordPayment)
);

// Final OTP & Complete Pickup
router.post(
  '/pickups/:pickupId/send-final-otp',
  asyncHandler(agentController.sendFinalOTP)
);

router.post(
  '/pickups/:pickupId/verify-final-otp',
  [
    check('otp')
      .isLength({ min: 6, max: 6 })
      .withMessage('OTP must be 6 digits'),
  ],
  validateRequest,
  asyncHandler(agentController.verifyFinalOTP)
);

router.post(
  '/pickups/:pickupId/complete',
  asyncHandler(agentController.completePickup)
);

// Digital Signature
router.post(
  '/pickups/:pickupId/signature',
  upload.single('signature'),
  asyncHandler(agentController.saveCustomerSignature)
);

// Pickup History
router.get('/history', asyncHandler(agentController.getPickupHistory));
router.get('/completed-today', asyncHandler(agentController.getCompletedToday));

// Daily Report
router.get('/daily-report', asyncHandler(agentController.getDailyReport));
router.post(
  '/submit-daily-report',
  asyncHandler(agentController.submitDailyReport)
);

module.exports = router;
