import { Agent } from '../models/agent.model.js';
import { BuyProduct } from '../models/buyProduct.model.js';
import { Order } from '../models/order.model.js';
import { Partner } from '../models/partner.model.js';
import { Product } from '../models/product.model.js';
import { SellOrder } from '../models/sellOrder.model.js';
import { SellProduct } from '../models/sellProduct.model.js';
import { User } from '../models/user.model.js';
import ApiError from '../utils/apiError.js';
import { sanitizeData } from '../utils/security.utils.js';

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
      .populate({
        path: 'categoryId',
        select: 'name displayName superCategory',
        populate: {
          path: 'superCategory',
          select: 'name displayName',
        },
      })
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

// Inventory functions removed - partners now manage products directly

export async function getPartnerProducts(req, res) {
  const partner = await Partner.findOne({ user: req.user.id });
  if (!partner) {
    throw new ApiError('Partner profile not found', 404);
  }

  const {
    page = 1,
    limit = 10,
    sort = '-createdAt',
    search,
    category,
    status,
  } = req.query;

  const queryObj = { partnerId: partner._id };

  if (search) {
    queryObj.$or = [
      { name: { $regex: search, $options: 'i' } },
      { brand: { $regex: search, $options: 'i' } },
    ];
  }

  if (category) queryObj.categoryId = category;
  if (status !== undefined) queryObj.isActive = status === 'true';

  const pageNum = parseInt(page, 10);
  const limitNum = parseInt(limit, 10);
  const skip = (pageNum - 1) * limitNum;

  const total = await BuyProduct.countDocuments(queryObj);

  const products = await BuyProduct.find(queryObj)
    .populate({
      path: 'categoryId',
      select: 'name displayName superCategory',
      populate: {
        path: 'superCategory',
        select: 'name displayName',
      },
    })
    .sort(sort)
    .skip(skip)
    .limit(limitNum);

  res.status(200).json({
    success: true,
    data: {
      docs: products,
      totalDocs: total,
      limit: limitNum,
      page: pageNum,
      totalPages: Math.ceil(total / limitNum),
      hasNextPage: pageNum < Math.ceil(total / limitNum),
      hasPrevPage: pageNum > 1,
    },
  });
}

export async function updatePartnerProduct(req, res) {
  try {
    const partner = await Partner.findOne({ user: req.user.id });
    if (!partner) {
      throw new ApiError('Partner profile not found', 404);
    }

    const product = await BuyProduct.findOne({
      _id: req.params.id,
      partnerId: partner._id,
    });

    if (!product) {
      throw new ApiError('Product not found or not owned by you', 404);
    }

    // Validate category if being updated
    if (req.body.categoryId) {
      const { BuyCategory } = await import('../models/buyCategory.model.js');
      const category = await BuyCategory.findById(req.body.categoryId).populate(
        'superCategory'
      );
      if (!category || !category.isActive) {
        return res.status(400).json({
          success: false,
          message: 'Invalid or inactive category ID.',
        });
      }

      // Validate super category is active
      if (!category.superCategory || !category.superCategory.isActive) {
        return res.status(400).json({
          success: false,
          message:
            'The selected category belongs to an inactive super category. Please contact admin.',
        });
      }
    }

    // Transform and prepare update data with same logic as create
    const updateData = {
      ...req.body,
      updatedBy: req.user.id,
    };

    // Remove fields that shouldn't be updated
    delete updateData._id;
    delete updateData.partnerId; // Prevent changing partner ownership
    delete updateData.partner;

    // Transform topSpecs from array to object format expected by schema
    if (req.body.topSpecs && Array.isArray(req.body.topSpecs)) {
      updateData.topSpecs = {
        screenSize: req.body.productDetails?.display?.size || '',
        chipset: req.body.productDetails?.general?.chipset || '',
        pixelDensity: req.body.productDetails?.display?.resolution || '',
        networkSupport: req.body.productDetails?.network?.network || '',
        simSlots: req.body.productDetails?.network?.sim || '',
      };
    }

    // Transform productDetails to match schema structure
    if (req.body.productDetails) {
      const details = req.body.productDetails;

      // Initialize productDetails if not exists
      if (!updateData.productDetails) {
        updateData.productDetails = {};
      }

      // Transform camera data to match schema
      if (details.camera) {
        updateData.productDetails = {
          ...updateData.productDetails,
          frontCamera: {
            resolution: details.camera?.front?.primary || '',
            setup: 'Single',
            features: [],
          },
          rearCamera: {
            setup: details.camera?.rear?.secondary ? 'Dual' : 'Single',
            camera1: {
              resolution: details.camera?.rear?.primary || '',
              type: 'Primary',
            },
            camera2: details.camera?.rear?.secondary
              ? {
                  resolution: details.camera?.rear?.secondary || '',
                  type: 'Secondary',
                }
              : undefined,
            features: [],
          },
        };
      }

      // Transform network connectivity
      if (details.network) {
        updateData.productDetails = {
          ...updateData.productDetails,
          networkConnectivity: {
            wifi: details.network?.wifi || '',
            bluetooth: details.network?.bluetooth || '',
            nfc: details.network?.nfc ? 'Yes' : 'No',
            gps: details.network?.gps ? 'Yes' : 'No',
            simSlots: details.network?.sim || '',
            networkSupport: details.network?.network || '',
            volte: details.network?.volte ? 'Yes' : 'No',
            esim: details.network?.esim ? 'Yes' : 'No',
            has3p5mmJack: details.network?.audioJack || false,
            wifiFeatures: [],
            audioFeatures: [],
          },
        };
      }

      // Transform memory storage
      if (details.memory) {
        updateData.productDetails = {
          ...updateData.productDetails,
          memoryStorage: {
            phoneVariants: [
              `${details.memory?.ram || ''} + ${details.memory?.storage || ''}`,
            ],
            expandableStorage: details.memory?.expandable || false,
            ramType: details.memory?.ramType || 'LPDDR',
            storageType: details.memory?.storageType || 'UFS',
          },
        };
      }

      // Transform performance
      if (details.general) {
        updateData.productDetails = {
          ...updateData.productDetails,
          performance: {
            chipset: details.general?.chipset || '',
            cpu: details.general?.processor || '',
            gpu: details.general?.gpu || '',
            os: details.general?.os || '',
            architecture: details.performance?.architecture || '64-bit',
            processTechnology: details.performance?.processTechnology || '6nm',
            clockSpeed: details.performance?.clockSpeed || '',
          },
        };
      }

      // Transform sensors data
      if (details.sensors) {
        updateData.productDetails = {
          ...updateData.productDetails,
          sensorsMisc: {
            fingerprintScanner: details.sensors?.fingerprintScanner || false,
            faceUnlock: details.sensors?.faceUnlock || false,
            sensors: Object.entries(details.sensors)
              .filter(
                ([key, value]) =>
                  value === true &&
                  key !== 'fingerprintScanner' &&
                  key !== 'faceUnlock'
              )
              .map(([key]) => key),
          },
        };
      }

      // Keep display, battery, and design as-is since they use Mixed type
      if (details.display) {
        updateData.productDetails = {
          ...updateData.productDetails,
          display: details.display,
        };
      }

      if (details.battery) {
        updateData.productDetails = {
          ...updateData.productDetails,
          battery: details.battery,
        };
      }

      if (details.design) {
        updateData.productDetails = {
          ...updateData.productDetails,
          design: details.design,
        };
      }

      // Keep general info
      if (details.general) {
        updateData.productDetails = {
          ...updateData.productDetails,
          general: {
            ...details.general,
          },
        };
      }
    }

    // Ensure required fields have default values if not provided
    if (!updateData.paymentOptions && req.body.paymentOptions) {
      updateData.paymentOptions = {
        emiAvailable: req.body.paymentOptions.emiAvailable || false,
        emiPlans: req.body.paymentOptions.emiPlans || [],
        methods: req.body.paymentOptions.methods || ['Cash', 'UPI', 'Card'],
      };
    }

    const updatedProduct = await BuyProduct.findByIdAndUpdate(
      req.params.id,
      { $set: updateData },
      { new: true, runValidators: true }
    ).populate({
      path: 'categoryId',
      select: 'name displayName superCategory',
      populate: {
        path: 'superCategory',
        select: 'name displayName',
      },
    });

    res.status(200).json({
      success: true,
      data: updatedProduct,
      message: 'Product updated successfully',
    });
  } catch (error) {
    console.error('Error updating partner product:', error);
    res.status(500).json({
      success: false,
      message: 'Error updating product',
      error: error.message,
    });
  }
}

export async function deletePartnerProduct(req, res) {
  const partner = await Partner.findOne({ user: req.user.id });
  if (!partner) {
    throw new ApiError('Partner profile not found', 404);
  }

  const product = await BuyProduct.findOne({
    _id: req.params.id,
    partnerId: partner._id,
  });

  if (!product) {
    throw new ApiError('Product not found or not owned by you', 404);
  }

  // Check for active orders
  const activeOrders = await Order.countDocuments({
    'items.product': req.params.id,
    status: { $nin: ['delivered', 'cancelled'] },
  });

  if (activeOrders > 0) {
    throw new ApiError('Cannot delete product with active orders', 400);
  }

  await BuyProduct.findByIdAndDelete(req.params.id);

  res.status(200).json({
    success: true,
    message: 'Product deleted successfully',
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
        .populate({
          path: 'assignedAgent',
          select: 'user agentCode employeeId',
          populate: {
            path: 'user',
            select: 'name email phone',
          },
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
    const sellQueryObj = {
      $or: [{ assignedTo: partner._id }, { assigned_partner_id: partner._id }],
    };

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
      // Check if partner owns this product and has sufficient stock
      const product = await BuyProduct.findOne({
        _id: item.product._id,
        partnerId: partner._id,
        isActive: true,
      });

      if (!product) {
        missingItems.push({
          productId: item.product._id,
          productName:
            item.product.name ||
            item.product.model ||
            `${item.product.brand} Product`,
          requiredQuantity: item.quantity,
          hasInventory: false,
        });
      } else if ((product.stock?.quantity || 0) < item.quantity) {
        missingItems.push({
          productId: item.product._id,
          productName:
            item.product.name ||
            item.product.model ||
            `${item.product.brand} Product`,
          requiredQuantity: item.quantity,
          availableQuantity: product.stock?.quantity || 0,
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
        `Cannot accept order. Missing or insufficient stock for: ${missingProductNames}. Please ensure you have these products with adequate stock quantities.`,
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
    // When partner rejects, clear partner assignment and set status to awaiting reassignment
    order.partner = null;
    order.status = 'pending'; // Keep as pending but clear partner so it can be reassigned
    order.partnerAssignment = {
      response: {
        status: 'pending',
      },
      reassignmentHistory: [
        ...order.partnerAssignment.reassignmentHistory,
        {
          previousPartner: partner._id,
          reason: reason || 'Partner rejected the order',
          reassignedAt: new Date(),
        },
      ],
    };
    order.statusHistory.push({
      status: 'partner_rejected',
      timestamp: new Date(),
      note: `Order rejected by partner: ${reason || 'No reason provided'}. Available for reassignment.`,
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
    // Check if partner owns this product and has sufficient stock
    const product = await BuyProduct.findOne({
      _id: item.product._id,
      partnerId: partner._id,
      isActive: true,
    });

    const itemStatus = {
      productId: item.product._id,
      productName: item.product.name || item.product.model,
      productBrand: item.product.brand,
      productCategory: item.product.categoryId?.name,
      productImages: item.product.images,
      requiredQuantity: item.quantity,
      hasInventory: !!product,
      availableQuantity: product?.stock?.quantity || 0,
      partnerPrice: product?.pricing?.mrp || null,
      condition: product?.stock?.condition || null,
      canFulfill: product && (product.stock?.quantity || 0) >= item.quantity,
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
          ? 'You need to add missing products or increase stock quantities before accepting this order'
          : 'You have all required products with sufficient stock',
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

    // Replace inventory stats with product stats
    const productCount = await BuyProduct.countDocuments({
      partnerId: partner._id,
    });
    const activeProducts = await BuyProduct.countDocuments({
      partnerId: partner._id,
      isActive: true,
      'stock.quantity': { $gt: 0 },
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

    const sellPartnerFilter = {
      $or: [{ assignedTo: partner._id }, { assigned_partner_id: partner._id }],
    };

    const sellOrders = await SellOrder.countDocuments(sellPartnerFilter);
    const pendingSellOrders = await SellOrder.countDocuments({
      ...sellPartnerFilter,
      status: { $in: ['draft', 'confirmed', 'pending_acceptance'] },
    });
    const completedSellOrders = await SellOrder.countDocuments({
      ...sellPartnerFilter,
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
      ...sellPartnerFilter,
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

    const recentSellOrders = await SellOrder.find(sellPartnerFilter)
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
        products: {
          total: productCount,
          active: activeProducts,
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

export async function getDashboardSellBuy(req, res) {
  const partner = await Partner.findOne({ user: req.user.id });
  if (!partner) {
    throw new ApiError('Partner profile not found', 404);
  }

  const partnerId = partner._id;

  const sellProductCount = await SellProduct.countDocuments({ partnerId });
  const buyProductCount = await BuyProduct.countDocuments({ partnerId });

  const partnerFilter = {
    $or: [{ assignedTo: partnerId }, { assigned_partner_id: partnerId }],
  };

  const totalOrders = await SellOrder.countDocuments(partnerFilter);
  const pendingOrders = await SellOrder.countDocuments({
    ...partnerFilter,
    status: { $in: ['draft', 'confirmed', 'pending_acceptance'] },
  });
  const completedOrders = await SellOrder.countDocuments({
    ...partnerFilter,
    status: 'paid',
  });

  const revenueData = await SellOrder.aggregate([
    {
      $match: {
        $or: [{ assignedTo: partnerId }, { assigned_partner_id: partnerId }],
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

  const recentOrders = await SellOrder.find(partnerFilter)
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
    .populate({
      path: 'categoryId',
      select: 'name displayName image superCategory',
      populate: {
        path: 'superCategory',
        select: 'name displayName',
      },
    })
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
    .populate({
      path: 'categoryId',
      select: 'name displayName image superCategory',
      populate: {
        path: 'superCategory',
        select: 'name displayName',
      },
    })
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

  // Check both old (assignedTo) and new (assigned_partner_id) assignment fields
  const filter = {
    $or: [{ assignedTo: partnerId }, { assigned_partner_id: partnerId }],
  };

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
        select:
          'name brand images categoryId variants isActive description specifications',
      },
    })
    .populate('userId', 'name email phone')
    .populate({
      path: 'assignedAgent',
      populate: {
        path: 'user',
        select: 'name email phone',
      },
      select: 'user agentCode employeeId',
    })
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

  const order = await SellOrder.findOne({
    _id: orderId,
    $or: [{ assignedTo: partnerId }, { assigned_partner_id: partnerId }],
  })
    .populate({
      path: 'sessionId',
      populate: {
        path: 'productId',
        model: 'SellProduct',
        select:
          'name brand images categoryId variants isActive description specifications',
      },
    })
    .populate('userId', 'name email phone address')
    .populate({
      path: 'assignedAgent',
      populate: {
        path: 'user',
        select: 'name email phone',
      },
      select: 'user agentCode employeeId',
    });

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
    $or: [{ assignedTo: partnerId }, { assigned_partner_id: partnerId }],
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
export async function assignAgentToOrder(req, res) {
  try {
    const partner = await Partner.findOne({ user: req.user.id });
    if (!partner) {
      throw new ApiError('Partner profile not found', 404);
    }

    const { agentId } = req.body;
    const orderId = req.params.id;

    // Verify the order belongs to this partner
    const order = await Order.findById(orderId);
    if (!order) {
      throw new ApiError('Order not found', 404);
    }

    if (!order.partner || order.partner.toString() !== partner._id.toString()) {
      throw new ApiError('Order is not assigned to your shop', 403);
    }

    // Verify the agent belongs to this partner
    const agent = await Agent.findOne({
      _id: agentId,
      assignedPartner: partner._id,
      isActive: true,
    }).populate('user', 'name email phone');

    if (!agent) {
      throw new ApiError('Agent not found or not assigned to your shop', 404);
    }

    // Update the order with agent assignment
    order.assignedAgent = agentId;
    order.statusHistory.push({
      status: order.status,
      timestamp: new Date(),
      note: `Agent ${agent.user.name} assigned to order`,
    });

    await order.save();

    // Populate the order with agent details for response
    await order.populate('assignedAgent', 'user agentCode employeeId');
    await order.populate({
      path: 'assignedAgent',
      populate: {
        path: 'user',
        select: 'name email phone',
      },
    });

    res.status(200).json({
      success: true,
      message: 'Agent assigned to order successfully',
      data: {
        orderId: order._id,
        assignedAgent: order.assignedAgent,
      },
    });
  } catch (error) {
    console.error('Error assigning agent to order:', error);
    res.status(500).json({
      success: false,
      message: 'Error assigning agent to order',
      error: error.message,
    });
  }
}

export async function createPartnerProduct(req, res) {
  try {
    const partner = await Partner.findOne({ user: req.user.id });
    if (!partner) {
      throw new ApiError('Partner profile not found', 404);
    }

    // Validate category exists and is active
    const { BuyCategory } = await import('../models/buyCategory.model.js');
    const category = await BuyCategory.findById(req.body.categoryId).populate(
      'superCategory'
    );
    if (!category || !category.isActive) {
      return res.status(400).json({
        success: false,
        message:
          'Invalid or inactive category ID. Please select a valid active category created by admin.',
      });
    }

    // Validate super category is active
    if (!category.superCategory || !category.superCategory.isActive) {
      return res.status(400).json({
        success: false,
        message:
          'The selected category belongs to an inactive super category. Please contact admin.',
      });
    }

    // Transform and create product data with partner ID automatically assigned
    const productData = {
      ...req.body,
      partnerId: partner._id, // Automatically assign partner ID from JWT token
      createdBy: req.user.id,
    };

    // Remove any manually passed partnerId from frontend for security
    delete productData.partner;

    // Transform topSpecs from array to object format expected by schema
    if (req.body.topSpecs && Array.isArray(req.body.topSpecs)) {
      productData.topSpecs = {
        screenSize: req.body.productDetails?.display?.size || '',
        chipset: req.body.productDetails?.general?.chipset || '',
        pixelDensity: req.body.productDetails?.display?.resolution || '',
        networkSupport: req.body.productDetails?.network?.network || '',
        simSlots: req.body.productDetails?.network?.sim || '',
      };
    }

    // Transform productDetails to match schema structure
    if (req.body.productDetails) {
      const details = req.body.productDetails;

      // Transform camera data to match schema
      if (details.camera) {
        productData.productDetails = {
          ...productData.productDetails,
          frontCamera: {
            resolution: details.camera?.front?.primary || '',
            setup: 'Single',
            features: [],
          },
          rearCamera: {
            setup: details.camera?.rear?.secondary ? 'Dual' : 'Single',
            camera1: {
              resolution: details.camera?.rear?.primary || '',
              type: 'Primary',
            },
            camera2: details.camera?.rear?.secondary
              ? {
                  resolution: details.camera?.rear?.secondary || '',
                  type: 'Secondary',
                }
              : undefined,
            features: [],
          },
        };
      }

      // Transform network connectivity
      if (details.network) {
        productData.productDetails = {
          ...productData.productDetails,
          networkConnectivity: {
            wifi: details.network?.wifi || '',
            bluetooth: details.network?.bluetooth || '',
            nfc: details.network?.nfc ? 'Yes' : 'No',
            gps: details.network?.gps ? 'Yes' : 'No',
            simSlots: details.network?.sim || '',
            networkSupport: details.network?.network || '',
            wifiFeatures: [],
            audioFeatures: [],
          },
        };
      }

      // Transform memory storage
      if (details.memory) {
        productData.productDetails = {
          ...productData.productDetails,
          memoryStorage: {
            phoneVariants: [
              `${details.memory?.ram || ''} + ${details.memory?.storage || ''}`,
            ],
            expandableStorage: details.memory?.expandable || false,
            ramType: 'LPDDR',
            storageType: 'UFS',
          },
        };
      }

      // Transform performance
      if (details.general) {
        productData.productDetails = {
          ...productData.productDetails,
          performance: {
            chipset: details.general?.chipset || '',
            cpu: details.general?.processor || '',
            gpu: details.general?.gpu || '',
            os: details.general?.os || '',
            architecture: '64-bit',
            processTechnology: '6nm',
          },
        };
      }

      // Keep display and battery as-is since they use Mixed type
      if (details.display) {
        productData.productDetails = {
          ...productData.productDetails,
          display: details.display,
        };
      }

      if (details.battery) {
        productData.productDetails = {
          ...productData.productDetails,
          battery: details.battery,
        };
      }

      if (details.design) {
        productData.productDetails = {
          ...productData.productDetails,
          design: details.design,
        };
      }
    }

    // Add default values for required fields
    if (!productData.paymentOptions) {
      productData.paymentOptions = {
        emiAvailable: false,
        emiPlans: [],
        methods: ['Cash', 'UPI', 'Card'],
      };
    }

    if (!productData.rating) {
      productData.rating = {
        average: 0,
        totalReviews: 0,
        breakdown: {
          '5star': 0,
          '4star': 0,
          '3star': 0,
          '2star': 0,
          '1star': 0,
        },
      };
    }

    const product = new BuyProduct(productData);
    await product.save();

    const populatedProduct = await BuyProduct.findById(product._id)
      .populate({
        path: 'categoryId',
        select: 'name displayName superCategory',
        populate: {
          path: 'superCategory',
          select: 'name displayName',
        },
      })
      .populate('partnerId', 'shopName')
      .populate('createdBy', 'name email');

    res.status(201).json({
      success: true,
      message: 'Product created successfully',
      data: populatedProduct,
    });
  } catch (error) {
    console.error('Error creating partner product:', error);
    res.status(500).json({
      success: false,
      message: 'Error creating product',
      error: error.message,
    });
  }
}

export async function getAvailableSellOrders(req, res) {
  try {
    const partner = await Partner.findOne({ user: req.user.id });
    if (!partner) {
      throw new ApiError('Partner profile not found', 404);
    }

    if (
      !partner.location ||
      !partner.location.coordinates ||
      (partner.location.coordinates[0] === 0 &&
        partner.location.coordinates[1] === 0)
    ) {
      return res.status(400).json({
        success: false,
        message:
          'Partner location not configured. Please update your shop coordinates.',
        requiresLocationSetup: true,
      });
    }

    const { page = 1, limit = 20 } = req.query;
    const skip = (page - 1) * limit;

    let availableOrders;
    let usingFallback = false;

    try {
      const allAvailableOrders = await SellOrder.findAvailableNearPartner(
        partner.location,
        partner.service_radius,
        parseInt(limit) + skip // Get more to handle pagination
      );

      availableOrders = allAvailableOrders.slice(skip, skip + parseInt(limit));
    } catch (geoError) {
      console.error('Geospatial query error:', geoError);

      console.log('Falling back to non-geospatial query...');
      try {
        availableOrders = await SellOrder.find({
          assigned_partner_id: null,
          status: 'open',
        })
          .populate('userId', 'name email phone')
          .populate({
            path: 'sessionId',
            populate: {
              path: 'productId',
              model: 'SellProduct',
              select:
                'name brand images categoryId variants isActive description specifications',
            },
          })
          .sort({ createdAt: -1 })
          .limit(parseInt(limit))
          .skip(skip);
      } catch (fallbackError) {
        console.error('Fallback query error:', fallbackError);
        return res.status(500).json({
          success: false,
          message: 'Error finding available orders.',
          error: fallbackError.message,
        });
      }

      usingFallback = true;
    }

    const radiusInRadians = partner.service_radius / 6378100;

    let totalCount;
    try {
      totalCount = await SellOrder.countDocuments({
        assigned_partner_id: null,
        status: 'open',
        'pickup.location': {
          $geoWithin: {
            $centerSphere: [partner.location.coordinates, radiusInRadians],
          },
        },
      });
    } catch (countError) {
      console.error('Count query error:', countError);

      try {
        totalCount = await SellOrder.countDocuments({
          assigned_partner_id: null,
          status: 'open',
        });
      } catch (fallbackCountError) {
        console.error('Fallback count error:', fallbackCountError);
        totalCount = 0; // Final fallback
      }
    }

    const ordersWithDistance = availableOrders.map((order) => {
      let distance = 0;
      let distanceFormatted = 'Unknown';

      if (
        isValidLocation(partner.location) &&
        isValidLocation(order.pickup?.location)
      ) {
        distance = calculateDistance(
          partner.location.coordinates[1], // latitude
          partner.location.coordinates[0], // longitude
          order.pickup.location.coordinates[1],
          order.pickup.location.coordinates[0]
        );

        distanceFormatted =
          distance > 1000
            ? `${(distance / 1000).toFixed(1)} km`
            : `${Math.round(distance)} m`;
      }

      return {
        ...(order.toObject ? order.toObject() : order), // Handle both Mongoose docs and plain objects
        distanceFromPartner: Math.round(distance), // in meters
        distanceFormatted,
      };
    });

    res.json({
      success: true,
      data: {
        orders: ordersWithDistance,
        pagination: {
          currentPage: parseInt(page),
          totalPages: Math.ceil(totalCount / limit),
          totalOrders: totalCount,
          hasNext: page * limit < totalCount,
          hasPrev: page > 1,
        },
        partnerInfo: {
          serviceRadius: partner.service_radius,
          serviceRadiusFormatted: `${(partner.service_radius / 1000).toFixed(1)} km`,
          location: partner.location,
          isLocationFiltered: !usingFallback, // Indicates if geospatial filtering was used
          fallbackMode: usingFallback || false, // Indicates if showing all orders due to location issues
        },
      },
    });
  } catch (error) {
    console.error('Error fetching available sell orders:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching available orders',
      error: error.message,
    });
  }
}

export async function claimSellOrder(req, res) {
  try {
    const partner = await Partner.findOne({ user: req.user.id });
    if (!partner) {
      throw new ApiError('Partner profile not found', 404);
    }

    const { orderId } = req.params;
    const { notes } = req.body;

    const claimedOrder = await SellOrder.claimOrder(orderId, partner._id);

    if (!claimedOrder) {
      return res.status(409).json({
        success: false,
        message:
          'Order already taken by another partner or no longer available',
        code: 'ORDER_ALREADY_CLAIMED',
      });
    }

    if (notes) {
      claimedOrder.notes = notes;
      await claimedOrder.save();
    }

    const populatedOrder = await SellOrder.findById(claimedOrder._id)
      .populate('userId', 'name email phone')
      .populate('sessionId')
      .populate('assigned_partner_id', 'shopName shopPhone shopEmail');

    res.json({
      success: true,
      message: 'Order claimed successfully',
      data: populatedOrder,
    });
  } catch (error) {
    console.error('Error claiming sell order:', error);
    res.status(500).json({
      success: false,
      message: 'Error claiming order',
      error: error.message,
    });
  }
}

export async function updatePartnerLocation(req, res) {
  try {
    const partner = await Partner.findOne({ user: req.user.id });
    if (!partner) {
      throw new ApiError('Partner profile not found', 404);
    }

    const { latitude, longitude, serviceRadius } = req.body;

    if (
      !latitude ||
      !longitude ||
      latitude < -90 ||
      latitude > 90 ||
      longitude < -180 ||
      longitude > 180
    ) {
      return res.status(400).json({
        success: false,
        message: 'Invalid coordinates provided',
      });
    }

    if (serviceRadius && serviceRadius < 1000) {
      return res.status(400).json({
        success: false,
        message: 'Service radius must be at least 1km',
      });
    }

    await partner.updateLocationFromCoordinates(latitude, longitude);

    if (serviceRadius) {
      partner.service_radius = serviceRadius;
      await partner.save();
    }

    res.json({
      success: true,
      message: 'Location updated successfully',
      data: {
        location: partner.location,
        serviceRadius: partner.service_radius,
        serviceRadiusFormatted: `${(partner.service_radius / 1000).toFixed(1)} km`,
      },
    });
  } catch (error) {
    console.error('Error updating partner location:', error);
    res.status(500).json({
      success: false,
      message: 'Error updating location',
      error: error.message,
    });
  }
}

export async function getClaimedSellOrders(req, res) {
  try {
    const partner = await Partner.findOne({ user: req.user.id });
    if (!partner) {
      throw new ApiError('Partner profile not found', 404);
    }

    const { page = 1, limit = 20, status } = req.query;
    const skip = (page - 1) * limit;

    const query = { assigned_partner_id: partner._id };
    if (status) {
      query.status = status;
    }

    const claimedOrders = await SellOrder.find(query)
      .populate('userId', 'name email phone')
      .populate('sessionId')
      .sort({ createdAt: -1 })
      .limit(parseInt(limit))
      .skip(skip);

    const totalCount = await SellOrder.countDocuments(query);

    res.json({
      success: true,
      data: {
        orders: claimedOrders,
        pagination: {
          currentPage: parseInt(page),
          totalPages: Math.ceil(totalCount / limit),
          totalOrders: totalCount,
          hasNext: page * limit < totalCount,
          hasPrev: page > 1,
        },
      },
    });
  } catch (error) {
    console.error('Error fetching claimed sell orders:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching claimed orders',
      error: error.message,
    });
  }
}

export async function assignAgentToSellOrder(req, res) {
  try {
    const partner = await Partner.findOne({ user: req.user.id });
    if (!partner) {
      throw new ApiError('Partner profile not found', 404);
    }

    console.log('Partner found:', partner._id, 'for user:', req.user.id);

    const orderId = req.params.id;
    const { agentId } = req.body;

    console.log('Looking for order:', orderId, 'for partner:', partner._id);

    const orderExists = await SellOrder.findById(orderId);
    console.log('Order exists:', orderExists ? 'Yes' : 'No');
    if (orderExists) {
      console.log('Order assignedTo:', orderExists.assignedTo);
      console.log(
        'Order assigned_partner_id:',
        orderExists.assigned_partner_id
      );
    }

    const order = await SellOrder.findOne({
      _id: orderId,
      $or: [{ assignedTo: partner._id }, { assigned_partner_id: partner._id }],
    });

    if (!order) {
      if (orderExists) {
        console.log('Order exists but not assigned to partner:', {
          orderId,
          partnerId: partner._id,
          orderAssignedTo: orderExists.assignedTo,
          orderAssignedPartnerId: orderExists.assigned_partner_id,
          orderStatus: orderExists.status,
        });
        return res.status(403).json({
          success: false,
          message: 'Order is not assigned to your shop',
        });
      }

      return res.status(404).json({
        success: false,
        message: 'Order not found',
      });
    }

    const Agent = (await import('../models/agent.model.js')).Agent;
    const agent = await Agent.findOne({
      _id: agentId,
      assignedPartner: partner._id,
    });

    if (!agent) {
      return res.status(404).json({
        success: false,
        message: 'Agent not found or not assigned to your shop',
      });
    }

    order.assignedAgent = agentId;
    await order.save();

    const updatedOrder = await SellOrder.findById(orderId)
      .populate('userId', 'name email phone')
      .populate('sessionId')
      .populate('assignedAgent', 'user agentCode')
      .populate({
        path: 'assignedAgent',
        populate: {
          path: 'user',
          select: 'name email phone',
        },
      });

    res.json({
      success: true,
      message: 'Agent assigned successfully',
      data: updatedOrder,
    });
  } catch (error) {
    console.error('Error assigning agent to sell order:', error);
    res.status(500).json({
      success: false,
      message: 'Error assigning agent',
      error: error.message,
    });
  }
}

function calculateDistance(lat1, lon1, lat2, lon2) {
  const R = 6371000;
  const φ1 = (lat1 * Math.PI) / 180;
  const φ2 = (lat2 * Math.PI) / 180;
  const Δφ = ((lat2 - lat1) * Math.PI) / 180;
  const Δλ = ((lon2 - lon1) * Math.PI) / 180;

  const a =
    Math.sin(Δφ / 2) * Math.sin(Δφ / 2) +
    Math.cos(φ1) * Math.cos(φ2) * Math.sin(Δλ / 2) * Math.sin(Δλ / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

  return R * c; // Distance in meters
}

function isValidLocation(location) {
  return (
    location &&
    location.coordinates &&
    Array.isArray(location.coordinates) &&
    location.coordinates.length === 2 &&
    typeof location.coordinates[0] === 'number' &&
    typeof location.coordinates[1] === 'number' &&
    location.coordinates[0] !== 0 &&
    location.coordinates[1] !== 0
  );
}
