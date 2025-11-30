/**
 * @fileoverview Sell Offer Session Management Controller
 * @description Handles all sell offer session-related operations including
 * session creation, price calculation, and session management.
 * @author Cashify Development Team
 * @version 1.0.0
 */

const { validationResult } = require('express-validator');
const SellOfferSession = require('../models/sellOfferSession.model');
const SellProduct = require('../models/sellProduct.model');
const SellDefect = require('../models/sellDefect.model');
const SellAccessory = require('../models/sellAccessory.model');
const { ApiError, asyncHandler } = require('../middlewares/errorHandler.middleware');

/**
 * Create new offer session with complete assessment data
 * @route POST /api/sell-sessions/create
 * @access Public/Private
 */
exports.createSession = asyncHandler(async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    throw new ApiError(400, 'Validation Error', errors.array());
  }

  const { userId, productId, variantId, answers, defects, accessories } = req.body;

  console.log('Creating session with data:', {
    userId,
    productId,
    variantId,
    answersType: typeof answers,
    answersKeys: answers ? Object.keys(answers) : [],
    defectsLength: defects ? defects.length : 0,
    accessoriesLength: accessories ? accessories.length : 0
  });

  // Use authenticated user ID if available, otherwise use provided userId
  const finalUserId = req.user?.id || userId;

  if (!finalUserId) {
    throw new ApiError(400, 'User ID is required');
  }

  // Verify product exists
  const product = await SellProduct.findById(productId);
  if (!product) {
    throw new ApiError(404, 'Product not found');
  }

  // Find the variant in product.variants array
  const variant = product.variants.find(v => v._id.toString() === variantId.toString());
  if (!variant) {
    throw new ApiError(404, 'Variant not found in product');
  }

  if (!variant.isActive) {
    throw new ApiError(400, 'Selected variant is not available');
  }

  // Transform answers from frontend format to backend format
  // Frontend sends: { questionId: { questionId, answerValue, delta: {...}, ... } }
  // Store the complete answer object including delta for price calculation
  let processedAnswers = new Map();
  if (answers && typeof answers === 'object') {
    Object.entries(answers).forEach(([key, value]) => {
      if (value && typeof value === 'object') {
        // Store the complete answer object (includes delta, answerValue, questionText, etc.)
        processedAnswers.set(key, value);
      } else if (value) {
        // Handle direct value format
        processedAnswers.set(key, Array.isArray(value) ? value : [value]);
      }
    });
  }

  // DON'T remove duplicates - frontend includes duplicates in calculation
  // Frontend comment: "Process defects (note: data has duplicates, but we sum all)"
  const processedDefects = defects || [];
  const processedAccessories = accessories || [];

  // Create session with all assessment data
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
    breakdown: [{
      label: 'Base Price',
      delta: variant.basePrice,
      type: 'base'
    }]
  });

  // Calculate final price with all adjustments
  await recalculateSessionPrice(session);
  
  // Generate session token for tracking
  session.generateSessionToken();
  
  await session.save();

  // Populate product details for response
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
        images: product.images
      },
      variant: {
        id: variant._id,
        label: variant.label,
        basePrice: variant.basePrice
      },
      pricing: {
        basePrice: session.basePrice,
        finalPrice: session.finalPrice,
        adjustment: session.finalPrice - session.basePrice,
        breakdown: session.breakdown
      },
      assessment: {
        answers: session.answers instanceof Map ? Object.fromEntries(session.answers) : session.answers,
        defects: session.defects,
        accessories: session.accessories
      },
      expiresAt: session.expiresAt,
      computedAt: session.computedAt
    }
  });
});

/**
 * Get session details
 * @route GET /api/sell/sessions/:sessionId
 * @access Public
 */
exports.getSession = asyncHandler(async (req, res) => {
  const { sessionId } = req.params;
  const { sessionToken } = req.query;

  const session = await SellOfferSession.findById(sessionId)
    .populate('productId', 'name images')
    .populate('userId', 'name email');

  if (!session) {
    throw new ApiError(404, 'Session not found');
  }

  // Verify session token if provided
  if (sessionToken && !session.verifyToken(sessionToken)) {
    throw new ApiError(401, 'Invalid session token');
  }

  // Check if session is expired
  if (session.expiresAt < new Date()) {
    throw new ApiError(410, 'Session has expired');
  }

  res.json({
    success: true,
    data: session
  });
});

/**
 * Update session answers
 * @route PUT /api/sell/sessions/:sessionId/answers
 * @access Public
 */
exports.updateAnswers = asyncHandler(async (req, res) => {
  const { sessionId } = req.params;
  const { answers, sessionToken } = req.body;

  const session = await SellOfferSession.findById(sessionId);
  if (!session) {
    throw new ApiError(404, 'Session not found');
  }

  // Verify session token
  if (!session.verifyToken(sessionToken)) {
    throw new ApiError(401, 'Invalid session token');
  }

  // Update answers
  session.answers = new Map(Object.entries(answers || {}));
  
  // Recalculate price
  await recalculateSessionPrice(session);
  await session.save();

  res.json({
    success: true,
    message: 'Answers updated successfully',
    data: {
      finalPrice: session.finalPrice,
      breakdown: session.breakdown
    }
  });
});

/**
 * Update session defects
 * @route PUT /api/sell/sessions/:sessionId/defects
 * @access Public
 */
exports.updateDefects = asyncHandler(async (req, res) => {
  const { sessionId } = req.params;
  const { defects, sessionToken } = req.body;

  const session = await SellOfferSession.findById(sessionId);
  if (!session) {
    throw new ApiError(404, 'Session not found');
  }

  // Verify session token
  if (!session.verifyToken(sessionToken)) {
    throw new ApiError(401, 'Invalid session token');
  }

  // Update defects
  session.defects = defects || [];
  
  // Recalculate price
  await recalculateSessionPrice(session);
  await session.save();

  res.json({
    success: true,
    message: 'Defects updated successfully',
    data: {
      finalPrice: session.finalPrice,
      breakdown: session.breakdown
    }
  });
});

/**
 * Update session accessories
 * @route PUT /api/sell/sessions/:sessionId/accessories
 * @access Public
 */
exports.updateAccessories = asyncHandler(async (req, res) => {
  const { sessionId } = req.params;
  const { accessories, sessionToken } = req.body;

  const session = await SellOfferSession.findById(sessionId);
  if (!session) {
    throw new ApiError(404, 'Session not found');
  }

  // Verify session token
  if (!session.verifyToken(sessionToken)) {
    throw new ApiError(401, 'Invalid session token');
  }

  // Update accessories
  session.accessories = accessories || [];
  
  // Recalculate price
  await recalculateSessionPrice(session);
  await session.save();

  res.json({
    success: true,
    message: 'Accessories updated successfully',
    data: {
      finalPrice: session.finalPrice,
      breakdown: session.breakdown
    }
  });
});

/**
 * Get current price calculation
 * @route GET /api/sell/sessions/:sessionId/price
 * @access Public
 */
exports.getCurrentPrice = asyncHandler(async (req, res) => {
  const { sessionId } = req.params;
  const { sessionToken } = req.query;

  const session = await SellOfferSession.findById(sessionId);
  if (!session) {
    throw new ApiError(404, 'Session not found');
  }

  // Verify session token
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
      computedAt: session.computedAt
    }
  });
});

/**
 * Extend session expiry
 * @route POST /api/sell/sessions/:sessionId/extend
 * @access Public
 */
exports.extendSession = asyncHandler(async (req, res) => {
  const { sessionId } = req.params;
  const { sessionToken } = req.body;

  const session = await SellOfferSession.findById(sessionId);
  if (!session) {
    throw new ApiError(404, 'Session not found');
  }

  // Verify session token
  if (!session.verifyToken(sessionToken)) {
    throw new ApiError(401, 'Invalid session token');
  }

  session.extendExpiry();
  await session.save();

  res.json({
    success: true,
    message: 'Session extended successfully',
    data: {
      expiresAt: session.expiresAt
    }
  });
});

/**
 * Get user's active sessions
 * @route GET /api/sell/sessions/user/active
 * @access Private
 */
exports.getUserActiveSessions = asyncHandler(async (req, res) => {
  const userId = req.user.id;

  const sessions = await SellOfferSession.findActiveSessions(userId)
    .populate('productId', 'name images variants')
    .sort({ updatedAt: -1 });

  // Transform sessions to include variant data from the populated product
  const transformedSessions = sessions.map(session => {
    const sessionObj = session.toObject();
    
    // Find the variant within the product's variants array
    if (sessionObj.productId && sessionObj.productId.variants && sessionObj.variantId) {
      const variant = sessionObj.productId.variants.find(v => 
        v._id.toString() === sessionObj.variantId.toString()
      );
      
      if (variant) {
        sessionObj.variantId = {
          _id: variant._id,
          label: variant.label,
          basePrice: variant.basePrice,
          isActive: variant.isActive
        };
      }
    }
    
    // Ensure activeVariants is available
    if (sessionObj.productId && sessionObj.productId.variants) {
      sessionObj.productId.activeVariants = sessionObj.productId.variants.filter(v => v.isActive);
    }
    
    return sessionObj;
  });

  res.json({
    success: true,
    data: transformedSessions
  });
});

/**
 * Get user sessions (alias for getUserActiveSessions)
 * @route GET /api/sell/sessions/my-sessions
 * @access Private
 */
exports.getUserSessions = exports.getUserActiveSessions;

/**
 * Delete session
 * @route DELETE /api/sell/sessions/:sessionId
 * @access Public
 */
exports.deleteSession = asyncHandler(async (req, res) => {
  const { sessionId } = req.params;
  const { sessionToken } = req.body;

  const session = await SellOfferSession.findById(sessionId);
  if (!session) {
    throw new ApiError(404, 'Session not found');
  }

  // Verify session token
  if (!session.verifyToken(sessionToken)) {
    throw new ApiError(401, 'Invalid session token');
  }

  await session.deleteOne();

  res.json({
    success: true,
    message: 'Session deleted successfully'
  });
});

/**
 * Clean up expired sessions (Admin only)
 * @route POST /api/sell/sessions/cleanup
 * @access Private (Admin only)
 */
exports.cleanupExpiredSessions = asyncHandler(async (req, res) => {
  const result = await SellOfferSession.cleanupExpired();

  res.json({
    success: true,
    message: `${result.deletedCount} expired sessions cleaned up`,
    data: { deletedCount: result.deletedCount }
  });
});

/**
 * Helper function to recalculate session price - matches frontend calculation
 */
async function recalculateSessionPrice(session) {
  const breakdown = [{
    label: 'Base Price',
    delta: session.basePrice,
    type: 'base'
  }];
  
  let percentDelta = 0;
  let absDelta = 0;

  console.log('Starting price calculation:', {
    basePrice: session.basePrice,
    answersSize: session.answers?.size || 0,
    defectsCount: session.defects?.length || 0,
    accessoriesCount: session.accessories?.length || 0
  });

  // Calculate adjustments from answers
  // Frontend sends answers with delta already included: { questionId: { delta: {...}, ... } }
  if (session.answers && session.answers.size > 0) {
    try {
      for (const [, answerData] of session.answers) {
        // Check if answerData has delta (frontend format)
        if (answerData && typeof answerData === 'object' && answerData.delta) {
          const adjust = answerData.delta.sign === '-' ? -1 : 1;
          
          if (answerData.delta.type === 'percent') {
            percentDelta += adjust * (answerData.delta.value || 0);
          } else {
            absDelta += adjust * (answerData.delta.value || 0);
          }
          
          const deltaValue = answerData.delta.type === 'percent' 
            ? Math.round(session.basePrice * adjust * answerData.delta.value / 100)
            : adjust * answerData.delta.value;
          
          breakdown.push({
            label: answerData.questionText || `Question: ${answerData.answerText || answerData.answerValue}`,
            delta: deltaValue,
            type: 'question'
          });
          
          console.log(`Answer: ${answerData.questionText} - ${answerData.answerText || answerData.answerValue} = ${deltaValue}`);
        }
      }
    } catch (error) {
      console.error('Error calculating question adjustments:', error);
    }
  }

  // Calculate adjustments from defects
  if (session.defects && session.defects.length > 0) {
    try {
      const defects = await SellDefect.getForVariants(session.productId, [session.variantId]);
      
      for (const defectKey of session.defects) {
        const defect = defects.find(d => 
          d.key === defectKey || d._id.toString() === defectKey
        );
        
        if (defect && defect.delta) {
          const adjust = defect.delta.sign === '-' ? -1 : 1;
          
          if (defect.delta.type === 'percent') {
            percentDelta += adjust * (defect.delta.value || 0);
          } else {
            absDelta += adjust * (defect.delta.value || 0);
          }
          
          const deltaValue = defect.delta.type === 'percent'
            ? Math.round(session.basePrice * adjust * defect.delta.value / 100)
            : adjust * defect.delta.value;
          
          breakdown.push({
            label: defect.title,
            delta: deltaValue,
            type: 'defect'
          });
          
          console.log(`Defect: ${defect.title} = ${deltaValue}`);
        }
      }
    } catch (error) {
      console.error('Error calculating defect adjustments:', error);
    }
  }

  // Calculate adjustments from accessories
  if (session.accessories && session.accessories.length > 0) {
    try {
      // Get product to find categoryId
      const product = await SellProduct.findById(session.productId);
      if (product && product.categoryId) {
        const accessories = await SellAccessory.getActiveForCategory(product.categoryId);
        
        for (const accessoryKey of session.accessories) {
          const accessory = accessories.find(a => 
            a.key === accessoryKey || a._id.toString() === accessoryKey
          );
          
          if (accessory && accessory.delta) {
            const adjust = accessory.delta.sign === '-' ? -1 : 1;
            
            if (accessory.delta.type === 'percent') {
              percentDelta += adjust * (accessory.delta.value || 0);
            } else {
              absDelta += adjust * (accessory.delta.value || 0);
            }
            
            const deltaValue = accessory.delta.type === 'percent'
              ? Math.round(session.basePrice * adjust * accessory.delta.value / 100)
              : adjust * accessory.delta.value;
            
            breakdown.push({
              label: accessory.title,
              delta: deltaValue,
              type: 'accessory'
            });
            
            console.log(`Accessory: ${accessory.title} = ${deltaValue}`);
          }
        }
      }
    } catch (error) {
      console.error('Error calculating accessory adjustments:', error);
    }
  }

  // Calculate final price - exactly like frontend
  // adjustedPrice = basePrice * (1 + percentDelta / 100) + absDelta
  const finalPrice = Math.round(session.basePrice * (1 + percentDelta / 100) + absDelta);

  console.log('Price calculation result:', {
    basePrice: session.basePrice,
    percentDelta,
    absDelta,
    finalPrice,
    breakdownItems: breakdown.length
  });

  // Update session
  session.breakdown = breakdown;
  session.finalPrice = finalPrice;
}