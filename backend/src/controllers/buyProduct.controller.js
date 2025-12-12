const BuyProduct = require('../models/buyProduct.model');
const BuyCategory = require('../models/buyCategory.model');
const { validationResult } = require('express-validator');
const { processArrayFields } = require('../utils/dataProcessing.utils');

// Get all buy products with pagination and filtering
const getBuyProducts = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    // Build filter object
    const filter = {};

    // Filter by categoryId (ObjectId)
    if (req.query.categoryId) {
      filter.categoryId = req.query.categoryId;
    }

    // Filter by category name
    if (req.query.category) {
      const categoryDoc = await BuyCategory.findOne({
        name: new RegExp(`^${req.query.category}$`, 'i'),
      });
      if (categoryDoc) {
        filter.categoryId = categoryDoc._id;
      }
    }

    if (req.query.brand) filter.brand = new RegExp(req.query.brand, 'i');
    if (req.query.isActive !== undefined)
      filter.isActive = req.query.isActive === 'true';
    if (req.query.search) {
      filter.$or = [
        { name: new RegExp(req.query.search, 'i') },
        { brand: new RegExp(req.query.search, 'i') },
        { description: new RegExp(req.query.search, 'i') },
      ];
    }

    // Build sort object
    let sort = { createdAt: -1 };
    if (req.query.sortBy) {
      const sortField = req.query.sortBy;
      const sortOrder = req.query.sortOrder === 'asc' ? 1 : -1;
      sort = { [sortField]: sortOrder };
    }

    const products = await BuyProduct.find(filter)
      .populate('categoryId', 'name')
      .sort(sort)
      .skip(skip)
      .limit(limit)
      .lean();

    const total = await BuyProduct.countDocuments(filter);

    res.json({
      success: true,
      data: products,
      pagination: {
        current: page,
        pages: Math.ceil(total / limit),
        total,
        limit,
      },
    });
  } catch (error) {
    console.error('Error fetching buy products:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching buy products',
      error: error.message,
    });
  }
};

// Delete buy product
const deleteBuyProduct = async (req, res) => {
  try {
    // Find product first to check ownership
    const product = await BuyProduct.findById(req.params.id);

    if (!product) {
      return res.status(404).json({
        success: false,
        message: 'Buy product not found',
      });
    }

    // 🔒 OWNERSHIP CHECK - Partners can only delete their own products
    if (req.user && req.user.role === 'partner' && req.partnerId) {
      if (
        product.partnerId &&
        product.partnerId.toString() !== req.partnerId.toString()
      ) {
        return res.status(403).json({
          success: false,
          message: 'You do not have permission to delete this product',
        });
      }
    }

    // Now delete the product
    await BuyProduct.findByIdAndDelete(req.params.id);

    res.json({
      success: true,
      message: 'Buy product deleted successfully',
    });
  } catch (error) {
    console.error('Error deleting buy product:', error);
    res.status(500).json({
      success: false,
      message: 'Error deleting buy product',
      error: error.message,
    });
  }
};

// (Removed malformed mid-file module.exports and stray JSON)

// Get single buy product by ID
const getBuyProductById = async (req, res) => {
  try {
    const product = await BuyProduct.findById(req.params.id)
      .populate('categoryId', 'name')
      .populate('createdBy', 'name email')
      .populate('updatedBy', 'name email');

    if (!product) {
      return res.status(404).json({
        success: false,
        message: 'Buy product not found',
      });
    }

    res.json({
      success: true,
      data: product,
    });
  } catch (error) {
    console.error('Error fetching buy product:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching buy product',
      error: error.message,
    });
  }
};

// Create new buy product
function normalizeBuyProductInput(input = {}) {
  const body = JSON.parse(JSON.stringify(input));

  delete body._id;
  delete body.createdAt;
  delete body.updatedAt;

  // topSpecs: ensure object
  if (Array.isArray(body.topSpecs)) {
    const [
      screenSize = '',
      chipset = '',
      pixelDensity = '',
      networkSupport = '',
      simSlots = '',
    ] = body.topSpecs;
    body.topSpecs = {
      screenSize,
      chipset,
      pixelDensity,
      networkSupport,
      simSlots,
    };
  }

  body.productDetails = body.productDetails || {};

  // map cameras → front/rearCamera
  if (
    body.productDetails.cameras &&
    typeof body.productDetails.cameras === 'object'
  ) {
    const { front = {}, rear = {} } = body.productDetails.cameras;
    body.productDetails.frontCamera = body.productDetails.frontCamera || {};
    if (!body.productDetails.frontCamera.resolution && front.primary)
      body.productDetails.frontCamera.resolution = front.primary;

    body.productDetails.rearCamera = body.productDetails.rearCamera || {};
    if (
      !body.productDetails.rearCamera.camera1 &&
      (rear.primary || rear.main)
    ) {
      body.productDetails.rearCamera.camera1 = {
        resolution: rear.primary || rear.main,
        aperture: rear.aperture,
        type: rear.type || 'Main',
        lens: rear.lens,
      };
    }
    if (
      !body.productDetails.rearCamera.camera2 &&
      (rear.telephoto || rear.ultraWide)
    ) {
      const res = rear.telephoto || rear.ultraWide;
      body.productDetails.rearCamera.camera2 = {
        resolution: res,
        aperture: rear.telephotoAperture || rear.ultraWideAperture,
        type: rear.telephoto ? 'Telephoto' : 'Ultra-wide',
        lens: rear.telephoto ? 'Optical Zoom' : 'Ultra-wide',
      };
    }
    delete body.productDetails.cameras;
  }

  // network → networkConnectivity
  if (
    body.productDetails.network &&
    typeof body.productDetails.network === 'object'
  ) {
    const n = body.productDetails.network;
    body.productDetails.networkConnectivity = {
      wifi: n.wifi || n.connectivity || '',
      bluetooth: n.bluetooth || '',
      nfc: n.nfc || '',
      gps: n.gps || '',
      volte: n.volte || '',
      esim: n.esim || '',
      audioJack: n.audioJack || 'No',
      has3p5mmJack: n.has3p5mmJack || false,
      networkSupport: n.connectivity || '',
    };
    delete body.productDetails.network;
  }

  // Ensure objects not strings
  if (typeof body.productDetails.frontCamera !== 'object')
    body.productDetails.frontCamera = {};
  if (typeof body.productDetails.rearCamera !== 'object')
    body.productDetails.rearCamera = {};

  // paymentOptions normalization
  if (body.paymentOptions && typeof body.paymentOptions === 'object') {
    const p = body.paymentOptions;
    const methods = [];
    if (p.upi) methods.push('UPI');
    if (p.bankTransfer) methods.push('Bank Transfer');
    if (p.wallet) methods.push('Wallet');
    if (p.instantPayment) methods.push('Instant Payment');

    body.paymentOptions = {
      emiAvailable: p.emiAvailable || false,
      emiPlans: Array.isArray(p.emiPlans) ? p.emiPlans : [],
      methods,
    };
  }

  // availability normalization
  if (body.availability && typeof body.availability === 'object') {
    const a = body.availability;
    body.availability = {
      inStock: a.inStock !== false,
      deliveryPincode: a.deliveryPincode || '',
      estimatedDelivery: a.estimatedDelivery || '',
    };
  }

  return body;
}

// ✅ Updated createBuyProduct
const createBuyProduct = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: errors.array(),
      });
    }

    const category = await BuyCategory.findById(req.body.categoryId);
    if (!category) {
      return res.status(400).json({
        success: false,
        message: 'Invalid category ID',
      });
    }

    // ✅ Normalize input before saving
    const normalizedData = normalizeBuyProductInput(req.body);

    const productData = {
      ...normalizedData,
      createdBy: req.user ? req.user.id : null,
    };

    // 🔒 AUTO-ATTACH partnerId if user is a partner
    if (req.user && req.user.role === 'partner' && req.partnerId) {
      productData.partnerId = req.partnerId;
    }

    const product = new BuyProduct(productData);
    await product.save();

    const populatedProduct = await BuyProduct.findById(product._id)
      .populate('categoryId', 'name')
      .populate('createdBy', 'name email');

    res.status(201).json({
      success: true,
      message: 'Buy product created successfully',
      data: populatedProduct,
    });
  } catch (error) {
    console.error('Error creating buy product:', error);
    res.status(500).json({
      success: false,
      message: 'Error creating buy product',
      error: error.message,
    });
  }
};
// Update buy product
const updateBuyProduct = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: errors.array(),
      });
    }

    // Verify category exists if categoryId is being updated
    if (req.body.categoryId) {
      const category = await BuyCategory.findById(req.body.categoryId);
      if (!category) {
        return res.status(400).json({
          success: false,
          message: 'Invalid category ID',
        });
      }
    }

    // Find product first to check ownership
    const existingProduct = await BuyProduct.findById(req.params.id);

    if (!existingProduct) {
      return res.status(404).json({
        success: false,
        message: 'Buy product not found',
      });
    }

    // 🔒 OWNERSHIP CHECK - Partners can only update their own products
    if (req.user && req.user.role === 'partner' && req.partnerId) {
      if (
        existingProduct.partnerId &&
        existingProduct.partnerId.toString() !== req.partnerId.toString()
      ) {
        return res.status(403).json({
          success: false,
          message: 'You do not have permission to update this product',
        });
      }
    }

    // Process array fields to ensure proper data structure
    const processedData = processArrayFields(req.body);

    const updateData = {
      ...processedData,
      updatedBy: req.user.id,
    };

    const product = await BuyProduct.findByIdAndUpdate(
      req.params.id,
      updateData,
      { new: true, runValidators: true }
    )
      .populate('categoryId', 'name')
      .populate('updatedBy', 'name email');

    res.json({
      success: true,
      message: 'Buy product deleted successfully',
    });
  } catch (error) {
    console.error('Error deleting buy product:', error);
    res.status(500).json({
      success: false,
      message: 'Error deleting buy product',
      error: error.message,
    });
  }
};

// Get buy products statistics
const getBuyProductStats = async (req, res) => {
  try {
    const totalProducts = await BuyProduct.countDocuments();
    const activeProducts = await BuyProduct.countDocuments({ isActive: true });
    const inactiveProducts = await BuyProduct.countDocuments({
      isActive: false,
    });
    const refurbishedProducts = await BuyProduct.countDocuments({
      isRefurbished: true,
    });

    // Get products by category
    const productsByCategory = await BuyProduct.aggregate([
      {
        $lookup: {
          from: 'buycategories',
          localField: 'categoryId',
          foreignField: '_id',
          as: 'category',
        },
      },
      {
        $unwind: '$category',
      },
      {
        $group: {
          _id: '$category.name',
          count: { $sum: 1 },
        },
      },
      {
        $sort: { count: -1 },
      },
    ]);

    // Get top rated products
    const topRatedProducts = await BuyProduct.find({
      'rating.average': { $gte: 4 },
    })
      .select('name brand rating.average')
      .sort({ 'rating.average': -1 })
      .limit(5);

    // Get recent products
    const recentProducts = await BuyProduct.find()
      .populate('categoryId', 'name')
      .select('name brand createdAt categoryId')
      .sort({ createdAt: -1 })
      .limit(5);

    res.json({
      success: true,
      data: {
        overview: {
          totalProducts,
          activeProducts,
          inactiveProducts,
          refurbishedProducts,
        },
        productsByCategory,
        topRatedProducts,
        recentProducts,
      },
    });
  } catch (error) {
    console.error('Error fetching buy product stats:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching buy product statistics',
      error: error.message,
    });
  }
};

// Add product review
const addProductReview = async (req, res) => {
  try {
    const { rating, comment, reviewer } = req.body;
    const productId = req.params.id;

    const product = await BuyProduct.findById(productId);
    if (!product) {
      return res.status(404).json({
        success: false,
        message: 'Product not found',
      });
    }

    // Add new review
    const newReview = {
      reviewer: reviewer || 'Anonymous',
      rating,
      comment,
      date: new Date().toISOString(),
    };

    product.reviews.push(newReview);

    // Update rating breakdown and average
    const ratingKey = `${rating}star`;
    product.rating.breakdown[ratingKey] += 1;
    product.rating.totalReviews += 1;

    // Recalculate average rating
    const totalRating =
      product.rating.breakdown['5star'] * 5 +
      product.rating.breakdown['4star'] * 4 +
      product.rating.breakdown['3star'] * 3 +
      product.rating.breakdown['2star'] * 2 +
      product.rating.breakdown['1star'] * 1;

    product.rating.average = totalRating / product.rating.totalReviews;

    await product.save();

    res.json({
      success: true,
      message: 'Review added successfully',
      data: {
        review: newReview,
        updatedRating: product.rating,
      },
    });
  } catch (error) {
    console.error('Error adding product review:', error);
    res.status(500).json({
      success: false,
      message: 'Error adding product review',
      error: error.message,
    });
  }
};

// Toggle product status
const toggleProductStatus = async (req, res) => {
  try {
    const product = await BuyProduct.findById(req.params.id);
    if (!product) {
      return res.status(404).json({
        success: false,
        message: 'Product not found',
      });
    }

    product.isActive = !product.isActive;
    product.updatedBy = req.user.id;
    await product.save();

    res.json({
      success: true,
      message: `Product ${product.isActive ? 'activated' : 'deactivated'} successfully`,
      data: { isActive: product.isActive },
    });
  } catch (error) {
    console.error('Error toggling product status:', error);
    res.status(500).json({
      success: false,
      message: 'Error toggling product status',
      error: error.message,
    });
  }
};

// Get buy products by category
const getBuyProductsByCategory = async (req, res) => {
  try {
    const { category } = req.params;
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const skip = (page - 1) * limit;

    // Find category by name (case-insensitive)
    const categoryDoc = await BuyCategory.findOne({
      name: new RegExp(`^${category}$`, 'i'),
      isActive: true,
    });

    if (!categoryDoc) {
      return res.status(404).json({
        success: false,
        message: 'Category not found',
      });
    }

    // Build filter object
    const filter = {
      categoryId: categoryDoc._id,
      isActive: true,
    };

    // Add search functionality if provided
    if (req.query.search) {
      filter.$or = [
        { name: new RegExp(req.query.search, 'i') },
        { brand: new RegExp(req.query.search, 'i') },
        { description: new RegExp(req.query.search, 'i') },
      ];
    }

    // Add brand filter if provided
    if (req.query.brand) {
      filter.brand = new RegExp(req.query.brand, 'i');
    }

    // Build sort object
    let sort = { createdAt: -1 };
    if (req.query.sortBy) {
      const sortField = req.query.sortBy;
      const sortOrder = req.query.sortOrder === 'asc' ? 1 : -1;
      sort = { [sortField]: sortOrder };
    }

    const products = await BuyProduct.find(filter)
      .populate('categoryId', 'name')
      .sort(sort)
      .skip(skip)
      .limit(limit)
      .lean();

    const total = await BuyProduct.countDocuments(filter);

    res.json({
      success: true,
      data: products,
      category: {
        id: categoryDoc._id,
        name: categoryDoc.name,
      },
      pagination: {
        current: page,
        pages: Math.ceil(total / limit),
        total,
        limit,
      },
    });
  } catch (error) {
    console.error('Error fetching products by category:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching products by category',
      error: error.message,
    });
  }
};

module.exports = {
  getBuyProducts,
  getBuyProductById,
  getBuyProductsByCategory,
  createBuyProduct,
  updateBuyProduct,
  deleteBuyProduct,
  getBuyProductStats,
  addProductReview,
  toggleProductStatus,
};
