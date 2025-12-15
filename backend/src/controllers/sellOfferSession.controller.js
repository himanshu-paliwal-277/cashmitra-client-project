const { validationResult } = require('express-validator');
const mongoose = require('mongoose');
const SellOfferSession = require('../models/sellOfferSession.model');
const SellProduct = require('../models/sellProduct.model');
const SellDefect = require('../models/sellDefect.model');
const SellAccessory = require('../models/sellAccessory.model');
const {
  ApiError,
  asyncHandler,
} = require('../middlewares/errorHandler.middleware');

exports.createSession = asyncHandler(async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    throw new ApiError(400, 'Validation Error', errors.array());
  }

  const { userId, productId, variantId, answers, defects, accessories } =
    req.body;

  console.log('Creating session with data:', {
    userId,
    productId,
    variantId,
    answersType: typeof answers,
    answersKeys: answers ? Object.keys(answers) : [],
    defectsLength: defects ? defects.length : 0,
    accessoriesLength: accessories ? accessories.length : 0,
  });

  const finalUserId = req.user?.id || userId;

  if (!finalUserId) {
    throw new ApiError(400, 'User ID is required');
  }

  const product = await SellProduct.findById(productId);
  if (!product) {
    throw new ApiError(404, 'Product not found');
  }

  const variant = product.variants.find(
    (v) => v._id.toString() === variantId.toString()
  );
  if (!variant) {
    throw new ApiError(404, 'Variant not found in product');
  }

  if (!variant.isActive) {
    throw new ApiError(400, 'Selected variant is not available');
  }

  let processedAnswers = new Map();
  if (answers && typeof answers === 'object') {
    Object.entries(answers).forEach(([key, value]) => {
      if (value && typeof value === 'object') {
        processedAnswers.set(key, value);
      } else if (value) {
        processedAnswers.set(key, Array.isArray(value) ? value : [value]);
      }
    });
  }

  const processedDefects = defects || [];
  const processedAccessories = accessories || [];

  const session = new SellOfferSession({
    userId: finalUserId,
    productId,
    variantId,
    partnerId: product.partnerId || null,
    answers: processedAnswers,
    defects: processedDefects,
    accessories: processedAccessories,
    basePrice: variant.basePrice,
    finalPrice: variant.basePrice,
    breakdown: [
      {
        label: 'Base Price',
        delta: variant.basePrice,
        type: 'base',
      },
    ],
  });

  await recalculateSessionPrice(session);

  session.generateSessionToken();

  await session.save();

  await session.populate('productId', 'name images categoryId');

  res.status(201).json({
    success: true,
    message: 'Offer session created successfully',
    data: {
      sessionId: session._id,
      sessionToken: session.sessionToken,
      product: {
        id: product._id,
        name: product.name,
        images: product.images,
      },
      variant: {
        id: variant._id,
        label: variant.label,
        basePrice: variant.basePrice,
      },
      pricing: {
        basePrice: session.basePrice,
        finalPrice: session.finalPrice,
        adjustment: session.finalPrice - session.basePrice,
        breakdown: session.breakdown,
      },
      assessment: {
        answers:
          session.answers instanceof Map
            ? Object.fromEntries(session.answers)
            : session.answers,
        defects: session.defects,
        accessories: session.accessories,
      },
      expiresAt: session.expiresAt,
      computedAt: session.computedAt,
    },
  });
});

exports.getSession = asyncHandler(async (req, res) => {
  const { sessionId } = req.params;
  const { sessionToken } = req.query;

  const session = await SellOfferSession.findById(sessionId)
    .populate('productId', 'name images')
    .populate('userId', 'name email');

  if (!session) {
    throw new ApiError(404, 'Session not found');
  }

  if (sessionToken && !session.verifyToken(sessionToken)) {
    throw new ApiError(401, 'Invalid session token');
  }

  if (session.expiresAt < new Date()) {
    throw new ApiError(410, 'Session has expired');
  }

  res.json({
    success: true,
    data: session,
  });
});

exports.updateAnswers = asyncHandler(async (req, res) => {
  const { sessionId } = req.params;
  const { answers, sessionToken } = req.body;

  const session = await SellOfferSession.findById(sessionId);
  if (!session) {
    throw new ApiError(404, 'Session not found');
  }

  if (!session.verifyToken(sessionToken)) {
    throw new ApiError(401, 'Invalid session token');
  }

  session.answers = new Map(Object.entries(answers || {}));

  await recalculateSessionPrice(session);
  await session.save();

  res.json({
    success: true,
    message: 'Answers updated successfully',
    data: {
      finalPrice: session.finalPrice,
      breakdown: session.breakdown,
    },
  });
});

exports.updateDefects = asyncHandler(async (req, res) => {
  const { sessionId } = req.params;
  const { defects, sessionToken } = req.body;

  const session = await SellOfferSession.findById(sessionId);
  if (!session) {
    throw new ApiError(404, 'Session not found');
  }

  if (!session.verifyToken(sessionToken)) {
    throw new ApiError(401, 'Invalid session token');
  }

  session.defects = defects || [];

  await recalculateSessionPrice(session);
  await session.save();

  res.json({
    success: true,
    message: 'Defects updated successfully',
    data: {
      finalPrice: session.finalPrice,
      breakdown: session.breakdown,
    },
  });
});

exports.updateAccessories = asyncHandler(async (req, res) => {
  const { sessionId } = req.params;
  const { accessories, sessionToken } = req.body;

  const session = await SellOfferSession.findById(sessionId);
  if (!session) {
    throw new ApiError(404, 'Session not found');
  }

  if (!session.verifyToken(sessionToken)) {
    throw new ApiError(401, 'Invalid session token');
  }

  session.accessories = accessories || [];

  await recalculateSessionPrice(session);
  await session.save();

  res.json({
    success: true,
    message: 'Accessories updated successfully',
    data: {
      finalPrice: session.finalPrice,
      breakdown: session.breakdown,
    },
  });
});

exports.getCurrentPrice = asyncHandler(async (req, res) => {
  const { sessionId } = req.params;
  const { sessionToken } = req.query;

  const session = await SellOfferSession.findById(sessionId);
  if (!session) {
    throw new ApiError(404, 'Session not found');
  }

  if (!session.verifyToken(sessionToken)) {
    throw new ApiError(401, 'Invalid session token');
  }

  res.json({
    success: true,
    data: {
      basePrice: session.basePrice,
      finalPrice: session.finalPrice,
      breakdown: session.breakdown,
      totalAdjustment: session.totalAdjustment,
      currency: session.currency,
      computedAt: session.computedAt,
    },
  });
});

exports.extendSession = asyncHandler(async (req, res) => {
  const { sessionId } = req.params;
  const { sessionToken } = req.body;

  const session = await SellOfferSession.findById(sessionId);
  if (!session) {
    throw new ApiError(404, 'Session not found');
  }

  if (!session.verifyToken(sessionToken)) {
    throw new ApiError(401, 'Invalid session token');
  }

  session.extendExpiry();
  await session.save();

  res.json({
    success: true,
    message: 'Session extended successfully',
    data: {
      expiresAt: session.expiresAt,
    },
  });
});

exports.getUserActiveSessions = asyncHandler(async (req, res) => {
  const userId = req.user.id;

  const sessions = await SellOfferSession.findActiveSessions(userId)
    .populate('productId', 'name images variants')
    .sort({ updatedAt: -1 });

  const transformedSessions = sessions.map((session) => {
    const sessionObj = session.toObject();

    if (
      sessionObj.productId &&
      sessionObj.productId.variants &&
      sessionObj.variantId
    ) {
      const variant = sessionObj.productId.variants.find(
        (v) => v._id.toString() === sessionObj.variantId.toString()
      );

      if (variant) {
        sessionObj.variantId = {
          _id: variant._id,
          label: variant.label,
          basePrice: variant.basePrice,
          isActive: variant.isActive,
        };
      }
    }

    if (sessionObj.productId && sessionObj.productId.variants) {
      sessionObj.productId.activeVariants =
        sessionObj.productId.variants.filter((v) => v.isActive);
    }

    return sessionObj;
  });

  res.json({
    success: true,
    data: transformedSessions,
  });
});

exports.getUserSessions = exports.getUserActiveSessions;

exports.deleteSession = asyncHandler(async (req, res) => {
  const { sessionId } = req.params;
  const { sessionToken } = req.body;

  const session = await SellOfferSession.findById(sessionId);
  if (!session) {
    throw new ApiError(404, 'Session not found');
  }

  if (!session.verifyToken(sessionToken)) {
    throw new ApiError(401, 'Invalid session token');
  }

  await session.deleteOne();

  res.json({
    success: true,
    message: 'Session deleted successfully',
  });
});

exports.getAllSessions = asyncHandler(async (req, res) => {
  const {
    page = 1,
    limit = 10,
    search = '',
    status = 'all',
    deviceType = 'all',
    sortBy = 'createdAt',
    sortOrder = 'desc',
  } = req.query;

  const query = {};

  if (search) {
    const users = await mongoose
      .model('User')
      .find({
        $or: [
          { name: { $regex: search, $options: 'i' } },
          { email: { $regex: search, $options: 'i' } },
          { phone: { $regex: search, $options: 'i' } },
        ],
      })
      .select('_id');

    const userIds = users.map((u) => u._id);
    query.userId = { $in: userIds };
  }

  const now = new Date();
  if (status === 'active') {
    query.isActive = true;
    query.expiresAt = { $gt: now };
  } else if (status === 'expired') {
    query.expiresAt = { $lt: now };
  } else if (status === 'completed') {
    query.isActive = false;
  }

  const skip = (parseInt(page) - 1) * parseInt(limit);
  const sort = { [sortBy]: sortOrder === 'asc' ? 1 : -1 };

  const sessions = await SellOfferSession.find(query)
    .populate('userId', 'name email phone')
    .populate('productId', 'name images categoryId')
    .sort(sort)
    .skip(skip)
    .limit(parseInt(limit));

  const total = await SellOfferSession.countDocuments(query);

  const transformedSessions = await Promise.all(
    sessions.map(async (session) => {
      const sessionObj = session.toObject();

      if (sessionObj.productId && sessionObj.productId._id) {
        const product = await mongoose
          .model('SellProduct')
          .findById(sessionObj.productId._id);
        if (product && product.variants) {
          const variant = product.variants.find(
            (v) => v._id.toString() === sessionObj.variantId.toString()
          );
          if (variant) {
            sessionObj.variant = {
              _id: variant._id,
              label: variant.label,
              basePrice: variant.basePrice,
            };
          }
        }
      }

      return sessionObj;
    })
  );

  res.json({
    success: true,
    data: transformedSessions,
    pagination: {
      page: parseInt(page),
      limit: parseInt(limit),
      total,
      pages: Math.ceil(total / parseInt(limit)),
    },
  });
});

exports.updateSessionStatus = asyncHandler(async (req, res) => {
  const { sessionId } = req.params;
  const { isActive } = req.body;

  const session = await SellOfferSession.findById(sessionId);
  if (!session) {
    throw new ApiError(404, 'Session not found');
  }

  session.isActive = isActive;
  await session.save();

  res.json({
    success: true,
    message: 'Session status updated successfully',
    data: session,
  });
});

exports.cleanupExpiredSessions = asyncHandler(async (req, res) => {
  const result = await SellOfferSession.cleanupExpired();

  res.json({
    success: true,
    message: `${result.deletedCount} expired sessions cleaned up`,
    data: { deletedCount: result.deletedCount },
  });
});

async function recalculateSessionPrice(session) {
  const breakdown = [
    {
      label: 'Base Price',
      delta: session.basePrice,
      type: 'base',
    },
  ];

  let percentDelta = 0;
  let absDelta = 0;

  console.log('Starting price calculation:', {
    basePrice: session.basePrice,
    answersSize: session.answers?.size || 0,
    defectsCount: session.defects?.length || 0,
    accessoriesCount: session.accessories?.length || 0,
  });

  if (session.answers && session.answers.size > 0) {
    try {
      for (const [, answerData] of session.answers) {
        if (answerData && typeof answerData === 'object' && answerData.delta) {
          const adjust = answerData.delta.sign === '-' ? -1 : 1;

          if (answerData.delta.type === 'percent') {
            percentDelta += adjust * (answerData.delta.value || 0);
          } else {
            absDelta += adjust * (answerData.delta.value || 0);
          }

          const deltaValue =
            answerData.delta.type === 'percent'
              ? Math.round(
                  (session.basePrice * adjust * answerData.delta.value) / 100
                )
              : adjust * answerData.delta.value;

          breakdown.push({
            label:
              answerData.questionText ||
              `Question: ${answerData.answerText || answerData.answerValue}`,
            delta: deltaValue,
            type: 'question',
          });

          console.log(
            `Answer: ${answerData.questionText} - ${
              answerData.answerText || answerData.answerValue
            } = ${deltaValue}`
          );
        }
      }
    } catch (error) {
      console.error('Error calculating question adjustments:', error);
    }
  }

  if (session.defects && session.defects.length > 0) {
    try {
      const defects = await SellDefect.getForVariants(session.productId, [
        session.variantId,
      ]);

      for (const defectKey of session.defects) {
        const defect = defects.find(
          (d) => d.key === defectKey || d._id.toString() === defectKey
        );

        if (defect && defect.delta) {
          const adjust = defect.delta.sign === '-' ? -1 : 1;

          if (defect.delta.type === 'percent') {
            percentDelta += adjust * (defect.delta.value || 0);
          } else {
            absDelta += adjust * (defect.delta.value || 0);
          }

          const deltaValue =
            defect.delta.type === 'percent'
              ? Math.round(
                  (session.basePrice * adjust * defect.delta.value) / 100
                )
              : adjust * defect.delta.value;

          breakdown.push({
            label: defect.title,
            delta: deltaValue,
            type: 'defect',
          });

          console.log(`Defect: ${defect.title} = ${deltaValue}`);
        }
      }
    } catch (error) {
      console.error('Error calculating defect adjustments:', error);
    }
  }

  if (session.accessories && session.accessories.length > 0) {
    try {
      const product = await SellProduct.findById(session.productId);
      if (product && product.categoryId) {
        const accessories = await SellAccessory.getActiveForCategory(
          product.categoryId
        );

        for (const accessoryKey of session.accessories) {
          const accessory = accessories.find(
            (a) => a.key === accessoryKey || a._id.toString() === accessoryKey
          );

          if (accessory && accessory.delta) {
            const adjust = accessory.delta.sign === '-' ? -1 : 1;

            if (accessory.delta.type === 'percent') {
              percentDelta += adjust * (accessory.delta.value || 0);
            } else {
              absDelta += adjust * (accessory.delta.value || 0);
            }

            const deltaValue =
              accessory.delta.type === 'percent'
                ? Math.round(
                    (session.basePrice * adjust * accessory.delta.value) / 100
                  )
                : adjust * accessory.delta.value;

            breakdown.push({
              label: accessory.title,
              delta: deltaValue,
              type: 'accessory',
            });

            console.log(`Accessory: ${accessory.title} = ${deltaValue}`);
          }
        }
      }
    } catch (error) {
      console.error('Error calculating accessory adjustments:', error);
    }
  }

  const finalPrice = Math.round(
    session.basePrice * (1 + percentDelta / 100) + absDelta
  );

  console.log('Price calculation result:', {
    basePrice: session.basePrice,
    percentDelta,
    absDelta,
    finalPrice,
    breakdownItems: breakdown.length,
  });

  session.breakdown = breakdown;
  session.finalPrice = finalPrice;
}
