const Partner = require("../models/partner.model");
const User = require("../models/user.model");
const Agent = require("../models/agent.model");
const Inventory = require("../models/inventory.model");
const { Order } = require("../models/order.model");
const Product = require("../models/product.model");
const ApiError = require("../utils/apiError");
const { sanitizeData } = require("../utils/security.utils");

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
    throw new ApiError("You already have a registered partner shop", 400);
  }

  // Sanitize inputs
  const sanitizedData = {
    shopName: sanitizeData(req.body.shopName),
    shopAddress: {
      street: sanitizeData(req.body.shopAddress.street),
      city: sanitizeData(req.body.shopAddress.city),
      state: sanitizeData(req.body.shopAddress.state),
      pincode: sanitizeData(req.body.shopAddress.pincode),
    },
    gstNumber: sanitizeData(req.body.gstNumber),
    shopPhone: sanitizeData(req.body.shopPhone),
    shopEmail: sanitizeData(req.body.shopEmail),
  };

  // Create partner shop
  const partner = await Partner.create({
    user: userId,
    ...sanitizedData,
    isVerified: false, // Requires admin verification
    verificationStatus: "pending",
    wallet: { balance: 0 },
  });

  // Update user role to include partner
  await User.findByIdAndUpdate(userId, { $addToSet: { role: "partner" } });

  res.status(201).json({
    success: true,
    data: partner,
    message: "Partner shop registered successfully. Verification pending.",
  });
};

/**
 * Get partner profile
 * @route GET /api/partner/profile
 * @access Private (Partner only)
 */
exports.getPartnerProfile = async (req, res) => {
  const userId = req.user.id;

  const partner = await Partner.findOne({ user: userId }).populate(
    "user",
    "name email phone"
  );

  if (!partner) {
    throw new ApiError("Partner profile not found", 404);
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
  if (req.body.shopName) updateData.shopName = sanitizeData(req.body.shopName);
  if (req.body.shopPhone)
    updateData.shopPhone = sanitizeData(req.body.shopPhone);
  if (req.body.shopEmail)
    updateData.shopEmail = sanitizeData(req.body.shopEmail);

  if (req.body.shopAddress) {
    updateData.shopAddress = {};
    if (req.body.shopAddress.street)
      updateData.shopAddress.street = sanitizeData(req.body.shopAddress.street);
    if (req.body.shopAddress.city)
      updateData.shopAddress.city = sanitizeData(req.body.shopAddress.city);
    if (req.body.shopAddress.state)
      updateData.shopAddress.state = sanitizeData(req.body.shopAddress.state);
    if (req.body.shopAddress.pincode)
      updateData.shopAddress.pincode = sanitizeData(
        req.body.shopAddress.pincode
      );
  }

  if (req.body.bankDetails) {
    updateData.bankDetails = {};
    if (req.body.bankDetails.accountName)
      updateData.bankDetails.accountName = sanitizeData(
        req.body.bankDetails.accountName
      );
    if (req.body.bankDetails.accountNumber)
      updateData.bankDetails.accountNumber = sanitizeData(
        req.body.bankDetails.accountNumber
      );
    if (req.body.bankDetails.ifscCode)
      updateData.bankDetails.ifscCode = sanitizeData(
        req.body.bankDetails.ifscCode
      );
    if (req.body.bankDetails.bankName)
      updateData.bankDetails.bankName = sanitizeData(
        req.body.bankDetails.bankName
      );
  }

  const partner = await Partner.findOneAndUpdate(
    { user: userId },
    { $set: updateData },
    { new: true, runValidators: true }
  );

  if (!partner) {
    throw new ApiError("Partner profile not found", 404);
  }

  res.status(200).json({
    success: true,
    data: partner,
    message: "Partner profile updated successfully",
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
  if (req.body.gstCertificate)
    updateData.gstCertificate = sanitizeData(req.body.gstCertificate);
  if (req.body.shopLicense)
    updateData.shopLicense = sanitizeData(req.body.shopLicense);
  if (req.body.ownerIdProof)
    updateData.ownerIdProof = sanitizeData(req.body.ownerIdProof);

  if (
    req.body.additionalDocuments &&
    Array.isArray(req.body.additionalDocuments)
  ) {
    updateData.additionalDocuments = req.body.additionalDocuments.map((doc) =>
      sanitizeData(doc)
    );
  }

  // Update verification status if documents are being uploaded
  if (Object.keys(updateData).length > 0) {
    updateData.verificationStatus = "submitted";
  }

  const partner = await Partner.findOneAndUpdate(
    { user: userId },
    { $set: updateData },
    { new: true }
  );

  if (!partner) {
    throw new ApiError("Partner profile not found", 404);
  }

  res.status(200).json({
    success: true,
    data: partner,
    message: "Documents uploaded successfully",
  });
};

/**
 * Get products catalog for inventory selection (Buy Products)
 * @route GET /api/partner/products
 * @access Private (Partner only)
 */
exports.getProductsCatalog = async (req, res) => {
  const {
    category,
    brand,
    name,
    page = 1,
    limit = 50, // Higher default limit for partners
    search,
    sortBy = "createdAt",
    sortOrder = "desc",
  } = req.query;

  // Validate pagination parameters
  const pageNum = Math.max(1, parseInt(page));
  const limitNum = Math.min(100, Math.max(1, parseInt(limit))); // Max 100 items per page for partners

  // Build filter object for BuyProduct collection
  const filter = { isActive: true }; // Only show active products

  if (category && category !== "all") {
    filter["categoryId.name"] = { $regex: category, $options: "i" };
  }

  if (brand && brand !== "all") {
    filter.brand = { $regex: brand, $options: "i" };
  }

  if (name && name !== "all") {
    const decodedName = decodeURIComponent(name);
    filter.name = { $regex: decodedName.trim(), $options: "i" };
  }

  // Search filter
  if (search && search.trim()) {
    const searchRegex = { $regex: search.trim(), $options: "i" };
    filter.$or = [
      { brand: searchRegex },
      { name: searchRegex },
      { "categoryId.name": searchRegex },
    ];
  }

  try {
    // Build sort object
    const sortObj = {};
    sortObj[sortBy] = sortOrder === "desc" ? -1 : 1;

    // Get BuyProducts with category population
    const BuyProduct = require("../models/buyProduct.model");
    const products = await BuyProduct.find(filter)
      .populate("categoryId", "name")
      .sort(sortObj)
      .limit(limitNum)
      .skip((pageNum - 1) * limitNum)
      .lean();

    // Get total count for pagination
    const total = await BuyProduct.countDocuments(filter);

    // Transform products to match expected structure
    const transformedProducts = products.map((product) => ({
      _id: product._id,
      name: product.name,
      brand: product.brand,
      category: product.categoryId?.name || "Uncategorized",
      model: product.name, // Use name as model for compatibility
      images: product.images || {},
      pricing: product.pricing || {},
      basePrice: product.pricing?.mrp || product.pricing?.discountedPrice || 0,
      minPrice:
        product.conditionOptions?.length > 0
          ? Math.min(...product.conditionOptions.map((c) => c.price))
          : null,
      maxPrice:
        product.conditionOptions?.length > 0
          ? Math.max(...product.conditionOptions.map((c) => c.price))
          : null,
      isActive: product.isActive,
      createdAt: product.createdAt,
      updatedAt: product.updatedAt,
      // Include additional fields for better display
      variants: product.variants || [],
      conditionOptions: product.conditionOptions || [],
      // Include original buy product fields
      originalProduct: product,
    }));

    // Calculate pagination info
    const totalPages = Math.ceil(total / limitNum);
    const hasNextPage = pageNum < totalPages;
    const hasPrevPage = pageNum > 1;

    res.status(200).json({
      success: true,
      count: transformedProducts.length,
      total,
      page: pageNum,
      pages: totalPages,
      hasNextPage,
      hasPrevPage,
      data: transformedProducts,
    });
  } catch (error) {
    console.error("Error fetching buy products catalog:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch products catalog",
      error: error.message,
    });
  }
};

/**
 * Add inventory item
 * @route POST /api/partner/inventory
 * @access Private (Partner only)
 */
exports.addInventory = async (req, res) => {
  const partnerId = await Partner.findOne({ user: req.user.id });
  if (!partnerId) {
    throw new ApiError("Partner profile not found", 404);
  }

  // Check if partner is verified
  if (!partnerId.isVerified) {
    throw new ApiError("Your partner account is not verified yet", 403);
  }

  // Check if product exists
  const product = await Product.findById(req.body.productId);
  if (!product) {
    throw new ApiError("Product not found", 404);
  }

  // Check if inventory already exists for this product
  const existingInventory = await Inventory.findOne({
    partner: partnerId._id,
    product: req.body.productId,
    condition: req.body.condition,
  });

  if (existingInventory) {
    throw new ApiError(
      "You already have this product in your inventory with the same condition",
      400
    );
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
    images: req.body.images || [],
  });

  res.status(201).json({
    success: true,
    data: inventory,
    message: "Inventory item added successfully",
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
    throw new ApiError("Partner profile not found", 404);
  }

  const {
    page = 1,
    limit = 10,
    sort = "-createdAt",
    condition,
    isAvailable,
  } = req.query;

  const queryObj = { partner: partner._id };
  if (condition) queryObj.condition = condition;
  if (isAvailable !== undefined) queryObj.isAvailable = isAvailable === "true";

  const pageNum = parseInt(page, 10);
  const limitNum = parseInt(limit, 10);
  const skip = (pageNum - 1) * limitNum;

  // Get total count for pagination
  const total = await Inventory.countDocuments(queryObj);

  // Get inventory items
  const inventory = await Inventory.find(queryObj)
    .populate("product", "name brand category images")
    .sort(sort)
    .skip(skip)
    .limit(limitNum);

  res.status(200).json({
    success: true,
    data: {
      docs: inventory,
      totalDocs: total,
      limit: limitNum,
      page: pageNum,
      totalPages: Math.ceil(total / limitNum),
      hasNextPage: pageNum < Math.ceil(total / limitNum),
      hasPrevPage: pageNum > 1,
    },
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
    throw new ApiError("Partner profile not found", 404);
  }

  // Find inventory and check ownership
  const inventory = await Inventory.findOne({
    _id: req.params.id,
    partner: partner._id,
  });

  if (!inventory) {
    throw new ApiError("Inventory item not found or not owned by you", 404);
  }

  // Update fields
  const updateData = {};
  if (req.body.price !== undefined) updateData.price = req.body.price;
  if (req.body.originalPrice !== undefined)
    updateData.originalPrice = req.body.originalPrice;
  if (req.body.quantity !== undefined) updateData.quantity = req.body.quantity;
  if (req.body.isAvailable !== undefined)
    updateData.isAvailable = req.body.isAvailable;
  if (req.body.warranty !== undefined) updateData.warranty = req.body.warranty;
  if (req.body.additionalSpecs)
    updateData.additionalSpecs = req.body.additionalSpecs;
  if (req.body.images) updateData.images = req.body.images;

  const updatedInventory = await Inventory.findByIdAndUpdate(
    req.params.id,
    { $set: updateData },
    { new: true, runValidators: true }
  ).populate("product", "name brand category images");

  res.status(200).json({
    success: true,
    data: updatedInventory,
    message: "Inventory item updated successfully",
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
    throw new ApiError("Partner profile not found", 404);
  }

  // Find inventory and check ownership
  const inventory = await Inventory.findOne({
    _id: req.params.id,
    partner: partner._id,
  });

  if (!inventory) {
    throw new ApiError("Inventory item not found or not owned by you", 404);
  }

  // Check if there are any active orders for this inventory
  const activeOrders = await Order.countDocuments({
    "items.inventory": req.params.id,
    status: { $nin: ["delivered", "cancelled"] },
  });

  if (activeOrders > 0) {
    throw new ApiError("Cannot delete inventory with active orders", 400);
  }

  await Inventory.findByIdAndDelete(req.params.id);

  res.status(200).json({
    success: true,
    message: "Inventory item deleted successfully",
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
    throw new ApiError("Partner profile not found", 404);
  }

  const { page = 1, limit = 10, sort = "-createdAt", status } = req.query;

  const queryObj = { partner: partner._id };
  if (status) queryObj.status = status;

  const pageNum = parseInt(page, 10);
  const limitNum = parseInt(limit, 10);
  const skip = (pageNum - 1) * limitNum;

  // Get orders with regular MongoDB queries
  const orders = await Order.find(queryObj)
    .populate("user", "name email phone")
    .populate(
      "items.product",
      "name brand categoryId images pricing variants conditionOptions isActive"
    )
    .populate({
      path: "items.inventory",
      populate: { path: "product", select: "name brand categoryId images" },
    })
    .sort(sort)
    .skip(skip)
    .limit(limitNum);

  // Get total count for pagination
  const totalOrders = await Order.countDocuments(queryObj);

  // Convert orders to plain objects for response
  const filteredOrders = orders.map((order) => order.toObject());

  res.status(200).json({
    success: true,
    data: {
      docs: filteredOrders,
      totalDocs: totalOrders,
      limit: limitNum,
      page: pageNum,
      totalPages: Math.ceil(totalOrders / limitNum),
      hasNextPage: pageNum < Math.ceil(totalOrders / limitNum),
      hasPrevPage: pageNum > 1,
    },
  });
};

/**
 * Respond to order assignment (accept/reject)
 * @route PUT /api/partner/orders/:id/respond
 * @access Private (Partner only)
 */
exports.respondToOrderAssignment = async (req, res) => {
  const partner = await Partner.findOne({ user: req.user.id });
  if (!partner) {
    throw new ApiError("Partner profile not found", 404);
  }

  const { response, reason } = req.body; // response: 'accepted' or 'rejected'

  const order = await Order.findById(req.params.id).populate(
    "items.product",
    "name brand categoryId images pricing variants conditionOptions"
  );
  if (!order) {
    throw new ApiError("Order not found", 404);
  }

  // Check if order is assigned to this partner
  if (!order.partner || order.partner.toString() !== partner._id.toString()) {
    throw new ApiError("Order is not assigned to your shop", 403);
  }

  // Check if response is still pending
  if (order.partnerAssignment.response.status !== "pending") {
    throw new ApiError("Order assignment has already been responded to", 400);
  }

  // If accepting, validate inventory availability
  if (response === "accepted") {
    const missingItems = [];

    // Check each product in the order
    for (const item of order.items) {
      const inventory = await Inventory.findOne({
        partner: partner._id,
        product: item.product._id,
        isAvailable: true,
        quantity: { $gte: item.quantity },
      });

      if (!inventory) {
        missingItems.push({
          productId: item.product._id,
          productName:
            item.product.name ||
            item.product.model ||
            `${item.product.brand} Product`,
          requiredQuantity: item.quantity,
          hasInventory: false,
        });
      } else if (inventory.quantity < item.quantity) {
        missingItems.push({
          productId: item.product._id,
          productName:
            item.product.name ||
            item.product.model ||
            `${item.product.brand} Product`,
          requiredQuantity: item.quantity,
          availableQuantity: inventory.quantity,
          hasInventory: true,
          insufficient: true,
        });
      }
    }

    // If there are missing items, reject the acceptance
    if (missingItems.length > 0) {
      const missingProductNames = missingItems
        .map((item) =>
          item.insufficient
            ? `${item.productName} (need ${item.requiredQuantity}, have ${item.availableQuantity})`
            : `${item.productName} (not in inventory)`
        )
        .join(", ");

      throw new ApiError(
        `Cannot accept order. Missing or insufficient inventory for: ${missingProductNames}. Please add these products to your inventory with proper pricing first.`,
        400
      );
    }
  }

  // Update partner response
  order.partnerAssignment.response = {
    status: response,
    respondedAt: new Date(),
    reason: reason || "",
  };

  // Update order status based on response
  if (response === "accepted") {
    order.status = "confirmed";
    order.statusHistory.push({
      status: "confirmed",
      timestamp: new Date(),
      note: `Order accepted by partner: ${reason || "No reason provided"}`,
    });
  } else if (response === "rejected") {
    order.status = "pending"; // Back to pending for reassignment
    order.statusHistory.push({
      status: "partner_rejected",
      timestamp: new Date(),
      note: `Order rejected by partner: ${reason || "No reason provided"}`,
    });
  }

  await order.save();

  res.status(200).json({
    success: true,
    message: `Order ${response} successfully`,
    data: order,
  });
};

/**
 * Check missing inventory for assigned order
 * @route GET /api/partner/orders/:id/missing-inventory
 * @access Private (Partner only)
 */
exports.checkMissingInventory = async (req, res) => {
  const partner = await Partner.findOne({ user: req.user.id });
  if (!partner) {
    throw new ApiError("Partner profile not found", 404);
  }

  const order = await Order.findById(req.params.id).populate(
    "items.product",
    "name brand categoryId images pricing variants conditionOptions"
  );
  if (!order) {
    throw new ApiError("Order not found", 404);
  }

  // Check if order is assigned to this partner
  if (!order.partner || order.partner.toString() !== partner._id.toString()) {
    throw new ApiError("Order is not assigned to your shop", 403);
  }

  const missingItems = [];
  const availableItems = [];

  // Check each product in the order
  for (const item of order.items) {
    const inventory = await Inventory.findOne({
      partner: partner._id,
      product: item.product._id,
      isAvailable: true,
      quantity: { $gte: item.quantity },
    }).populate("product", "name brand categoryId images");

    const itemStatus = {
      productId: item.product._id,
      productName: item.product.name || item.product.model,
      productBrand: item.product.brand,
      productCategory: item.product.category,
      productImages: item.product.images,
      requiredQuantity: item.quantity,
      hasInventory: !!inventory,
      availableQuantity: inventory ? inventory.quantity : 0,
      partnerPrice: inventory ? inventory.price : null,
      condition: inventory ? inventory.condition : null,
      canFulfill: inventory && inventory.quantity >= item.quantity,
    };

    if (itemStatus.canFulfill) {
      availableItems.push(itemStatus);
    } else {
      missingItems.push(itemStatus);
    }
  }

  res.status(200).json({
    success: true,
    data: {
      orderId: order._id,
      canFulfillCompletely: missingItems.length === 0,
      missingItems,
      availableItems,
      totalMissingProducts: missingItems.length,
      message:
        missingItems.length > 0
          ? "You need to add missing products to your inventory before accepting this order"
          : "You have all required products in inventory",
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
    throw new ApiError("Partner profile not found", 404);
  }

  const order = await Order.findById(req.params.id);
  if (!order) {
    throw new ApiError("Order not found", 404);
  }

  // Check if order is assigned to this partner
  if (!order.partner || order.partner.toString() !== partner._id.toString()) {
    throw new ApiError("Order is not assigned to your shop", 403);
  }

  // Check if order has been accepted by partner
  if (
    order.partnerAssignment &&
    order.partnerAssignment.response.status !== "accepted"
  ) {
    throw new ApiError(
      "You must accept the order assignment before updating status",
      403
    );
  }

  // Update order status
  const oldStatus = order.status;
  order.status = req.body.status;

  // Add to status history
  order.statusHistory.push({
    status: req.body.status,
    timestamp: new Date(),
    note:
      req.body.notes ||
      `Status updated from ${oldStatus} to ${req.body.status}`,
  });

  if (req.body.trackingInfo) {
    order.trackingInfo = req.body.trackingInfo;
  }

  await order.save();

  res.status(200).json({
    success: true,
    message: "Order status updated successfully",
  });
};

/**
 * Get dashboard statistics
 * @route GET /api/partner/dashboard
 * @access Private (Partner only)
 */
exports.getDashboardStats = async (req, res) => {
  try {
    console.log("Dashboard request from user:", req.user.id);

    const partner = await Partner.findOne({ user: req.user.id });
    console.log("Found partner:", partner ? partner._id : "No partner found");

    if (!partner) {
      return res.status(404).json({
        success: false,
        message: "Partner profile not found",
      });
    }

    // Get inventory stats
    const inventoryCount = await Inventory.countDocuments({
      partner: partner._id,
    });
    const activeInventory = await Inventory.countDocuments({
      partner: partner._id,
      isAvailable: true,
      quantity: { $gt: 0 },
    });

    // Get order stats
    const totalOrders = await Order.countDocuments({
      partner: partner._id,
    });
    const pendingOrders = await Order.countDocuments({
      partner: partner._id,
      status: { $in: ["pending", "processing"] },
    });
    const completedOrders = await Order.countDocuments({
      partner: partner._id,
      status: "delivered",
    });

    // Get revenue stats
    const orders = await Order.find({
      partner: partner._id,
      status: "delivered",
    });

    let totalRevenue = 0;
    let totalCommission = 0;

    orders.forEach((order) => {
      const partnerItems = order.items.filter(
        (item) =>
          item.partner &&
          item.partner.toString() === partner._id.toString() &&
          item.status === "delivered"
      );

      partnerItems.forEach((item) => {
        totalRevenue += item.price * item.quantity;
        totalCommission += item.commission || 0;
      });
    });

    // Get recent orders
    const recentOrders = await Order.find({ partner: partner._id })
      .sort("-createdAt")
      .limit(5)
      .populate("user", "name")
      .populate("items.product", "model brand category images price")
      .populate("items.inventory", "product");

    console.log("Dashboard stats calculated successfully");

    res.status(200).json({
      success: true,
      data: {
        wallet: partner.wallet,
        inventory: {
          total: inventoryCount,
          active: activeInventory,
        },
        orders: {
          total: totalOrders,
          pending: pendingOrders,
          completed: completedOrders,
        },
        revenue: {
          total: totalRevenue,
          commission: totalCommission,
          net: totalRevenue - totalCommission,
        },
        recentOrders,
      },
    });
  } catch (error) {
    console.error("Error in getDashboardStats:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch dashboard statistics",
      error: error.message,
    });
  }
};

// ==================== NEW METHODS FOR SELL/BUY PRODUCTS CRM ====================

const SellProduct = require("../models/sellProduct.model");
const BuyProduct = require("../models/buyProduct.model");
const SellOrder = require("../models/sellOrder.model");

/**
 * Get partner dashboard for sell/buy products
 * @route GET /api/partner/dashboard-sellbuy
 * @access Private (Partner only)
 */
exports.getDashboardSellBuy = async (req, res) => {
  const partner = await Partner.findOne({ user: req.user.id });
  if (!partner) {
    throw new ApiError("Partner profile not found", 404);
  }

  const partnerId = partner._id;

  // Get product counts
  const sellProductCount = await SellProduct.countDocuments({ partnerId });
  const buyProductCount = await BuyProduct.countDocuments({ partnerId });

  // Get order counts
  const totalOrders = await SellOrder.countDocuments({ partnerId });
  const pendingOrders = await SellOrder.countDocuments({
    partnerId,
    status: { $in: ["draft", "confirmed"] },
  });
  const completedOrders = await SellOrder.countDocuments({
    partnerId,
    status: "paid",
  });

  // Calculate revenue
  const revenueData = await SellOrder.aggregate([
    {
      $match: {
        partnerId: partnerId,
        status: "paid",
      },
    },
    {
      $group: {
        _id: null,
        total: { $sum: "$quoteAmount" },
      },
    },
  ]);

  const totalRevenue = revenueData.length > 0 ? revenueData[0].total : 0;

  // Get recent orders
  const recentOrders = await SellOrder.find({ partnerId })
    .sort({ createdAt: -1 })
    .limit(10)
    .populate("sessionId")
    .populate("userId", "name email phone");

  res.status(200).json({
    success: true,
    data: {
      statistics: {
        sellProducts: sellProductCount,
        buyProducts: buyProductCount,
        totalOrders,
        pendingOrders,
        completedOrders,
        totalRevenue,
      },
      recentOrders,
    },
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
    throw new ApiError("Partner profile not found", 404);
  }

  const { status, search, page = 1, limit = 10 } = req.query;
  const partnerId = partner._id;

  const filter = { partnerId };

  if (status) {
    filter.status = status;
  }

  if (search) {
    filter.$or = [
      { name: { $regex: search, $options: "i" } },
      { tags: { $regex: search, $options: "i" } },
    ];
  }

  const skip = (page - 1) * limit;

  const products = await SellProduct.find(filter)
    .populate("categoryId", "name image")
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
      pages: Math.ceil(total / limit),
    },
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
    throw new ApiError("Partner profile not found", 404);
  }

  const { isActive, search, page = 1, limit = 10 } = req.query;
  const partnerId = partner._id;

  const filter = { partnerId };

  if (isActive !== undefined) {
    filter.isActive = isActive === "true";
  }

  if (search) {
    filter.$or = [
      { name: { $regex: search, $options: "i" } },
      { brand: { $regex: search, $options: "i" } },
    ];
  }

  const skip = (page - 1) * limit;

  const products = await BuyProduct.find(filter)
    .populate("categoryId", "name image")
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
      pages: Math.ceil(total / limit),
    },
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
    throw new ApiError("Partner profile not found", 404);
  }

  const { status, page = 1, limit = 10 } = req.query;
  const partnerId = partner._id;

  const filter = { partnerId };

  if (status) {
    filter.status = status;
  }

  const skip = (page - 1) * limit;

  const orders = await SellOrder.find(filter)
    .populate("sessionId")
    .populate("userId", "name email phone")
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
      pages: Math.ceil(total / limit),
    },
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
    throw new ApiError("Partner profile not found", 404);
  }

  const partnerId = partner._id;
  const orderId = req.params.id;

  const order = await SellOrder.findOne({ _id: orderId, partnerId })
    .populate("sessionId")
    .populate("userId", "name email phone address");

  if (!order) {
    throw new ApiError("Order not found or access denied", 404);
  }

  res.status(200).json({
    success: true,
    data: order,
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
    throw new ApiError("Partner profile not found", 404);
  }

  const { status, notes } = req.body;
  const partnerId = partner._id;
  const orderId = req.params.id;

  const order = await SellOrder.findOne({ _id: orderId, partnerId });

  if (!order) {
    throw new ApiError("Order not found or access denied", 404);
  }

  order.status = status;
  if (notes) {
    order.notes = notes;
  }

  await order.save();

  res.status(200).json({
    success: true,
    message: "Order status updated successfully",
    data: order,
  });
};

/**
 * Get partner's agents
 * @route GET /api/partner/agents
 * @access Private (Partner only)
 */
exports.getPartnerAgents = async (req, res) => {
  const partner = await Partner.findOne({ user: req.user.id });
  if (!partner) {
    throw new ApiError("Partner profile not found", 404);
  }

  const { page = 1, limit = 10, status } = req.query;

  const query = { assignedPartner: partner._id };
  if (status) {
    query.isActive = status === "active";
  }

  const agents = await Agent.find(query)
    .populate("user", "name email phone isVerified")
    .sort({ createdAt: -1 })
    .limit(limit * 1)
    .skip((page - 1) * limit);

  const total = await Agent.countDocuments(query);

  res.status(200).json({
    success: true,
    data: agents,
    pagination: {
      page: parseInt(page),
      limit: parseInt(limit),
      total,
      pages: Math.ceil(total / limit),
    },
  });
};

/**
 * Create new agent
 * @route POST /api/partner/agents
 * @access Private (Partner only)
 */
exports.createAgent = async (req, res) => {
  const partner = await Partner.findOne({ user: req.user.id });
  if (!partner) {
    throw new ApiError("Partner profile not found", 404);
  }

  const {
    name,
    email,
    phone,
    password,
    coverageAreas,
    aadharCard,
    panCard,
    drivingLicense,
    bankDetails,
    emergencyContact,
  } = req.body;

  // Check if user with email already exists
  const existingUser = await User.findOne({ email });
  if (existingUser) {
    throw new ApiError("User with this email already exists", 400);
  }

  // Create user account for agent
  const user = await User.create({
    name: sanitizeData(name),
    email: sanitizeData(email),
    phone: sanitizeData(phone),
    role: "agent", // Agents have agent role
    password: password, // Use password provided by partner
    isVerified: false, // Will be verified by admin
  });

  // Generate agent code
  const agentCode = await Agent.generateAgentCode();

  // Generate employee ID automatically
  const generateEmployeeId = () => {
    const date = new Date();
    const year = date.getFullYear().toString().slice(-2);
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const random = Math.floor(Math.random() * 9999)
      .toString()
      .padStart(4, "0");
    return `EMP${year}${month}${random}`;
  };

  const employeeId = generateEmployeeId();

  // Create agent profile
  const agent = await Agent.create({
    user: user._id,
    agentCode,
    employeeId,
    assignedPartner: partner._id,
    coverageAreas: coverageAreas.map((area) => sanitizeData(area)),
    documents: {
      aadharCard: aadharCard ? sanitizeData(aadharCard) : undefined,
      panCard: panCard ? sanitizeData(panCard) : undefined,
      drivingLicense: drivingLicense ? sanitizeData(drivingLicense) : undefined,
    },
    bankDetails: bankDetails || {},
    emergencyContact: emergencyContact || {},
    isActive: false, // Will be activated by admin after approval
  });

  // Populate user data for response
  await agent.populate("user", "name email phone isVerified");

  res.status(201).json({
    success: true,
    message: "Agent created successfully. Awaiting admin approval.",
    data: agent,
  });
};

/**
 * Update agent
 * @route PUT /api/partner/agents/:agentId
 * @access Private (Partner only)
 */
exports.updateAgent = async (req, res) => {
  const partner = await Partner.findOne({ user: req.user.id });
  if (!partner) {
    throw new ApiError("Partner profile not found", 404);
  }

  const agentId = req.params.agentId;
  const updateData = req.body;

  // Find agent and verify it belongs to this partner
  const agent = await Agent.findOne({
    _id: agentId,
    assignedPartner: partner._id,
  }).populate("user");

  if (!agent) {
    throw new ApiError("Agent not found or access denied", 404);
  }

  // Update user data if provided
  if (updateData.name || updateData.phone) {
    const userUpdateData = {};
    if (updateData.name) userUpdateData.name = sanitizeData(updateData.name);
    if (updateData.phone) userUpdateData.phone = sanitizeData(updateData.phone);

    await User.findByIdAndUpdate(agent.user._id, userUpdateData);
  }

  // Update agent data (employeeId is auto-generated and cannot be updated)
  const agentUpdateData = {};
  if (updateData.coverageAreas) {
    agentUpdateData.coverageAreas = updateData.coverageAreas.map((area) =>
      sanitizeData(area)
    );
  }
  if (updateData.documents) agentUpdateData.documents = updateData.documents;
  if (updateData.bankDetails)
    agentUpdateData.bankDetails = updateData.bankDetails;
  if (updateData.emergencyContact)
    agentUpdateData.emergencyContact = updateData.emergencyContact;

  const updatedAgent = await Agent.findByIdAndUpdate(agentId, agentUpdateData, {
    new: true,
  }).populate("user", "name email phone isVerified");

  res.status(200).json({
    success: true,
    message: "Agent updated successfully",
    data: updatedAgent,
  });
};

/**
 * Delete agent
 * @route DELETE /api/partner/agents/:agentId
 * @access Private (Partner only)
 */
exports.deleteAgent = async (req, res) => {
  const partner = await Partner.findOne({ user: req.user.id });
  if (!partner) {
    throw new ApiError("Partner profile not found", 404);
  }

  const agentId = req.params.agentId;

  // Find agent and verify it belongs to this partner
  const agent = await Agent.findOne({
    _id: agentId,
    assignedPartner: partner._id,
  });

  if (!agent) {
    throw new ApiError("Agent not found or access denied", 404);
  }

  // Soft delete - deactivate instead of removing
  agent.isActive = false;
  await agent.save();

  // Also deactivate the user account
  await User.findByIdAndUpdate(agent.user, { isActive: false });

  res.status(200).json({
    success: true,
    message: "Agent deactivated successfully",
  });
};
