const Pricing = require('../models/pricing.model');
const Product = require('../models/product.model');
const { validationResult } = require('express-validator');
const mongoose = require('mongoose');

// @desc    Get all pricing configurations
// @route   GET /api/admin/pricing
// @access  Private/Admin
const getPricingConfigs = async (req, res) => {
  try {
    const {
      page = 1,
      limit = 10,
      isActive,
      productId,
      search,
      sortBy = 'createdAt',
      sortOrder = 'desc',
    } = req.query;

    // Build filter object
    const filter = {};
    if (isActive !== undefined) filter.isActive = isActive === 'true';
    if (productId) filter.product = productId;

    // Calculate pagination
    const skip = (parseInt(page) - 1) * parseInt(limit);
    const sortOptions = { [sortBy]: sortOrder === 'desc' ? -1 : 1 };

    // Build aggregation pipeline
    const pipeline = [
      {
        $lookup: {
          from: 'products',
          localField: 'product',
          foreignField: '_id',
          as: 'productInfo',
        },
      },
      {
        $unwind: '$productInfo',
      },
    ];

    // Add search filter if provided
    if (search) {
      pipeline.push({
        $match: {
          $or: [
            { 'productInfo.name': { $regex: search, $options: 'i' } },
            { 'productInfo.brand': { $regex: search, $options: 'i' } },
            { 'productInfo.model': { $regex: search, $options: 'i' } },
          ],
        },
      });
    }

    // Add other filters
    if (Object.keys(filter).length > 0) {
      pipeline.push({ $match: filter });
    }

    // Add sorting
    pipeline.push({ $sort: sortOptions });

    // Add pagination
    pipeline.push({ $skip: skip }, { $limit: parseInt(limit) });

    // Add user lookup for updatedBy
    pipeline.push({
      $lookup: {
        from: 'users',
        localField: 'updatedBy',
        foreignField: '_id',
        as: 'updatedByInfo',
      },
    });

    const pricingConfigs = await Pricing.aggregate(pipeline);

    // Get total count
    const countPipeline = [
      {
        $lookup: {
          from: 'products',
          localField: 'product',
          foreignField: '_id',
          as: 'productInfo',
        },
      },
      { $unwind: '$productInfo' },
    ];

    if (search) {
      countPipeline.push({
        $match: {
          $or: [
            { 'productInfo.name': { $regex: search, $options: 'i' } },
            { 'productInfo.brand': { $regex: search, $options: 'i' } },
            { 'productInfo.model': { $regex: search, $options: 'i' } },
          ],
        },
      });
    }

    if (Object.keys(filter).length > 0) {
      countPipeline.push({ $match: filter });
    }

    countPipeline.push({ $count: 'total' });
    const totalResult = await Pricing.aggregate(countPipeline);
    const total = totalResult[0]?.total || 0;

    res.json({
      pricingConfigs,
      pagination: {
        current: parseInt(page),
        pages: Math.ceil(total / parseInt(limit)),
        total,
        limit: parseInt(limit),
      },
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server Error', error: error.message });
  }
};

// @desc    Get single pricing configuration
// @route   GET /api/admin/pricing/:id
// @access  Private/Admin
const getPricingConfig = async (req, res) => {
  try {
    const pricing = await Pricing.findById(req.params.id)
      .populate('product', 'name brand model category')
      .populate('updatedBy', 'name email')
      .populate('priceHistory.updatedBy', 'name email');

    if (!pricing) {
      return res.status(404).json({ message: 'Pricing configuration not found' });
    }

    res.json(pricing);
  } catch (error) {
    console.error(error);
    if (error.kind === 'ObjectId') {
      return res.status(404).json({ message: 'Pricing configuration not found' });
    }
    res.status(500).json({ message: 'Server Error', error: error.message });
  }
};

// @desc    Create pricing configuration
// @route   POST /api/admin/pricing
// @access  Private/Admin
const createPricingConfig = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { product: productId } = req.body;

    // Check if product exists
    const product = await Product.findById(productId);
    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }

    // Check if active pricing already exists for this product
    const existingPricing = await Pricing.findOne({
      product: productId,
      isActive: true,
    });

    if (existingPricing) {
      return res.status(400).json({
        message: 'Active pricing configuration already exists for this product',
      });
    }

    const pricingData = {
      ...req.body,
      updatedBy: req.user.id,
    };

    const pricing = new Pricing(pricingData);
    await pricing.save();

    const populatedPricing = await Pricing.findById(pricing._id)
      .populate('product', 'name brand model category')
      .populate('updatedBy', 'name email');

    res.status(201).json(populatedPricing);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server Error', error: error.message });
  }
};

// @desc    Update pricing configuration
// @route   PUT /api/admin/pricing/:id
// @access  Private/Admin
const updatePricingConfig = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const pricing = await Pricing.findById(req.params.id);
    if (!pricing) {
      return res.status(404).json({ message: 'Pricing configuration not found' });
    }

    // Store current pricing in history before updating
    const historyEntry = {
      date: new Date(),
      basePrice: pricing.basePrice,
      conditions: pricing.conditions,
      reason: req.body.updateReason || 'Manual update',
      updatedBy: req.user.id,
    };

    const updateData = {
      ...req.body,
      updatedBy: req.user.id,
      $push: { priceHistory: historyEntry },
    };

    const updatedPricing = await Pricing.findByIdAndUpdate(
      req.params.id,
      updateData,
      { new: true, runValidators: true }
    )
      .populate('product', 'name brand model category')
      .populate('updatedBy', 'name email');

    res.json(updatedPricing);
  } catch (error) {
    console.error(error);
    if (error.kind === 'ObjectId') {
      return res.status(404).json({ message: 'Pricing configuration not found' });
    }
    res.status(500).json({ message: 'Server Error', error: error.message });
  }
};

// @desc    Delete pricing configuration
// @route   DELETE /api/admin/pricing/:id
// @access  Private/Admin
const deletePricingConfig = async (req, res) => {
  try {
    const pricing = await Pricing.findById(req.params.id);
    if (!pricing) {
      return res.status(404).json({ message: 'Pricing configuration not found' });
    }

    await Pricing.findByIdAndDelete(req.params.id);
    res.json({ message: 'Pricing configuration deleted successfully' });
  } catch (error) {
    console.error(error);
    if (error.kind === 'ObjectId') {
      return res.status(404).json({ message: 'Pricing configuration not found' });
    }
    res.status(500).json({ message: 'Server Error', error: error.message });
  }
};

// @desc    Get pricing for specific product
// @route   GET /api/admin/pricing/product/:productId
// @access  Private/Admin
const getProductPricing = async (req, res) => {
  try {
    const { productId } = req.params;
    const { condition } = req.query;

    const pricing = await Pricing.getActivePricing(productId);
    if (!pricing) {
      return res.status(404).json({ message: 'No active pricing found for this product' });
    }

    let response = {
      pricing,
      allConditions: {
        excellent: pricing.conditions.excellent,
        good: pricing.conditions.good,
        fair: pricing.conditions.fair,
        poor: pricing.conditions.poor,
      },
    };

    if (condition) {
      response.conditionPrice = pricing.getPriceForCondition(condition);
      response.finalPrice = pricing.calculateFinalPrice(condition);
    }

    res.json(response);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server Error', error: error.message });
  }
};

// @desc    Bulk update pricing
// @route   PUT /api/admin/pricing/bulk-update
// @access  Private/Admin
const bulkUpdatePricing = async (req, res) => {
  try {
    const { updates, updateReason = 'Bulk update' } = req.body;

    if (!Array.isArray(updates) || updates.length === 0) {
      return res.status(400).json({ message: 'Updates array is required' });
    }

    const results = [];
    const errors = [];

    for (const update of updates) {
      try {
        const { pricingId, ...updateData } = update;
        
        const pricing = await Pricing.findById(pricingId);
        if (!pricing) {
          errors.push({ pricingId, error: 'Pricing configuration not found' });
          continue;
        }

        // Store current pricing in history
        const historyEntry = {
          date: new Date(),
          basePrice: pricing.basePrice,
          conditions: pricing.conditions,
          reason: updateReason,
          updatedBy: req.user.id,
        };

        const updatedPricing = await Pricing.findByIdAndUpdate(
          pricingId,
          {
            ...updateData,
            updatedBy: req.user.id,
            $push: { priceHistory: historyEntry },
          },
          { new: true, runValidators: true }
        ).populate('product', 'name brand model');

        results.push(updatedPricing);
      } catch (error) {
        errors.push({ pricingId: update.pricingId, error: error.message });
      }
    }

    res.json({
      message: `Bulk update completed. ${results.length} successful, ${errors.length} failed.`,
      results,
      errors,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server Error', error: error.message });
  }
};

// @desc    Get pricing statistics
// @route   GET /api/admin/pricing/stats
// @access  Private/Admin
const getPricingStats = async (req, res) => {
  try {
    const stats = await Pricing.aggregate([
      {
        $group: {
          _id: null,
          totalConfigs: { $sum: 1 },
          activeConfigs: { $sum: { $cond: ['$isActive', 1, 0] } },
          avgBasePrice: { $avg: '$basePrice' },
          minBasePrice: { $min: '$basePrice' },
          maxBasePrice: { $max: '$basePrice' },
        },
      },
    ]);

    const categoryStats = await Pricing.aggregate([
      {
        $lookup: {
          from: 'products',
          localField: 'product',
          foreignField: '_id',
          as: 'productInfo',
        },
      },
      { $unwind: '$productInfo' },
      {
        $group: {
          _id: '$productInfo.category',
          count: { $sum: 1 },
          avgPrice: { $avg: '$basePrice' },
        },
      },
      { $sort: { count: -1 } },
    ]);

    res.json({
      overview: stats[0] || {
        totalConfigs: 0,
        activeConfigs: 0,
        avgBasePrice: 0,
        minBasePrice: 0,
        maxBasePrice: 0,
      },
      categoryBreakdown: categoryStats,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server Error', error: error.message });
  }
};

module.exports = {
  getPricingConfigs,
  getPricingConfig,
  createPricingConfig,
  updatePricingConfig,
  deletePricingConfig,
  getProductPricing,
  bulkUpdatePricing,
  getPricingStats,
};