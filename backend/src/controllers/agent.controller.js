const Pickup = require('../models/pickup.model');
const SellOrder = require('../models/sellOrder.model');
const User = require('../models/user.model');
const { generateToken } = require('../utils/jwt.utils');
const { sendOTPEmail, sendOTPSMS } = require('../utils/notification.utils');
const cloudinary = require('../config/cloudinary.config');
const crypto = require('crypto');

// Store OTPs temporarily (In production, use Redis)
const otpStore = new Map();

/**
 * @desc    Agent Login
 * @route   POST /api/agent/login
 * @access  Public
 */
exports.loginAgent = async (req, res) => {
  const { email, password } = req.body;

  // Find user with driver role
  const user = await User.findOne({ email, role: 'driver' }).select(
    '+password'
  );

  if (!user) {
    return res.status(401).json({
      success: false,
      message:
        'Invalid credentials. Please contact admin if you are a field agent.',
    });
  }

  // Check password
  if (!(await user.matchPassword(password))) {
    return res.status(401).json({
      success: false,
      message: 'Invalid credentials',
    });
  }

  res.json({
    success: true,
    data: {
      _id: user._id,
      name: user.name,
      email: user.email,
      phone: user.phone,
      role: user.role,
      profileImage: user.profileImage,
      token: generateToken(user._id, user.role),
    },
  });
};

/**
 * @desc    Get Agent Dashboard
 * @route   GET /api/agent/dashboard
 * @access  Private (Agent)
 */
exports.getAgentDashboard = async (req, res) => {
  const agentId = req.user._id;
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  // Get today's statistics (using correct Pickup model statuses)
  const [pending, inProgress, completed, todayEarnings] = await Promise.all([
    Pickup.countDocuments({
      assignedTo: agentId,
      status: { $in: ['scheduled', 'confirmed'] },
      scheduledDate: { $gte: today },
    }),
    Pickup.countDocuments({
      assignedTo: agentId,
      status: 'in_transit',
      scheduledDate: { $gte: today },
    }),
    Pickup.countDocuments({
      assignedTo: agentId,
      status: 'completed',
      updatedAt: { $gte: today },
    }),
    Pickup.aggregate([
      {
        $match: {
          assignedTo: agentId,
          status: 'completed',
          updatedAt: { $gte: today },
        },
      },
      {
        $group: {
          _id: null,
          totalEarnings: { $sum: '$agentCommission' },
        },
      },
    ]),
  ]);

  res.json({
    success: true,
    data: {
      summary: {
        pending,
        inProgress,
        completed,
        earnings: todayEarnings[0]?.totalEarnings || 0,
      },
    },
  });
};

/**
 * @desc    Get Agent Stats
 * @route   GET /api/agent/stats
 * @access  Private (Agent)
 */
exports.getAgentStats = async (req, res) => {
  const agentId = req.user._id;

  const stats = await Pickup.aggregate([
    { $match: { assignedTo: agentId } },
    {
      $group: {
        _id: '$status',
        count: { $sum: 1 },
      },
    },
  ]);

  res.json({
    success: true,
    data: { stats },
  });
};

/**
 * @desc    Get Assigned Pickups
 * @route   GET /api/agent/pickups
 * @access  Private (Agent)
 */
exports.getAssignedPickups = async (req, res) => {
  const agentId = req.user._id;
  const { status, date } = req.query;

  const filter = { assignedTo: agentId };

  if (status) {
    filter.status = status;
  } else {
    // Default: show only active pickups (using correct Pickup model statuses)
    filter.status = {
      $in: ['scheduled', 'confirmed', 'in_transit'],
    };
  }

  if (date) {
    const targetDate = new Date(date);
    targetDate.setHours(0, 0, 0, 0);
    const nextDay = new Date(targetDate);
    nextDay.setDate(nextDay.getDate() + 1);

    filter.scheduledDate = {
      $gte: targetDate,
      $lt: nextDay,
    };
  }

  const pickups = await Pickup.find(filter)
    .populate('orderId', 'orderNumber deviceDetails estimatedPrice')
    .populate('assignedTo', 'name email phone')
    .sort({ scheduledDate: 1, scheduledTimeSlot: 1 });

  res.json({
    success: true,
    data: { pickups },
  });
};

/**
 * @desc    Get Pickup Details
 * @route   GET /api/agent/pickups/:pickupId
 * @access  Private (Agent)
 */
exports.getPickupDetails = async (req, res) => {
  const { pickupId } = req.params;
  const agentId = req.user._id;

  const pickup = await Pickup.findOne({
    _id: pickupId,
    assignedTo: agentId,
  })
    .populate('orderId')
    .populate('assignedTo', 'name email phone');

  if (!pickup) {
    return res.status(404).json({
      success: false,
      message: 'Pickup not found or not assigned to you',
    });
  }

  res.json({
    success: true,
    data: { pickup },
  });
};

/**
 * @desc    Start Pickup Journey
 * @route   PUT /api/agent/pickups/:pickupId/start
 * @access  Private (Agent)
 */
exports.startPickup = async (req, res) => {
  const { pickupId } = req.params;
  const agentId = req.user._id;

  const pickup = await Pickup.findOne({
    _id: pickupId,
    assignedTo: agentId,
    status: 'agent_assigned',
  });

  if (!pickup) {
    return res.status(404).json({
      success: false,
      message: 'Pickup not found or already started',
    });
  }

  pickup.status = 'agent_on_way';
  pickup.statusHistory.push({
    status: 'agent_on_way',
    timestamp: new Date(),
    updatedBy: agentId,
    note: 'Agent started journey to customer location',
  });

  await pickup.save();

  // TODO: Send notification to customer

  res.json({
    success: true,
    message: 'Pickup started successfully',
    data: { pickup },
  });
};

/**
 * @desc    Mark as Reached Doorstep
 * @route   PUT /api/agent/pickups/:pickupId/reached
 * @access  Private (Agent)
 */
exports.reachedDoorstep = async (req, res) => {
  const { pickupId } = req.params;
  const agentId = req.user._id;

  const pickup = await Pickup.findOne({
    _id: pickupId,
    assignedTo: agentId,
    status: 'agent_on_way',
  });

  if (!pickup) {
    return res.status(404).json({
      success: false,
      message: 'Pickup not found or invalid status',
    });
  }

  pickup.status = 'agent_arrived';
  pickup.statusHistory.push({
    status: 'agent_arrived',
    timestamp: new Date(),
    updatedBy: agentId,
    note: 'Agent reached customer doorstep',
  });

  await pickup.save();

  res.json({
    success: true,
    message: 'Marked as reached doorstep',
    data: { pickup },
  });
};

/**
 * @desc    Upload Agent Selfie (Face Detection)
 * @route   POST /api/agent/pickups/:pickupId/selfie
 * @access  Private (Agent)
 */
exports.uploadAgentSelfie = async (req, res) => {
  const { pickupId } = req.params;
  const agentId = req.user._id;

  if (!req.file) {
    return res.status(400).json({
      success: false,
      message: 'Selfie image is required',
    });
  }

  const pickup = await Pickup.findOne({
    _id: pickupId,
    assignedTo: agentId,
  });

  if (!pickup) {
    return res.status(404).json({
      success: false,
      message: 'Pickup not found',
    });
  }

  // Upload to Cloudinary
  const result = await cloudinary.uploader.upload(req.file.path, {
    folder: 'cashify/agent-selfies',
    transformation: [{ width: 500, height: 500, crop: 'fill' }],
  });

  pickup.agentVerification = {
    selfieUrl: result.secure_url,
    verifiedAt: new Date(),
    agentId: agentId,
  };

  await pickup.save();

  res.json({
    success: true,
    message: 'Selfie uploaded successfully',
    data: {
      selfieUrl: result.secure_url,
    },
  });
};

/**
 * @desc    Send OTP to Customer
 * @route   POST /api/agent/pickups/:pickupId/send-otp
 * @access  Private (Agent)
 */
exports.sendCustomerOTP = async (req, res) => {
  const { pickupId } = req.params;
  const agentId = req.user._id;

  const pickup = await Pickup.findOne({
    _id: pickupId,
    assignedTo: agentId,
  });

  if (!pickup) {
    return res.status(404).json({
      success: false,
      message: 'Pickup not found',
    });
  }

  // Generate 6-digit OTP
  const otp = crypto.randomInt(100000, 999999).toString();

  // Store OTP with 5-minute expiry
  otpStore.set(pickupId, {
    otp,
    expiresAt: Date.now() + 5 * 60 * 1000,
  });

  // Send OTP via Email
  if (pickup.customer.email) {
    await sendOTPEmail(pickup.customer.email, otp, pickup.customer.name);
  }

  // Send OTP via SMS
  if (pickup.customer.phone) {
    await sendOTPSMS(pickup.customer.phone, otp);
  }

  res.json({
    success: true,
    message: 'OTP sent successfully',
    data: {
      email: pickup.customer.email?.replace(/(.{2})(.*)(@.*)/, '$1***$3'),
      phone: pickup.customer.phone?.replace(
        /(\d{3})(\d{4})(\d{4})/,
        '$1****$3'
      ),
    },
  });
};

/**
 * @desc    Verify Customer OTP
 * @route   POST /api/agent/pickups/:pickupId/verify-otp
 * @access  Private (Agent)
 */
exports.verifyCustomerOTP = async (req, res) => {
  const { pickupId } = req.params;
  const { otp } = req.body;

  const storedOTP = otpStore.get(pickupId);

  if (!storedOTP) {
    return res.status(400).json({
      success: false,
      message: 'OTP expired or not found. Please request a new OTP.',
    });
  }

  if (Date.now() > storedOTP.expiresAt) {
    otpStore.delete(pickupId);
    return res.status(400).json({
      success: false,
      message: 'OTP has expired. Please request a new OTP.',
    });
  }

  if (storedOTP.otp !== otp) {
    return res.status(400).json({
      success: false,
      message: 'Invalid OTP. Please try again.',
    });
  }

  // OTP verified successfully
  otpStore.delete(pickupId);

  const pickup = await Pickup.findById(pickupId);
  pickup.customerVerification = {
    verified: true,
    verifiedAt: new Date(),
    method: 'otp',
  };
  await pickup.save();

  res.json({
    success: true,
    message:
      'Customer verified successfully. You can now proceed with device inspection.',
  });
};

/**
 * @desc    Upload Device Photos
 * @route   POST /api/agent/pickups/:pickupId/device-photos
 * @access  Private (Agent)
 */
exports.uploadDevicePhotos = async (req, res) => {
  const { pickupId } = req.params;
  const agentId = req.user._id;

  const pickup = await Pickup.findOne({
    _id: pickupId,
    assignedTo: agentId,
  });

  if (!pickup) {
    return res.status(404).json({
      success: false,
      message: 'Pickup not found',
    });
  }

  if (!req.files || Object.keys(req.files).length === 0) {
    return res.status(400).json({
      success: false,
      message: 'Please upload at least one device photo',
    });
  }

  const uploadedImages = {};

  // Upload all images to Cloudinary
  for (const [fieldName, files] of Object.entries(req.files)) {
    const file = files[0];
    const result = await cloudinary.uploader.upload(file.path, {
      folder: `cashify/device-photos/${pickupId}`,
      transformation: [{ width: 1200, height: 1600, crop: 'limit' }],
    });

    uploadedImages[fieldName] = result.secure_url;
  }

  pickup.devicePhotos = {
    backImage: uploadedImages.backImage,
    frontImage: uploadedImages.frontImage,
    edge1: uploadedImages.edge1,
    edge2: uploadedImages.edge2,
    edge3: uploadedImages.edge3,
    edge4: uploadedImages.edge4,
    uploadedAt: new Date(),
    uploadedBy: agentId,
  };

  await pickup.save();

  res.json({
    success: true,
    message: 'Device photos uploaded successfully',
    data: { devicePhotos: pickup.devicePhotos },
  });
};

/**
 * @desc    Verify IMEI
 * @route   POST /api/agent/pickups/:pickupId/imei
 * @access  Private (Agent)
 */
exports.verifyIMEI = async (req, res) => {
  const { pickupId } = req.params;
  const { imei1, imei2 } = req.body;
  const agentId = req.user._id;

  const pickup = await Pickup.findOne({
    _id: pickupId,
    assignedTo: agentId,
  });

  if (!pickup) {
    return res.status(404).json({
      success: false,
      message: 'Pickup not found',
    });
  }

  pickup.deviceIMEI = {
    imei1,
    imei2: imei2 || null,
    verifiedAt: new Date(),
    verifiedBy: agentId,
  };

  await pickup.save();

  res.json({
    success: true,
    message: 'IMEI verified successfully',
    data: { deviceIMEI: pickup.deviceIMEI },
  });
};

/**
 * @desc    Submit Device Inspection
 * @route   POST /api/agent/pickups/:pickupId/inspection
 * @access  Private (Agent)
 */
exports.submitDeviceInspection = async (req, res) => {
  const { pickupId } = req.params;
  const { inspectionData } = req.body;
  const agentId = req.user._id;

  const pickup = await Pickup.findOne({
    _id: pickupId,
    assignedTo: agentId,
  }).populate('orderId');

  if (!pickup) {
    return res.status(404).json({
      success: false,
      message: 'Pickup not found',
    });
  }

  pickup.status = 'inspection_in_progress';
  pickup.inspectionData = {
    ...inspectionData,
    inspectedAt: new Date(),
    inspectedBy: agentId,
  };

  pickup.statusHistory.push({
    status: 'inspection_in_progress',
    timestamp: new Date(),
    updatedBy: agentId,
    note: 'Device inspection completed',
  });

  await pickup.save();

  res.json({
    success: true,
    message: 'Inspection data saved successfully',
    data: { inspection: pickup.inspectionData },
  });
};

/**
 * @desc    Calculate Final Price
 * @route   GET /api/agent/pickups/:pickupId/final-price
 * @access  Private (Agent)
 */
exports.calculateFinalPrice = async (req, res) => {
  const { pickupId } = req.params;
  const agentId = req.user._id;

  const pickup = await Pickup.findOne({
    _id: pickupId,
    assignedTo: agentId,
  }).populate('orderId');

  if (!pickup) {
    return res.status(404).json({
      success: false,
      message: 'Pickup not found',
    });
  }

  let finalPrice = pickup.orderId.estimatedPrice;
  let deductions = [];

  // Calculate price based on inspection
  const inspection = pickup.inspectionData;

  if (inspection) {
    // Screen condition deduction
    if (inspection.screenCondition === 'cracked') {
      deductions.push({ reason: 'Cracked screen', amount: 2000 });
      finalPrice -= 2000;
    } else if (inspection.screenCondition === 'scratched') {
      deductions.push({ reason: 'Scratched screen', amount: 500 });
      finalPrice -= 500;
    }

    // Dead pixels deduction
    if (inspection.deadPixels === 'few') {
      deductions.push({ reason: 'Few dead pixels', amount: 300 });
      finalPrice -= 300;
    } else if (inspection.deadPixels === 'many') {
      deductions.push({ reason: 'Many dead pixels', amount: 800 });
      finalPrice -= 800;
    }

    // SIM not working
    if (!inspection.sim1Working) {
      deductions.push({ reason: 'SIM 1 not working', amount: 500 });
      finalPrice -= 500;
    }
    if (!inspection.sim2Working) {
      deductions.push({ reason: 'SIM 2 not working', amount: 300 });
      finalPrice -= 300;
    }

    // Battery health
    if (inspection.batteryHealth < 70) {
      const deduction = (80 - inspection.batteryHealth) * 20;
      deductions.push({ reason: 'Poor battery health', amount: deduction });
      finalPrice -= deduction;
    }

    // Additional issues
    if (inspection.additionalIssues && inspection.additionalIssues.length > 0) {
      const additionalDeduction = inspection.additionalIssues.length * 200;
      deductions.push({
        reason: 'Additional issues found',
        amount: additionalDeduction,
      });
      finalPrice -= additionalDeduction;
    }
  }

  // Ensure price doesn't go below minimum
  finalPrice = Math.max(finalPrice, 1000);

  res.json({
    success: true,
    data: {
      estimatedPrice: pickup.orderId.estimatedPrice,
      finalPrice,
      deductions,
      totalDeduction: pickup.orderId.estimatedPrice - finalPrice,
    },
  });
};

/**
 * @desc    Update Price (Manual Adjustment)
 * @route   PUT /api/agent/pickups/:pickupId/price
 * @access  Private (Agent)
 */
exports.updatePrice = async (req, res) => {
  const { pickupId } = req.params;
  const { adjustedPrice, reason } = req.body;
  const agentId = req.user._id;

  const pickup = await Pickup.findOne({
    _id: pickupId,
    assignedTo: agentId,
  });

  if (!pickup) {
    return res.status(404).json({
      success: false,
      message: 'Pickup not found',
    });
  }

  pickup.priceAdjustment = {
    originalPrice: pickup.orderId.estimatedPrice,
    adjustedPrice,
    reason,
    adjustedBy: agentId,
    adjustedAt: new Date(),
  };

  pickup.status = 'price_revised';
  pickup.statusHistory.push({
    status: 'price_revised',
    timestamp: new Date(),
    updatedBy: agentId,
    note: `Price revised to ₹${adjustedPrice}. Reason: ${reason}`,
  });

  await pickup.save();

  res.json({
    success: true,
    message: 'Price updated successfully',
    data: { priceAdjustment: pickup.priceAdjustment },
  });
};

/**
 * @desc    Record Customer Decision
 * @route   POST /api/agent/pickups/:pickupId/customer-decision
 * @access  Private (Agent)
 */
exports.recordCustomerDecision = async (req, res) => {
  const { pickupId } = req.params;
  const { accepted, rejectionReason } = req.body;
  const agentId = req.user._id;

  const pickup = await Pickup.findOne({
    _id: pickupId,
    assignedTo: agentId,
  });

  if (!pickup) {
    return res.status(404).json({
      success: false,
      message: 'Pickup not found',
    });
  }

  if (accepted) {
    pickup.status = 'customer_accepted';
    pickup.statusHistory.push({
      status: 'customer_accepted',
      timestamp: new Date(),
      updatedBy: agentId,
      note: 'Customer accepted the revised price',
    });
  } else {
    pickup.status = 'cancelled';
    pickup.cancellationReason =
      rejectionReason || 'Customer rejected the price';
    pickup.statusHistory.push({
      status: 'cancelled',
      timestamp: new Date(),
      updatedBy: agentId,
      note: `Pickup cancelled: ${rejectionReason}`,
    });
  }

  await pickup.save();

  res.json({
    success: true,
    message: accepted
      ? 'Customer accepted. Proceed to payment.'
      : 'Pickup cancelled',
    data: { pickup },
  });
};

/**
 * @desc    Record Payment
 * @route   POST /api/agent/pickups/:pickupId/payment
 * @access  Private (Agent)
 */
exports.recordPayment = async (req, res) => {
  const { pickupId } = req.params;
  const { amount, method, transactionId } = req.body;
  const agentId = req.user._id;

  const pickup = await Pickup.findOne({
    _id: pickupId,
    assignedTo: agentId,
  });

  if (!pickup) {
    return res.status(404).json({
      success: false,
      message: 'Pickup not found',
    });
  }

  pickup.payment = {
    amount,
    method,
    transactionId,
    paidAt: new Date(),
    paidBy: agentId,
  };

  pickup.status = 'payment_completed';
  pickup.statusHistory.push({
    status: 'payment_completed',
    timestamp: new Date(),
    updatedBy: agentId,
    note: `Payment of ₹${amount} completed via ${method}`,
  });

  await pickup.save();

  res.json({
    success: true,
    message: 'Payment recorded successfully',
    data: { payment: pickup.payment },
  });
};

/**
 * @desc    Send Final OTP
 * @route   POST /api/agent/pickups/:pickupId/send-final-otp
 * @access  Private (Agent)
 */
exports.sendFinalOTP = async (req, res) => {
  const { pickupId } = req.params;
  const agentId = req.user._id;

  const pickup = await Pickup.findOne({
    _id: pickupId,
    assignedTo: agentId,
  });

  if (!pickup) {
    return res.status(404).json({
      success: false,
      message: 'Pickup not found',
    });
  }

  // Generate 6-digit OTP
  const otp = crypto.randomInt(100000, 999999).toString();

  // Store OTP with 5-minute expiry
  otpStore.set(`final_${pickupId}`, {
    otp,
    expiresAt: Date.now() + 5 * 60 * 1000,
  });

  // Send OTP via Email & SMS
  if (pickup.customer.email) {
    await sendOTPEmail(
      pickup.customer.email,
      otp,
      pickup.customer.name,
      'Final Confirmation OTP'
    );
  }

  if (pickup.customer.phone) {
    await sendOTPSMS(pickup.customer.phone, otp);
  }

  res.json({
    success: true,
    message: 'Final OTP sent successfully',
  });
};

/**
 * @desc    Verify Final OTP
 * @route   POST /api/agent/pickups/:pickupId/verify-final-otp
 * @access  Private (Agent)
 */
exports.verifyFinalOTP = async (req, res) => {
  const { pickupId } = req.params;
  const { otp } = req.body;

  const storedOTP = otpStore.get(`final_${pickupId}`);

  if (!storedOTP) {
    return res.status(400).json({
      success: false,
      message: 'OTP expired or not found. Please request a new OTP.',
    });
  }

  if (Date.now() > storedOTP.expiresAt) {
    otpStore.delete(`final_${pickupId}`);
    return res.status(400).json({
      success: false,
      message: 'OTP has expired. Please request a new OTP.',
    });
  }

  if (storedOTP.otp !== otp) {
    return res.status(400).json({
      success: false,
      message: 'Invalid OTP. Please try again.',
    });
  }

  // OTP verified
  otpStore.delete(`final_${pickupId}`);

  res.json({
    success: true,
    message: 'Final OTP verified. You can now complete the pickup.',
  });
};

/**
 * @desc    Complete Pickup
 * @route   POST /api/agent/pickups/:pickupId/complete
 * @access  Private (Agent)
 */
exports.completePickup = async (req, res) => {
  const { pickupId } = req.params;
  const agentId = req.user._id;

  const pickup = await Pickup.findOne({
    _id: pickupId,
    assignedTo: agentId,
  });

  if (!pickup) {
    return res.status(404).json({
      success: false,
      message: 'Pickup not found',
    });
  }

  pickup.status = 'device_collected';
  pickup.completedAt = new Date();
  pickup.statusHistory.push({
    status: 'device_collected',
    timestamp: new Date(),
    updatedBy: agentId,
    note: 'Device collected successfully',
  });

  // Calculate agent commission (e.g., 2% of final price)
  const finalPrice =
    pickup.priceAdjustment?.adjustedPrice || pickup.orderId.estimatedPrice;
  pickup.agentCommission = finalPrice * 0.02;

  await pickup.save();

  res.json({
    success: true,
    message: 'Pickup completed successfully! Device collected.',
    data: {
      pickup,
      commission: pickup.agentCommission,
    },
  });
};

/**
 * @desc    Save Customer Signature
 * @route   POST /api/agent/pickups/:pickupId/signature
 * @access  Private (Agent)
 */
exports.saveCustomerSignature = async (req, res) => {
  const { pickupId } = req.params;
  const agentId = req.user._id;

  if (!req.file) {
    return res.status(400).json({
      success: false,
      message: 'Signature image is required',
    });
  }

  const pickup = await Pickup.findOne({
    _id: pickupId,
    assignedTo: agentId,
  });

  if (!pickup) {
    return res.status(404).json({
      success: false,
      message: 'Pickup not found',
    });
  }

  // Upload signature to Cloudinary
  const result = await cloudinary.uploader.upload(req.file.path, {
    folder: `cashify/signatures/${pickupId}`,
  });

  pickup.customerSignature = {
    signatureUrl: result.secure_url,
    signedAt: new Date(),
  };

  await pickup.save();

  res.json({
    success: true,
    message: 'Customer signature saved successfully',
    data: { signatureUrl: result.secure_url },
  });
};

/**
 * @desc    Get Pickup History
 * @route   GET /api/agent/history
 * @access  Private (Agent)
 */
exports.getPickupHistory = async (req, res) => {
  const agentId = req.user._id;
  const { page = 1, limit = 20 } = req.query;

  const pickups = await Pickup.find({
    assignedTo: agentId,
    status: { $in: ['completed', 'cancelled'] },
  })
    .populate('orderId', 'orderNumber deviceDetails')
    .populate('assignedTo', 'name')
    .sort({ updatedAt: -1 })
    .skip((page - 1) * limit)
    .limit(parseInt(limit));

  const total = await Pickup.countDocuments({
    assignedTo: agentId,
    status: { $in: ['completed', 'cancelled'] },
  });

  res.json({
    success: true,
    data: {
      pickups,
      pagination: {
        total,
        page: parseInt(page),
        pages: Math.ceil(total / limit),
      },
    },
  });
};

/**
 * @desc    Get Completed Pickups Today
 * @route   GET /api/agent/completed-today
 * @access  Private (Agent)
 */
exports.getCompletedToday = async (req, res) => {
  const agentId = req.user._id;
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const pickups = await Pickup.find({
    assignedTo: agentId,
    status: 'completed',
    completedAt: { $gte: today },
  })
    .populate('orderId', 'orderNumber deviceDetails')
    .populate('assignedTo', 'name');

  res.json({
    success: true,
    data: { pickups },
  });
};

/**
 * @desc    Get Daily Report
 * @route   GET /api/agent/daily-report
 * @access  Private (Agent)
 */
exports.getDailyReport = async (req, res) => {
  const agentId = req.user._id;
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const [completed, cancelled, totalEarnings] = await Promise.all([
    Pickup.find({
      assignedTo: agentId,
      status: 'device_collected',
      completedAt: { $gte: today },
    }).populate('orderId'),
    Pickup.find({
      assignedTo: agentId,
      status: 'cancelled',
      updatedAt: { $gte: today },
    }),
    Pickup.aggregate([
      {
        $match: {
          assignedTo: agentId,
          status: 'device_collected',
          completedAt: { $gte: today },
        },
      },
      {
        $group: {
          _id: null,
          total: { $sum: '$agentCommission' },
        },
      },
    ]),
  ]);

  res.json({
    success: true,
    data: {
      date: today,
      completed: completed.length,
      cancelled: cancelled.length,
      totalEarnings: totalEarnings[0]?.total || 0,
      pickups: {
        completed,
        cancelled,
      },
    },
  });
};

/**
 * @desc    Submit Daily Report
 * @route   POST /api/agent/submit-daily-report
 * @access  Private (Agent)
 */
exports.submitDailyReport = async (req, res) => {
  const agentId = req.user._id;
  const { notes, issues } = req.body;

  // Create daily report
  // TODO: Create DailyReport model

  res.json({
    success: true,
    message: 'Daily report submitted successfully',
  });
};
