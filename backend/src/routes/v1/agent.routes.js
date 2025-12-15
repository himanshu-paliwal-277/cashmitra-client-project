const express = require('express');
const { check } = require('express-validator');
const agentController = require('../../controllers/agent.controller');
const { protect, authorize } = require('../../middlewares/auth.middleware');
const { validateRequest } = require('../../middlewares/validation.middleware');
const { asyncHandler } = require('../../middlewares/errorHandler.middleware');
const multer = require('multer');
const path = require('path');

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
  [
    check('email').isEmail().withMessage('Please include a valid email'),
    check('password').exists().withMessage('Password is required'),
  ],
  validateRequest,
  asyncHandler(agentController.loginAgent)
);


router.use(protect);
router.use(authorize('driver', 'admin'));


router.get('/dashboard', asyncHandler(agentController.getAgentDashboard));
router.get('/stats', asyncHandler(agentController.getAgentStats));


router.get('/pickups', asyncHandler(agentController.getAssignedPickups));
router.get(
  '/pickups/:pickupId',
  asyncHandler(agentController.getPickupDetails)
);


router.put(
  '/pickups/:pickupId/start',
  asyncHandler(agentController.startPickup)
);

router.put(
  '/pickups/:pickupId/reached',
  asyncHandler(agentController.reachedDoorstep)
);


router.post(
  '/pickups/:pickupId/selfie',
  upload.single('selfie'),
  asyncHandler(agentController.uploadAgentSelfie)
);


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


router.get(
  '/pickups/:pickupId/final-price',
  asyncHandler(agentController.calculateFinalPrice)
);


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


router.post(
  '/pickups/:pickupId/customer-decision',
  [
    check('accepted').isBoolean().withMessage('Accepted status is required'),
    check('rejectionReason').optional().notEmpty(),
  ],
  validateRequest,
  asyncHandler(agentController.recordCustomerDecision)
);


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


router.post(
  '/pickups/:pickupId/signature',
  upload.single('signature'),
  asyncHandler(agentController.saveCustomerSignature)
);


router.get('/history', asyncHandler(agentController.getPickupHistory));
router.get('/completed-today', asyncHandler(agentController.getCompletedToday));


router.get('/daily-report', asyncHandler(agentController.getDailyReport));
router.post(
  '/submit-daily-report',
  asyncHandler(agentController.submitDailyReport)
);

module.exports = router;
