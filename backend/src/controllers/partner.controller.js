import Agent from '../models/agent.model';
import BuyProduct from '../models/buyProduct.model';
import Inventory from '../models/inventory.model';
import { Order } from '../models/order.model';
import Partner from '../models/partner.model';
import Product from '../models/product.model';
import User from '../models/user.model';
import ApiError from '../utils/apiError';
import { sanitizeData } from '../utils/security.utils';

export async function registerPartnerShop(req, res) {
  const userId = req.user.id;

  const existingPartner = await Partner.findOne({ user: userId });
  if (existingPartner) {
    throw new ApiError('You already have a registered partner shop', 400);
  }

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

  const partner = await Partner.create({
    user: userId,
    ...sanitizedData,
    isVerified: false,
    verificationStatus: 'pending',
    wallet: { balance: 0 },
  });

  await User.findByIdAndUpdate(userId, { $addToSet: { role: 'partner' } });

  res.status(201).json({
    success: true,
    data: partner,
    message: 'Partner shop registered successfully. Verification pending.',
  });
}

export async function getPartnerProfile(req, res) {
  const userId = req.user.id;

  const partner = await Partner.findOne({ user: userId }).populate(
    'user',
    'name email phone'
  );

  if (!partner) {
    throw new ApiError('Partner profile not found', 404);
  }

  res.status(200).json({
    success: true,
    data: partner,
  });
}

export async function updatePartnerProfile(req, res) {
  const userId = req.user.id;

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
    throw new ApiError('Partner profile not found', 404);
  }

  res.status(200).json({
    success: true,
    data: partner,
    message: 'Partner profile updated successfully',
  });
}

export async function uploadDocuments(req, res) {
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
}

export async function getProductsCatalog(req, res) {
  const {
    category,
    brand,
    name,
    page = 1,
    limit = 50,
    search,
    sortBy = 'createdAt',
    sortOrder = 'desc',
  } = req.query;

  const pageNum = Math.max(1, parseInt(page));
  const limitNum = Math.min(100, Math.max(1, parseInt(limit)));

  const filter = { isActive: true };

  if (category && category !== 'all') {
    filter['categoryId.name'] = { $regex: category, $options: 'i' };
  }

  if (brand && brand !== 'all') {
    filter.brand = { $regex: brand, $options: 'i' };
  }

  if (name && name !== 'all') {
    const decodedName = decodeURIComponent(name);
    filter.name = { $regex: decodedName.trim(), $options: 'i' };
  }

  if (search && search.trim()) {
    const searchRegex = { $regex: search.trim(), $options: 'i' };
    filter.$or = [
      { brand: searchRegex },
      { name: searchRegex },
      { 'categoryId.name': searchRegex },
    ];
  }

  try {
    const sortObj = {};
    sortObj[sortBy] = sortOrder === 'desc' ? -1 : 1;

    const products = await BuyProduct.find(filter)
      .populate('categoryId', 'name')
      .sort(sortObj)
      .limit(limitNum)
      .skip((pageNum - 1) * limitNum)
      .lean();

    const total = await BuyProduct.countDocuments(filter);

    const transformedProducts = products.map((product) => ({
      _id: product._id,
      name: product.name,
      brand: product.brand,
      category: product.categoryId?.name || 'Uncategorized',
      model: product.name,
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

      variants: product.variants || [],
      conditionOptions: product.conditionOptions || [],

      originalProduct: product,
    }));

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
    console.error('Error fetching buy products catalog:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch products catalog',
      error: error.message,
    });
  }
}

export async function addInventory(req, res) {
  const partnerId = await Partner.findOne({ user: req.user.id });
  if (!partnerId) {
    throw new ApiError('Partner profile not found', 404);
  }

  if (!partnerId.isVerified) {
    throw new ApiError('Your partner account is not verified yet', 403);
  }

  let product = await Product.findById(req.body.productId);
  let productModel = 'Product';

  if (!product) {
    product = await BuyProduct.findById(req.body.productId);
    productModel = 'BuyProduct';
  }

  if (!product) {
    throw new ApiError('Product not found', 404);
  }

  const existingInventory = await Inventory.findOne({
    partner: partnerId._id,
    product: req.body.productId,
    condition: req.body.condition,
  });

  if (existingInventory) {
    throw new ApiError(
      'You already have this product in your inventory with the same condition',
      400
    );
  }

  const inventory = await Inventory.create({
    partner: partnerId._id,
    productModel: productModel,
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
    message: 'Inventory item added successfully',
  });
}

export async function getInventory(req, res) {
  const partner = await Partner.findOne({ user: req.user.id });
  if (!partner) {
    throw new ApiError('Partner profile not found', 404);
  }

  const {
    page = 1,
    limit = 10,
    sort = '-createdAt',
    condition,
    isAvailable,
  } = req.query;

  const queryObj = { partner: partner._id };
  if (condition) queryObj.condition = condition;
  if (isAvailable !== undefined) queryObj.isAvailable = isAvailable === 'true';

  const pageNum = parseInt(page, 10);
  const limitNum = parseInt(limit, 10);
  const skip = (pageNum - 1) * limitNum;

  const total = await Inventory.countDocuments(queryObj);

  const inventory = await Inventory.find(queryObj)
    .populate({
      path: 'product',
      select: 'name brand model series category images',
    })
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
}

export async function updateInventory(req, res) {
  const partner = await Partner.findOne({ user: req.user.id });
  if (!partner) {
    throw new ApiError('Partner profile not found', 404);
  }

  const inventory = await Inventory.findOne({
    _id: req.params.id,
    partner: partner._id,
  });

  if (!inventory) {
    throw new ApiError('Inventory item not found or not owned by you', 404);
  }

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
  ).populate('product', 'name brand category images');

  res.status(200).json({
    success: true,
    data: updatedInventory,
    message: 'Inventory item updated successfully',
  });
}

export async function deleteInventory(req, res) {
  const partner = await Partner.findOne({ user: req.user.id });
  if (!partner) {
    throw new ApiError('Partner profile not found', 404);
  }

  const inventory = await Inventory.findOne({
    _id: req.params.id,
    partner: partner._id,
  });

  if (!inventory) {
    throw new ApiError('Inventory item not found or not owned by you', 404);
  }

  const activeOrders = await Order.countDocuments({
    'items.inventory': req.params.id,
    status: { $nin: ['delivered', 'cancelled'] },
  });

  if (activeOrders > 0) {
    throw new ApiError('Cannot delete inventory with active orders', 400);
  }

  await Inventory.findByIdAndDelete(req.params.id);

  res.status(200).json({
    success: true,
    message: 'Inventory item deleted successfully',
  });
}

export async function getOrders(req, res) {
  const partner = await Partner.findOne({ user: req.user.id });
  if (!partner) {
    throw new ApiError('Partner profile not found', 404);
  }

  const {
    page = 1,
    limit = 10,
    sort = '-createdAt',
    status,
    orderType,
    search,
    startDate,
    endDate,
  } = req.query;

  const pageNum = parseInt(page, 10);
  const limitNum = parseInt(limit, 10);
  const skip = (pageNum - 1) * limitNum;

  const sortField = sort.startsWith('-') ? sort.substring(1) : sort;
  const sortOrder = sort.startsWith('-') ? -1 : 1;
  const sortObj = { [sortField]: sortOrder };

  let allOrders = [];
  let totalCount = 0;

  const dateFilter = {};
  if (startDate || endDate) {
    if (startDate) dateFilter.$gte = new Date(startDate);
    if (endDate) dateFilter.$lte = new Date(endDate);
  }

  if (!orderType || orderType === 'buy') {
    const buyQueryObj = { partner: partner._id };

    if (status) buyQueryObj.status = status;
    if (Object.keys(dateFilter).length > 0) buyQueryObj.createdAt = dateFilter;

    if (search) {
      const searchConditions = [];

      if (search.match(/^[0-9a-fA-F]{24}$/)) {
        searchConditions.push({ _id: search });
      }

      const User = require('../models/user.model');
      const matchingUsers = await User.find({
        $or: [
          { name: { $regex: search, $options: 'i' } },
          { email: { $regex: search, $options: 'i' } },
          { phone: { $regex: search, $options: 'i' } },
        ],
      }).select('_id');

      if (matchingUsers.length > 0) {
        searchConditions.push({
          user: { $in: matchingUsers.map((u) => u._id) },
        });
      }

      if (searchConditions.length > 0) {
        buyQueryObj.$or = searchConditions;
      } else {
        buyQueryObj._id = null;
      }
    }

    const buyOrdersCount = await Order.countDocuments(buyQueryObj);
    totalCount += buyOrdersCount;

    if (orderType === 'buy' || !orderType) {
      const buyOrders = await Order.find(buyQueryObj)
        .populate('user', 'name email phone')
        .populate(
          'items.product',
          'name brand categoryId images pricing variants conditionOptions isActive'
        )
        .populate({
          path: 'items.inventory',
          populate: { path: 'product', select: 'name brand categoryId images' },
        })
        .sort(sortObj)
        .lean();

      const buyOrdersWithType = buyOrders.map((order) => ({
        ...order,
        orderType: 'buy',

        shippingAddress:
          order.shippingDetails?.address || order.shippingAddress,
        paymentMethod: order.paymentDetails?.method || order.paymentMethod,
      }));

      allOrders = [...allOrders, ...buyOrdersWithType];
    }
  }

  if (!orderType || orderType === 'sell') {
    const SellOrder = require('../models/sellOrder.model');

    const sellQueryObj = { assignedTo: partner._id };

    if (status) sellQueryObj.status = status;
    if (Object.keys(dateFilter).length > 0) sellQueryObj.createdAt = dateFilter;

    if (search) {
      const searchConditions = [];

      if (search.match(/^[0-9a-fA-F]{24}$/)) {
        searchConditions.push({ _id: search });
      }

      if (search.length >= 3) {
        searchConditions.push({
          orderNumber: { $regex: search, $options: 'i' },
        });
      }

      searchConditions.push({
        'pickup.address.fullName': { $regex: search, $options: 'i' },
      });
      searchConditions.push({
        'pickup.address.phone': { $regex: search, $options: 'i' },
      });

      const User = require('../models/user.model');
      const matchingUsers = await User.find({
        $or: [
          { name: { $regex: search, $options: 'i' } },
          { email: { $regex: search, $options: 'i' } },
          { phone: { $regex: search, $options: 'i' } },
        ],
      }).select('_id');

      if (matchingUsers.length > 0) {
        searchConditions.push({
          userId: { $in: matchingUsers.map((u) => u._id) },
        });
      }

      if (searchConditions.length > 0) {
        sellQueryObj.$or = searchConditions;
      } else {
        sellQueryObj._id = null;
      }
    }

    const sellOrdersCount = await SellOrder.countDocuments(sellQueryObj);
    totalCount += sellOrdersCount;

    if (orderType === 'sell' || !orderType) {
      const sellOrders = await SellOrder.find(sellQueryObj)
        .populate('userId', 'name email phone')
        .populate({
          path: 'sessionId',
          populate: {
            path: 'productId',
            model: 'SellProduct',
            select: 'name brand images categoryId variants isActive',
          },
        })
        .populate('assignedTo', 'name email phone')
        .sort(sortObj)
        .lean();

      const sellOrdersWithType = sellOrders.map((order) => ({
        ...order,
        _id: order._id,
        orderType: 'sell',
        user: order.userId || { name: 'Guest User', email: '', phone: '' },
        totalAmount: order.actualAmount || order.quoteAmount,
        // Transform pickup address to shipping address format
        shippingAddress: order.pickup?.address
          ? {
              street: order.pickup.address.street,
              city: order.pickup.address.city,
              state: order.pickup.address.state,
              pincode: order.pickup.address.pincode,
            }
          : null,
        paymentMethod: order.payment?.method,
        // Create items array for consistency (sell orders don't have items like buy orders)
        items: [
          {
            _id: `${order._id}_item`,
            product: {
              _id:
                order.sessionId?.productId?._id ||
                order.sessionId?.productId ||
                'unknown',
              name: order.sessionId?.productId?.name || 'Device for Sell',
              brand: order.sessionId?.productId?.brand || 'Unknown',
              images: order.sessionId?.productId?.images || {},
              categoryId: order.sessionId?.productId?.categoryId || null,
              variants: order.sessionId?.productId?.variants || [],
              isActive: order.sessionId?.productId?.isActive || true,
            },
            quantity: 1,
            price: order.actualAmount || order.quoteAmount,
          },
        ],

        pickupDetails: {
          address: order.pickup?.address,
          slot: order.pickup?.slot,
          assignedTo: order.assignedTo,
        },
        createdAt: order.createdAt,
        updatedAt: order.updatedAt,
      }));

      allOrders = [...allOrders, ...sellOrdersWithType];
    }
  }

  allOrders.sort((a, b) => {
    const aValue = new Date(a.createdAt);
    const bValue = new Date(b.createdAt);
    return sortOrder * (aValue - bValue);
  });

  const paginatedOrders = allOrders.slice(skip, skip + limitNum);

  res.status(200).json({
    success: true,
    data: {
      docs: paginatedOrders,
      totalDocs: totalCount,
      limit: limitNum,
      page: pageNum,
      totalPages: Math.ceil(totalCount / limitNum),
      hasNextPage: pageNum < Math.ceil(totalCount / limitNum),
      hasPrevPage: pageNum > 1,
    },
  });
}

export async function respondToOrderAssignment(req, res) {
  const partner = await Partner.findOne({ user: req.user.id });
  if (!partner) {
    throw new ApiError('Partner profile not found', 404);
  }

  const { response, reason } = req.body;

  const order = await Order.findById(req.params.id).populate(
    'items.product',
    'name brand categoryId images pricing variants conditionOptions'
  );
  if (!order) {
    throw new ApiError('Order not found', 404);
  }

  if (!order.partner || order.partner.toString() !== partner._id.toString()) {
    throw new ApiError('Order is not assigned to your shop', 403);
  }

  if (order.partnerAssignment.response.status !== 'pending') {
    throw new ApiError('Order assignment has already been responded to', 400);
  }

  if (response === 'accepted') {
    const missingItems = [];

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

    if (missingItems.length > 0) {
      const missingProductNames = missingItems
        .map((item) =>
          item.insufficient
            ? `${item.productName} (need ${item.requiredQuantity}, have ${item.availableQuantity})`
            : `${item.productName} (not in inventory)`
        )
        .join(', ');

      throw new ApiError(
        `Cannot accept order. Missing or insufficient inventory for: ${missingProductNames}. Please add these products to your inventory with proper pricing first.`,
        400
      );
    }
  }

  order.partnerAssignment.response = {
    status: response,
    respondedAt: new Date(),
    reason: reason || '',
  };

  // Update order status based on response
  if (response === 'accepted') {
    order.status = 'confirmed';
    order.statusHistory.push({
      status: 'confirmed',
      timestamp: new Date(),
      note: `Order accepted by partner: ${reason || 'No reason provided'}`,
    });
  } else if (response === 'rejected') {
    order.status = 'pending';
    order.statusHistory.push({
      status: 'partner_rejected',
      timestamp: new Date(),
      note: `Order rejected by partner: ${reason || 'No reason provided'}`,
    });
  }

  await order.save();

  res.status(200).json({
    success: true,
    message: `Order ${response} successfully`,
    data: order,
  });
}

export async function checkMissingInventory(req, res) {
  const partner = await Partner.findOne({ user: req.user.id });
  if (!partner) {
    throw new ApiError('Partner profile not found', 404);
  }

  const order = await Order.findById(req.params.id).populate(
    'items.product',
    'name brand categoryId images pricing variants conditionOptions'
  );
  if (!order) {
    throw new ApiError('Order not found', 404);
  }

  if (!order.partner || order.partner.toString() !== partner._id.toString()) {
    throw new ApiError('Order is not assigned to your shop', 403);
  }

  const missingItems = [];
  const availableItems = [];

  for (const item of order.items) {
    const inventory = await Inventory.findOne({
      partner: partner._id,
      product: item.product._id,
      isAvailable: true,
      quantity: { $gte: item.quantity },
    }).populate('product', 'name brand categoryId images');

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
          ? 'You need to add missing products to your inventory before accepting this order'
          : 'You have all required products in inventory',
    },
  });
}

export async function updateOrderStatus(req, res) {
  const partner = await Partner.findOne({ user: req.user.id });
  if (!partner) {
    throw new ApiError('Partner profile not found', 404);
  }

  const order = await Order.findById(req.params.id);
  if (!order) {
    throw new ApiError('Order not found', 404);
  }

  if (!order.partner || order.partner.toString() !== partner._id.toString()) {
    throw new ApiError('Order is not assigned to your shop', 403);
  }

  if (
    order.partnerAssignment &&
    order.partnerAssignment.response.status !== 'accepted'
  ) {
    throw new ApiError(
      'You must accept the order assignment before updating status',
      403
    );
  }

  const oldStatus = order.status;
  order.status = req.body.status;

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
    message: 'Order status updated successfully',
  });
}

export async function getDashboardStats(req, res) {
  try {
    console.log('Dashboard request from user:', req.user.id);

    const partner = await Partner.findOne({ user: req.user.id });
    console.log('Found partner:', partner ? partner._id : 'No partner found');

    if (!partner) {
      return res.status(404).json({
        success: false,
        message: 'Partner profile not found',
      });
    }

    const inventoryCount = await Inventory.countDocuments({
      partner: partner._id,
    });
    const activeInventory = await Inventory.countDocuments({
      partner: partner._id,
      isAvailable: true,
      quantity: { $gt: 0 },
    });

    const buyOrders = await Order.countDocuments({
      partner: partner._id,
    });
    const pendingBuyOrders = await Order.countDocuments({
      partner: partner._id,
      status: { $in: ['pending', 'processing'] },
    });
    const completedBuyOrders = await Order.countDocuments({
      partner: partner._id,
      status: 'delivered',
    });

    const SellOrder = require('../models/sellOrder.model');
    const sellOrders = await SellOrder.countDocuments({
      assignedTo: partner._id,
    });
    const pendingSellOrders = await SellOrder.countDocuments({
      assignedTo: partner._id,
      status: { $in: ['draft', 'confirmed'] },
    });
    const completedSellOrders = await SellOrder.countDocuments({
      assignedTo: partner._id,
      status: 'paid',
    });

    const totalOrders = buyOrders + sellOrders;
    const pendingOrders = pendingBuyOrders + pendingSellOrders;
    const completedOrders = completedBuyOrders + completedSellOrders;

    const orders = await Order.find({
      partner: partner._id,
      status: 'delivered',
    });

    let totalRevenue = 0;
    let totalCommission = 0;

    orders.forEach((order) => {
      const partnerItems = order.items.filter(
        (item) =>
          item.partner &&
          item.partner.toString() === partner._id.toString() &&
          item.status === 'delivered'
      );

      partnerItems.forEach((item) => {
        totalRevenue += item.price * item.quantity;
        totalCommission += item.commission || 0;
      });
    });

    const completedSellOrdersData = await SellOrder.find({
      assignedTo: partner._id,
      status: 'paid',
    });

    completedSellOrdersData.forEach((order) => {
      totalRevenue += order.actualAmount || order.quoteAmount || 0;

      const sellCommission =
        (order.actualAmount || order.quoteAmount || 0) * 0.1;
      totalCommission += sellCommission;
    });

    const recentBuyOrders = await Order.find({ partner: partner._id })
      .sort('-createdAt')
      .limit(3)
      .populate('user', 'name')
      .populate('items.product', 'name brand categoryId images pricing')
      .lean();

    const recentSellOrders = await SellOrder.find({ assignedTo: partner._id })
      .sort('-createdAt')
      .limit(3)
      .populate('userId', 'name')
      .populate({
        path: 'sessionId',
        populate: {
          path: 'productId',
          model: 'SellProduct',
          select: 'name brand images categoryId variants isActive',
        },
      })
      .lean();

    const transformedSellOrders = recentSellOrders.map((order) => ({
      ...order,
      orderType: 'sell',
      user: order.userId || { name: 'Guest User' },
      totalAmount: order.actualAmount || order.quoteAmount,
      items: [
        {
          product: {
            _id:
              order.sessionId?.productId?._id ||
              order.sessionId?.productId ||
              'unknown',
            name: order.sessionId?.productId?.name || 'Device for Sell',
            brand: order.sessionId?.productId?.brand || 'Unknown',
            images: order.sessionId?.productId?.images || {},
            categoryId: order.sessionId?.productId?.categoryId || null,
            variants: order.sessionId?.productId?.variants || [],
            isActive: order.sessionId?.productId?.isActive || true,
          },
          quantity: 1,
          price: order.actualAmount || order.quoteAmount,
        },
      ],
    }));

    const transformedBuyOrders = recentBuyOrders.map((order) => ({
      ...order,
      orderType: 'buy',
    }));

    const allRecentOrders = [...transformedBuyOrders, ...transformedSellOrders]
      .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
      .slice(0, 5);

    console.log('Dashboard stats calculated successfully');

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
          buy: buyOrders,
          sell: sellOrders,
          pending: pendingOrders,
          completed: completedOrders,
        },
        revenue: {
          total: totalRevenue,
          commission: totalCommission,
          net: totalRevenue - totalCommission,
        },
        recentOrders: allRecentOrders,
      },
    });
  } catch (error) {
    console.error('Error in getDashboardStats:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch dashboard statistics',
      error: error.message,
    });
  }
}

import SellOrder from '../models/sellOrder.model';
import SellProduct from '../models/sellProduct.model';

export async function getDashboardSellBuy(req, res) {
  const partner = await Partner.findOne({ user: req.user.id });
  if (!partner) {
    throw new ApiError('Partner profile not found', 404);
  }

  const partnerId = partner._id;

  const sellProductCount = await SellProduct.countDocuments({ partnerId });
  const buyProductCount = await BuyProduct.countDocuments({ partnerId });

  const totalOrders = await SellOrder.countDocuments({ assignedTo: partnerId });
  const pendingOrders = await SellOrder.countDocuments({
    assignedTo: partnerId,
    status: { $in: ['draft', 'confirmed'] },
  });
  const completedOrders = await SellOrder.countDocuments({
    assignedTo: partnerId,
    status: 'paid',
  });

  const revenueData = await SellOrder.aggregate([
    {
      $match: {
        assignedTo: partnerId,
        status: 'paid',
      },
    },
    {
      $group: {
        _id: null,
        total: { $sum: '$quoteAmount' },
      },
    },
  ]);

  const totalRevenue = revenueData.length > 0 ? revenueData[0].total : 0;

  const recentOrders = await SellOrder.find({ assignedTo: partnerId })
    .sort({ createdAt: -1 })
    .limit(10)
    .populate({
      path: 'sessionId',
      populate: {
        path: 'productId',
        model: 'SellProduct',
        select: 'name brand images categoryId variants isActive',
      },
    })
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
        totalRevenue,
      },
      recentOrders,
    },
  });
}

export async function getPartnerSellProducts(req, res) {
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
      { tags: { $regex: search, $options: 'i' } },
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
      pages: Math.ceil(total / limit),
    },
  });
}

export async function getPartnerBuyProducts(req, res) {
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
      { brand: { $regex: search, $options: 'i' } },
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
      pages: Math.ceil(total / limit),
    },
  });
}

export async function getPartnerSellOrders(req, res) {
  const partner = await Partner.findOne({ user: req.user.id });
  if (!partner) {
    throw new ApiError('Partner profile not found', 404);
  }

  const { status, page = 1, limit = 10 } = req.query;
  const partnerId = partner._id;

  const filter = { assignedTo: partnerId };

  if (status) {
    filter.status = status;
  }

  const skip = (page - 1) * limit;

  const orders = await SellOrder.find(filter)
    .populate({
      path: 'sessionId',
      populate: {
        path: 'productId',
        model: 'SellProduct',
        select: 'name brand images categoryId variants isActive',
      },
    })
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
      pages: Math.ceil(total / limit),
    },
  });
}

export async function getPartnerSellOrderDetails(req, res) {
  const partner = await Partner.findOne({ user: req.user.id });
  if (!partner) {
    throw new ApiError('Partner profile not found', 404);
  }

  const partnerId = partner._id;
  const orderId = req.params.id;

  const order = await SellOrder.findOne({ _id: orderId, assignedTo: partnerId })
    .populate({
      path: 'sessionId',
      populate: {
        path: 'productId',
        model: 'SellProduct',
        select: 'name brand images categoryId variants isActive',
      },
    })
    .populate('userId', 'name email phone address');

  if (!order) {
    throw new ApiError('Order not found or access denied', 404);
  }

  res.status(200).json({
    success: true,
    data: order,
  });
}

export async function updatePartnerSellOrderStatus(req, res) {
  const partner = await Partner.findOne({ user: req.user.id });
  if (!partner) {
    throw new ApiError('Partner profile not found', 404);
  }

  const { status, notes } = req.body;
  const partnerId = partner._id;
  const orderId = req.params.id;

  const order = await SellOrder.findOne({
    _id: orderId,
    assignedTo: partnerId,
  });

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
    data: order,
  });
}

export async function getPartnerAgents(req, res) {
  const partner = await Partner.findOne({ user: req.user.id });
  if (!partner) {
    throw new ApiError('Partner profile not found', 404);
  }

  const { page = 1, limit = 10, status } = req.query;

  const query = { assignedPartner: partner._id };
  if (status) {
    query.isActive = status === 'active';
  }

  const agents = await Agent.find(query)
    .populate('user', 'name email phone isVerified')
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
}

export async function createAgent(req, res) {
  const partner = await Partner.findOne({ user: req.user.id });
  if (!partner) {
    throw new ApiError('Partner profile not found', 404);
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

  const existingUser = await User.findOne({ email });
  if (existingUser) {
    throw new ApiError('User with this email already exists', 400);
  }

  const user = await User.create({
    name: sanitizeData(name),
    email: sanitizeData(email),
    phone: sanitizeData(phone),
    role: 'agent',
    password: password,
    isVerified: false,
  });

  const agentCode = await Agent.generateAgentCode();

  const generateEmployeeId = () => {
    const date = new Date();
    const year = date.getFullYear().toString().slice(-2);
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const random = Math.floor(Math.random() * 9999)
      .toString()
      .padStart(4, '0');
    return `EMP${year}${month}${random}`;
  };

  const employeeId = generateEmployeeId();

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
    isActive: false,
  });

  await agent.populate('user', 'name email phone isVerified');

  res.status(201).json({
    success: true,
    message: 'Agent created successfully. Awaiting admin approval.',
    data: agent,
  });
}

export async function updateAgent(req, res) {
  const partner = await Partner.findOne({ user: req.user.id });
  if (!partner) {
    throw new ApiError('Partner profile not found', 404);
  }

  const agentId = req.params.agentId;
  const updateData = req.body;

  const agent = await Agent.findOne({
    _id: agentId,
    assignedPartner: partner._id,
  }).populate('user');

  if (!agent) {
    throw new ApiError('Agent not found or access denied', 404);
  }

  if (updateData.name || updateData.phone) {
    const userUpdateData = {};
    if (updateData.name) userUpdateData.name = sanitizeData(updateData.name);
    if (updateData.phone) userUpdateData.phone = sanitizeData(updateData.phone);

    await User.findByIdAndUpdate(agent.user._id, userUpdateData);
  }

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
  }).populate('user', 'name email phone isVerified');

  res.status(200).json({
    success: true,
    message: 'Agent updated successfully',
    data: updatedAgent,
  });
}

export async function deleteAgent(req, res) {
  const partner = await Partner.findOne({ user: req.user.id });
  if (!partner) {
    throw new ApiError('Partner profile not found', 404);
  }

  const agentId = req.params.agentId;

  const agent = await Agent.findOne({
    _id: agentId,
    assignedPartner: partner._id,
  });

  if (!agent) {
    throw new ApiError('Agent not found or access denied', 404);
  }

  agent.isActive = false;
  await agent.save();

  await User.findByIdAndUpdate(agent.user, { isActive: false });

  res.status(200).json({
    success: true,
    message: 'Agent deactivated successfully',
  });
}
