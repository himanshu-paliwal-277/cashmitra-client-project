const Partner = require('../models/partner.model');
const User = require('../models/user.model');
const Inventory = require('../models/inventory.model');
const { Order } = require('../models/order.model');
const Product = require('../models/product.model');
const ApiError = require('../utils/apiError');
const { sanitizeXSS } = require('../utils/security.utils');

/**
 * Register a new partner shop
 * @route POST /api/partner/register
 * @access Private (User must be logged in)
 */
exports.registerPartnerShop = async (req, res) => {
  const userId = req.user.id;
  
  // Check if user already has a partner shop
  const existingPartner = await Partner.findOne({ user: userId });
  if (existingPartner) {
    throw new ApiError('You already have a registered partner shop', 400);
  }
  
  // Sanitize inputs
  const sanitizedData = {
    shopName: sanitizeXSS(req.body.shopName),
    shopAddress: {
      street: sanitizeXSS(req.body.shopAddress.street),
      city: sanitizeXSS(req.body.shopAddress.city),
      state: sanitizeXSS(req.body.shopAddress.state),
      pincode: sanitizeXSS(req.body.shopAddress.pincode),
    },
    gstNumber: sanitizeXSS(req.body.gstNumber),
    shopPhone: sanitizeXSS(req.body.shopPhone),
    shopEmail: sanitizeXSS(req.body.shopEmail),
  };
  
  // Create partner shop
  const partner = await Partner.create({
    user: userId,
    ...sanitizedData,
    isVerified: false, // Requires admin verification
    verificationStatus: 'pending',
    wallet: { balance: 0 },
  });
  
  // Update user role to include partner
  await User.findByIdAndUpdate(userId, { $addToSet: { role: 'partner' } });
  
  res.status(201).json({
    success: true,
    data: partner,
    message: 'Partner shop registered successfully. Verification pending.',
  });
};

/**
 * Get partner profile
 * @route GET /api/partner/profile
 * @access Private (Partner only)
 */
exports.getPartnerProfile = async (req, res) => {
  const userId = req.user.id;
  
  const partner = await Partner.findOne({ user: userId })
    .populate('user', 'name email phone');
  
  if (!partner) {
    throw new ApiError('Partner profile not found', 404);
  }
  
  res.status(200).json({
    success: true,
    data: partner,
  });
};

/**
 * Update partner profile
 * @route PUT /api/partner/profile
 * @access Private (Partner only)
 */
exports.updatePartnerProfile = async (req, res) => {
  const userId = req.user.id;
  
  // Sanitize inputs
  const updateData = {};
  if (req.body.shopName) updateData.shopName = sanitizeXSS(req.body.shopName);
  if (req.body.shopPhone) updateData.shopPhone = sanitizeXSS(req.body.shopPhone);
  if (req.body.shopEmail) updateData.shopEmail = sanitizeXSS(req.body.shopEmail);
  
  if (req.body.shopAddress) {
    updateData.shopAddress = {};
    if (req.body.shopAddress.street) updateData.shopAddress.street = sanitizeXSS(req.body.shopAddress.street);
    if (req.body.shopAddress.city) updateData.shopAddress.city = sanitizeXSS(req.body.shopAddress.city);
    if (req.body.shopAddress.state) updateData.shopAddress.state = sanitizeXSS(req.body.shopAddress.state);
    if (req.body.shopAddress.pincode) updateData.shopAddress.pincode = sanitizeXSS(req.body.shopAddress.pincode);
  }
  
  if (req.body.bankDetails) {
    updateData.bankDetails = {};
    if (req.body.bankDetails.accountName) updateData.bankDetails.accountName = sanitizeXSS(req.body.bankDetails.accountName);
    if (req.body.bankDetails.accountNumber) updateData.bankDetails.accountNumber = sanitizeXSS(req.body.bankDetails.accountNumber);
    if (req.body.bankDetails.ifscCode) updateData.bankDetails.ifscCode = sanitizeXSS(req.body.bankDetails.ifscCode);
    if (req.body.bankDetails.bankName) updateData.bankDetails.bankName = sanitizeXSS(req.body.bankDetails.bankName);
  }
  
  const partner = await Partner.findOneAndUpdate(
    { user: userId },
    { $set: updateData },
    { new: true, runValidators: true }
  );
  
  if (!partner) {
    throw new ApiError('Partner profile not found', 404);
  }
  
  res.status(200).json({
    success: true,
    data: partner,
    message: 'Partner profile updated successfully',
  });
};

/**
 * Upload partner documents
 * @route PUT /api/partner/documents
 * @access Private (Partner only)
 */
exports.uploadDocuments = async (req, res) => {
  const userId = req.user.id;
  
  const updateData = {};
  if (req.body.gstCertificate) updateData.gstCertificate = sanitizeXSS(req.body.gstCertificate);
  if (req.body.shopLicense) updateData.shopLicense = sanitizeXSS(req.body.shopLicense);
  if (req.body.ownerIdProof) updateData.ownerIdProof = sanitizeXSS(req.body.ownerIdProof);
  
  if (req.body.additionalDocuments && Array.isArray(req.body.additionalDocuments)) {
    updateData.additionalDocuments = req.body.additionalDocuments.map(doc => sanitizeXSS(doc));
  }
  
  // Update verification status if documents are being uploaded
  if (Object.keys(updateData).length > 0) {
    updateData.verificationStatus = 'submitted';
  }
  
  const partner = await Partner.findOneAndUpdate(
    { user: userId },
    { $set: updateData },
    { new: true }
  );
  
  if (!partner) {
    throw new ApiError('Partner profile not found', 404);
  }
  
  res.status(200).json({
    success: true,
    data: partner,
    message: 'Documents uploaded successfully',
  });
};

/**
 * Add inventory item
 * @route POST /api/partner/inventory
 * @access Private (Partner only)
 */
exports.addInventory = async (req, res) => {
  const partnerId = await Partner.findOne({ user: req.user.id });
  if (!partnerId) {
    throw new ApiError('Partner profile not found', 404);
  }
  
  // Check if partner is verified
  if (!partnerId.isVerified) {
    throw new ApiError('Your partner account is not verified yet', 403);
  }
  
  // Check if product exists
  const product = await Product.findById(req.body.productId);
  if (!product) {
    throw new ApiError('Product not found', 404);
  }
  
  // Check if inventory already exists for this product
  const existingInventory = await Inventory.findOne({
    partner: partnerId._id,
    product: req.body.productId,
    condition: req.body.condition
  });
  
  if (existingInventory) {
    throw new ApiError('You already have this product in your inventory with the same condition', 400);
  }
  
  // Create inventory item
  const inventory = await Inventory.create({
    partner: partnerId._id,
    product: req.body.productId,
    condition: req.body.condition,
    price: req.body.price,
    originalPrice: req.body.originalPrice,
    quantity: req.body.quantity,
    isAvailable: true,
    warranty: req.body.warranty || 0,
    additionalSpecs: req.body.additionalSpecs || {},
    images: req.body.images || []
  });
  
  res.status(201).json({
    success: true,
    data: inventory,
    message: 'Inventory item added successfully',
  });
};

/**
 * Get partner inventory
 * @route GET /api/partner/inventory
 * @access Private (Partner only)
 */
exports.getInventory = async (req, res) => {
  const partner = await Partner.findOne({ user: req.user.id });
  if (!partner) {
    throw new ApiError('Partner profile not found', 404);
  }
  
  const { page = 1, limit = 10, sort = '-createdAt', condition, isAvailable } = req.query;
  
  const queryObj = { partner: partner._id };
  if (condition) queryObj.condition = condition;
  if (isAvailable !== undefined) queryObj.isAvailable = isAvailable === 'true';
  
  const options = {
    page: parseInt(page, 10),
    limit: parseInt(limit, 10),
    sort,
    populate: {
      path: 'product',
      select: 'name brand category images'
    }
  };
  
  const inventory = await Inventory.paginate(queryObj, options);
  
  res.status(200).json({
    success: true,
    data: inventory,
  });
};

/**
 * Update inventory item
 * @route PUT /api/partner/inventory/:id
 * @access Private (Partner only)
 */
exports.updateInventory = async (req, res) => {
  const partner = await Partner.findOne({ user: req.user.id });
  if (!partner) {
    throw new ApiError('Partner profile not found', 404);
  }
  
  // Find inventory and check ownership
  const inventory = await Inventory.findOne({
    _id: req.params.id,
    partner: partner._id
  });
  
  if (!inventory) {
    throw new ApiError('Inventory item not found or not owned by you', 404);
  }
  
  // Update fields
  const updateData = {};
  if (req.body.price !== undefined) updateData.price = req.body.price;
  if (req.body.originalPrice !== undefined) updateData.originalPrice = req.body.originalPrice;
  if (req.body.quantity !== undefined) updateData.quantity = req.body.quantity;
  if (req.body.isAvailable !== undefined) updateData.isAvailable = req.body.isAvailable;
  if (req.body.warranty !== undefined) updateData.warranty = req.body.warranty;
  if (req.body.additionalSpecs) updateData.additionalSpecs = req.body.additionalSpecs;
  if (req.body.images) updateData.images = req.body.images;
  
  const updatedInventory = await Inventory.findByIdAndUpdate(
    req.params.id,
    { $set: updateData },
    { new: true, runValidators: true }
  ).populate('product', 'name brand category images');
  
  res.status(200).json({
    success: true,
    data: updatedInventory,
    message: 'Inventory item updated successfully',
  });
};

/**
 * Delete inventory item
 * @route DELETE /api/partner/inventory/:id
 * @access Private (Partner only)
 */
exports.deleteInventory = async (req, res) => {
  const partner = await Partner.findOne({ user: req.user.id });
  if (!partner) {
    throw new ApiError('Partner profile not found', 404);
  }
  
  // Find inventory and check ownership
  const inventory = await Inventory.findOne({
    _id: req.params.id,
    partner: partner._id
  });
  
  if (!inventory) {
    throw new ApiError('Inventory item not found or not owned by you', 404);
  }
  
  // Check if there are any active orders for this inventory
  const activeOrders = await Order.countDocuments({
    'items.inventory': req.params.id,
    status: { $nin: ['delivered', 'cancelled'] }
  });
  
  if (activeOrders > 0) {
    throw new ApiError('Cannot delete inventory with active orders', 400);
  }
  
  await Inventory.findByIdAndDelete(req.params.id);
  
  res.status(200).json({
    success: true,
    message: 'Inventory item deleted successfully',
  });
};

/**
 * Get partner orders
 * @route GET /api/partner/orders
 * @access Private (Partner only)
 */
exports.getOrders = async (req, res) => {
  const partner = await Partner.findOne({ user: req.user.id });
  if (!partner) {
    throw new ApiError('Partner profile not found', 404);
  }
  
  const { page = 1, limit = 10, sort = '-createdAt', status } = req.query;
  
  const queryObj = { 'items.partner': partner._id };
  if (status) queryObj.status = status;
  
  const options = {
    page: parseInt(page, 10),
    limit: parseInt(limit, 10),
    sort,
    populate: [
      { path: 'user', select: 'name email phone' },
      { path: 'items.inventory', populate: { path: 'product', select: 'name brand category images' } }
    ]
  };
  
  const orders = await Order.paginate(queryObj, options);
  
  // Filter orders to only include items from this partner
  const filteredOrders = orders.docs.map(order => {
    const partnerItems = order.items.filter(item => 
      item.partner && item.partner.toString() === partner._id.toString()
    );
    
    return {
      ...order.toObject(),
      items: partnerItems
    };
  });
  
  res.status(200).json({
    success: true,
    data: {
      ...orders,
      docs: filteredOrders
    },
  });
};

/**
 * Update order status
 * @route PUT /api/partner/orders/:id
 * @access Private (Partner only)
 */
exports.updateOrderStatus = async (req, res) => {
  const partner = await Partner.findOne({ user: req.user.id });
  if (!partner) {
    throw new ApiError('Partner profile not found', 404);
  }
  
  const order = await Order.findById(req.params.id);
  if (!order) {
    throw new ApiError('Order not found', 404);
  }
  
  // Check if order contains items from this partner
  const partnerItems = order.items.filter(item => 
    item.partner && item.partner.toString() === partner._id.toString()
  );
  
  if (partnerItems.length === 0) {
    throw new ApiError('Order does not contain items from your shop', 403);
  }
  
  // Update status for partner's items only
  for (const item of partnerItems) {
    item.status = req.body.status;
    if (req.body.trackingInfo) {
      item.trackingInfo = req.body.trackingInfo;
    }
  }
  
  await order.save();
  
  res.status(200).json({
    success: true,
    message: 'Order status updated successfully',
  });
};

/**
 * Get dashboard statistics
 * @route GET /api/partner/dashboard
 * @access Private (Partner only)
 */
exports.getDashboardStats = async (req, res) => {
  const partner = await Partner.findOne({ user: req.user.id });
  if (!partner) {
    throw new ApiError('Partner profile not found', 404);
  }
  
  // Get inventory stats
  const inventoryCount = await Inventory.countDocuments({ partner: partner._id });
  const activeInventory = await Inventory.countDocuments({ 
    partner: partner._id,
    isAvailable: true,
    quantity: { $gt: 0 }
  });
  
  // Get order stats
  const totalOrders = await Order.countDocuments({ 'items.partner': partner._id });
  const pendingOrders = await Order.countDocuments({ 
    'items.partner': partner._id,
    'items.status': { $in: ['pending', 'processing'] }
  });
  const completedOrders = await Order.countDocuments({ 
    'items.partner': partner._id,
    'items.status': 'delivered'
  });
  
  // Get revenue stats
  const orders = await Order.find({
    'items.partner': partner._id,
    'items.status': 'delivered'
  });
  
  let totalRevenue = 0;
  let totalCommission = 0;
  
  orders.forEach(order => {
    const partnerItems = order.items.filter(item => 
      item.partner && item.partner.toString() === partner._id.toString() && item.status === 'delivered'
    );
    
    partnerItems.forEach(item => {
      totalRevenue += item.price * item.quantity;
      totalCommission += item.commission || 0;
    });
  });
  
  // Get recent orders
  const recentOrders = await Order.find({ 'items.partner': partner._id })
    .sort('-createdAt')
    .limit(5)
    .populate('user', 'name')
    .populate('items.inventory', 'product');
  
  res.status(200).json({
    success: true,
    data: {
      wallet: partner.wallet,
      inventory: {
        total: inventoryCount,
        active: activeInventory
      },
      orders: {
        total: totalOrders,
        pending: pendingOrders,
        completed: completedOrders
      },
      revenue: {
        total: totalRevenue,
        commission: totalCommission,
        net: totalRevenue - totalCommission
      },
      recentOrders
    }
  });
};

// ==================== NEW METHODS FOR SELL/BUY PRODUCTS CRM ====================

const SellProduct = require('../models/sellProduct.model');
const BuyProduct = require('../models/buyProduct.model');
const SellOrder = require('../models/sellOrder.model');

/**
 * Get partner dashboard for sell/buy products
 * @route GET /api/partner/dashboard-sellbuy
 * @access Private (Partner only)
 */
exports.getDashboardSellBuy = async (req, res) => {
  const partner = await Partner.findOne({ user: req.user.id });
  if (!partner) {
    throw new ApiError('Partner profile not found', 404);
  }

  const partnerId = partner._id;

  // Get product counts
  const sellProductCount = await SellProduct.countDocuments({ partnerId });
  const buyProductCount = await BuyProduct.countDocuments({ partnerId });
  
  // Get order counts
  const totalOrders = await SellOrder.countDocuments({ partnerId });
  const pendingOrders = await SellOrder.countDocuments({ 
    partnerId, 
    status: { $in: ['draft', 'confirmed'] }
  });
  const completedOrders = await SellOrder.countDocuments({ 
    partnerId, 
    status: 'paid' 
  });

  // Calculate revenue
  const revenueData = await SellOrder.aggregate([
    { 
      $match: { 
        partnerId: partnerId, 
        status: 'paid' 
      } 
    },
    { 
      $group: { 
        _id: null, 
        total: { $sum: '$quoteAmount' } 
      } 
    }
  ]);

  const totalRevenue = revenueData.length > 0 ? revenueData[0].total : 0;

  // Get recent orders
  const recentOrders = await SellOrder.find({ partnerId })
    .sort({ createdAt: -1 })
    .limit(10)
    .populate('sessionId')
    .populate('userId', 'name email phone');

  res.status(200).json({
    success: true,
    data: {
      statistics: {
        sellProducts: sellProductCount,
        buyProducts: buyProductCount,
        totalOrders,
        pendingOrders,
        completedOrders,
        totalRevenue
      },
      recentOrders
    }
  });
};

/**
 * Get partner's sell products
 * @route GET /api/partner/sell-products
 * @access Private (Partner only)
 */
exports.getPartnerSellProducts = async (req, res) => {
  const partner = await Partner.findOne({ user: req.user.id });
  if (!partner) {
    throw new ApiError('Partner profile not found', 404);
  }

  const { status, search, page = 1, limit = 10 } = req.query;
  const partnerId = partner._id;

  const filter = { partnerId };

  if (status) {
    filter.status = status;
  }

  if (search) {
    filter.$or = [
      { name: { $regex: search, $options: 'i' } },
      { tags: { $regex: search, $options: 'i' } }
    ];
  }

  const skip = (page - 1) * limit;

  const products = await SellProduct.find(filter)
    .populate('categoryId', 'name image')
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(parseInt(limit));

  const total = await SellProduct.countDocuments(filter);

  res.status(200).json({
    success: true,
    data: products,
    pagination: {
      page: parseInt(page),
      limit: parseInt(limit),
      total,
      pages: Math.ceil(total / limit)
    }
  });
};

/**
 * Get partner's buy products
 * @route GET /api/partner/buy-products
 * @access Private (Partner only)
 */
exports.getPartnerBuyProducts = async (req, res) => {
  const partner = await Partner.findOne({ user: req.user.id });
  if (!partner) {
    throw new ApiError('Partner profile not found', 404);
  }

  const { isActive, search, page = 1, limit = 10 } = req.query;
  const partnerId = partner._id;

  const filter = { partnerId };

  if (isActive !== undefined) {
    filter.isActive = isActive === 'true';
  }

  if (search) {
    filter.$or = [
      { name: { $regex: search, $options: 'i' } },
      { brand: { $regex: search, $options: 'i' } }
    ];
  }

  const skip = (page - 1) * limit;

  const products = await BuyProduct.find(filter)
    .populate('categoryId', 'name image')
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(parseInt(limit));

  const total = await BuyProduct.countDocuments(filter);

  res.status(200).json({
    success: true,
    data: products,
    pagination: {
      page: parseInt(page),
      limit: parseInt(limit),
      total,
      pages: Math.ceil(total / limit)
    }
  });
};

/**
 * Get partner's sell orders
 * @route GET /api/partner/sell-orders
 * @access Private (Partner only)
 */
exports.getPartnerSellOrders = async (req, res) => {
  const partner = await Partner.findOne({ user: req.user.id });
  if (!partner) {
    throw new ApiError('Partner profile not found', 404);
  }

  const { status, page = 1, limit = 10 } = req.query;
  const partnerId = partner._id;

  const filter = { partnerId };

  if (status) {
    filter.status = status;
  }

  const skip = (page - 1) * limit;

  const orders = await SellOrder.find(filter)
    .populate('sessionId')
    .populate('userId', 'name email phone')
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(parseInt(limit));

  const total = await SellOrder.countDocuments(filter);

  res.status(200).json({
    success: true,
    data: orders,
    pagination: {
      page: parseInt(page),
      limit: parseInt(limit),
      total,
      pages: Math.ceil(total / limit)
    }
  });
};

/**
 * Get single sell order details
 * @route GET /api/partner/sell-orders/:id
 * @access Private (Partner only)
 */
exports.getPartnerSellOrderDetails = async (req, res) => {
  const partner = await Partner.findOne({ user: req.user.id });
  if (!partner) {
    throw new ApiError('Partner profile not found', 404);
  }

  const partnerId = partner._id;
  const orderId = req.params.id;

  const order = await SellOrder.findOne({ _id: orderId, partnerId })
    .populate('sessionId')
    .populate('userId', 'name email phone address');

  if (!order) {
    throw new ApiError('Order not found or access denied', 404);
  }

  res.status(200).json({
    success: true,
    data: order
  });
};

/**
 * Update sell order status
 * @route PUT /api/partner/sell-orders/:id/status
 * @access Private (Partner only)
 */
exports.updatePartnerSellOrderStatus = async (req, res) => {
  const partner = await Partner.findOne({ user: req.user.id });
  if (!partner) {
    throw new ApiError('Partner profile not found', 404);
  }

  const { status, notes } = req.body;
  const partnerId = partner._id;
  const orderId = req.params.id;

  const order = await SellOrder.findOne({ _id: orderId, partnerId });

  if (!order) {
    throw new ApiError('Order not found or access denied', 404);
  }

  order.status = status;
  if (notes) {
    order.notes = notes;
  }

  await order.save();

  res.status(200).json({
    success: true,
    message: 'Order status updated successfully',
    data: order
  });
};