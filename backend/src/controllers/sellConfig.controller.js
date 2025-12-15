import {validationResult} from 'express-validator';
import SellConfig from '../models/sellConfig.model';
import SellProduct from '../models/sellProduct.model';
import {ApiError, asyncHandler} from '../middlewares/errorHandler.middleware';

export var createOrUpdateConfig = asyncHandler(async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    throw new ApiError(400, 'Validation Error', errors.array());
  }

  const { productId, steps, rules } = req.body;

  const product = await SellProduct.findById(productId);
  if (!product) {
    throw new ApiError(404, 'Product not found');
  }

  let config = await SellConfig.findOne({ productId });

  if (config) {
    if (steps) config.steps = steps;
    if (rules) config.rules = { ...config.rules, ...rules };
    await config.save();

    res.json({
      success: true,
      message: 'Configuration updated successfully',
      data: config,
    });
  } else {
    config = new SellConfig({
      productId,
      steps: steps || [
        { key: 'variant', title: 'Select Variant', order: 1 },
        { key: 'questions', title: 'Answer Questions', order: 2 },
        { key: 'defects', title: 'Select Defects', order: 3 },
        { key: 'accessories', title: 'Select Accessories', order: 4 },
        { key: 'summary', title: 'Review & Confirm', order: 5 },
      ],
      rules: rules || {
        roundToNearest: 10,
        floorPrice: 0,
        minPercent: -90,
        maxPercent: 50,
      },
      createdBy: req.user.id,
    });

    await config.save();

    res.status(201).json({
      success: true,
      message: 'Configuration created successfully',
      data: config,
    });
  }
});

export var getConfig = asyncHandler(async (req, res) => {
  const { productId } = req.params;

  let config = await SellConfig.findOne({ productId })
    .populate('productId', 'name')
    .populate('createdBy', 'name email');

  if (!config) {
    config = SellConfig.getDefaultConfig();
    config.productId = productId;
  }

  res.json({
    success: true,
    data: config,
  });
});

export var getConfigForCustomer = asyncHandler(async (req, res) => {
  const { productId } = req.params;

  let config = await SellConfig.findOne({ productId }).select('steps rules');

  if (!config) {
    config = SellConfig.getDefaultConfig();
  }

  res.json({
    success: true,
    data: {
      steps: config.orderedSteps || config.steps,
      rules: config.rules,
    },
  });
});

export var getCustomerConfig = asyncHandler(async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    throw new ApiError(400, 'Validation Error', errors.array());
  }

  const { productId } = req.params;

  const product = await SellProduct.findById(productId);
  if (!product) {
    throw new ApiError(404, 'Product not found');
  }

  let config = await SellConfig.findOne({ productId }).select('steps rules');

  if (!config) {
    config = SellConfig.getDefaultConfig();
  }

  res.json({
    success: true,
    data: {
      steps: config.orderedSteps || config.steps,
      rules: config.rules,
    },
  });
});

export var updateSteps = asyncHandler(async (req, res) => {
  const { productId } = req.params;
  const { steps } = req.body;

  if (!Array.isArray(steps)) {
    throw new ApiError(400, 'Steps must be an array');
  }

  let config = await SellConfig.findOne({ productId });

  if (!config) {
    config = await SellConfig.createDefaultForProduct(productId, req.user.id);
  }

  config.steps = steps;
  await config.save();

  res.json({
    success: true,
    message: 'Steps updated successfully',
    data: config,
  });
});

export var updateRules = asyncHandler(async (req, res) => {
  const { productId } = req.params;
  const { rules } = req.body;

  if (!rules || typeof rules !== 'object') {
    throw new ApiError(400, 'Rules must be an object');
  }

  let config = await SellConfig.findOne({ productId });

  if (!config) {
    config = await SellConfig.createDefaultForProduct(productId, req.user.id);
  }

  config.rules = { ...config.rules, ...rules };
  await config.save();

  res.json({
    success: true,
    message: 'Pricing rules updated successfully',
    data: config,
  });
});

export var deleteConfig = asyncHandler(async (req, res) => {
  const { productId } = req.params;

  const config = await SellConfig.findOne({ productId });
  if (!config) {
    throw new ApiError(404, 'Configuration not found');
  }

  await config.deleteOne();

  res.json({
    success: true,
    message: 'Configuration deleted successfully',
  });
});

export var resetToDefault = asyncHandler(async (req, res) => {
  const { productId } = req.params;

  const product = await SellProduct.findById(productId);
  if (!product) {
    throw new ApiError(404, 'Product not found');
  }

  await SellConfig.deleteOne({ productId });

  const config = await SellConfig.createDefaultForProduct(
    productId,
    req.user.id
  );

  res.json({
    success: true,
    message: 'Configuration reset to default successfully',
    data: config,
  });
});

export var testPricing = asyncHandler(async (req, res) => {
  const { productId } = req.params;
  const { basePrice, adjustments } = req.body;

  if (!basePrice || !Array.isArray(adjustments)) {
    throw new ApiError(400, 'Base price and adjustments array are required');
  }

  let config = await SellConfig.findOne({ productId });

  if (!config) {
    config = SellConfig.getDefaultConfig();
  }

  let totalAdjustment = 0;
  const breakdown = [];

  for (const adjustment of adjustments) {
    const { label, delta } = adjustment;
    let adjustmentValue = 0;

    if (delta.type === 'abs') {
      adjustmentValue = delta.sign === '+' ? delta.value : -delta.value;
    } else if (delta.type === 'percent') {
      adjustmentValue = (basePrice * delta.value) / 100;
      adjustmentValue = delta.sign === '+' ? adjustmentValue : -adjustmentValue;
    }

    totalAdjustment += adjustmentValue;
    breakdown.push({
      label,
      delta: adjustmentValue,
    });
  }

  const rawPrice = basePrice + totalAdjustment;
  const finalPrice = config.applyPricingRules(basePrice, rawPrice);

  res.json({
    success: true,
    data: {
      basePrice,
      totalAdjustment,
      rawPrice,
      finalPrice,
      breakdown,
      rules: config.rules,
    },
  });
});

export var getAllConfigs = asyncHandler(async (req, res) => {
  const { page = 1, limit = 10 } = req.query;

  const options = {
    page: parseInt(page),
    limit: parseInt(limit),
    populate: [
      { path: 'productId', select: 'name status' },
      { path: 'createdBy', select: 'name email' },
    ],
    sort: { createdAt: -1 },
  };

  const configs = await SellConfig.paginate({}, options);

  res.json({
    success: true,
    data: configs,
  });
});
