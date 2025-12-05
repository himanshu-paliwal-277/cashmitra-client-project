const { validationResult } = require("express-validator");
const BuyProduct = require("../models/buyProduct.model");
const Order = require("../models/order.model");
const Cart = require("../models/cart.model");
const User = require("../models/user.model");
const Partner = require("../models/partner.model");
const Product = require("../models/product.model");
const Wallet = require("../models/wallet.model");
const Transaction = require("../models/transaction.model");
const mongoose = require("mongoose");

/**
 * @desc    Search products by category, brand, or model
 * @route   GET /api/buy/search
 * @access  Public
 */
const searchProducts = async (req, res) => {
  try {
    const { query, category, condition, minPrice, maxPrice, pincode } =
      req.query;

    // Build search filter
    const filter = { isAvailable: true };

    // Add category filter if provided
    if (category) {
      filter["product.category"] = category;
    }

    // Add condition filter if provided
    if (condition) {
      filter.condition = condition;
    }

    // Add price range filter if provided
    if (minPrice || maxPrice) {
      filter.price = {};
      if (minPrice) filter.price.$gte = Number(minPrice);
      if (maxPrice) filter.price.$lte = Number(maxPrice);
    }

    // Find partners in the specified pincode if provided
    let partnerIds = [];
    if (pincode) {
      const partners = await Partner.find({
        "address.pincode": pincode,
        isVerified: true,
      });
      partnerIds = partners.map((partner) => partner._id);

      if (partnerIds.length === 0) {
        return res.json({
          products: [],
          total: 0,
          message: "No partner shops available in your area",
        });
      }

      filter.partner = { $in: partnerIds };
    }

    // Text search if query is provided
    let inventoryItems;
    if (query) {
      // First find products matching the query
      const products = await Product.find(
        { $text: { $search: query } },
        { score: { $meta: "textScore" } }
      ).sort({ score: { $meta: "textScore" } });

      const productIds = products.map((product) => product._id);

      // Then find inventory items with those products
      if (productIds.length > 0) {
        filter.product = { $in: productIds };
      } else {
        // If no products match, return empty result
        return res.json({ products: [], total: 0 });
      }
    }

    // Fetch inventory items with pagination
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    inventoryItems = await BuyProduct.find(filter)
      .populate("partner", "shopName address rating")
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    const total = await BuyProduct.countDocuments(filter);

    res.json({
      products: inventoryItems,
      total,
      page,
      pages: Math.ceil(total / limit),
    });
  } catch (error) {
    console.error("Error searching products:", error);
    res.status(500).json({ message: "Server error" });
  }
};

/**
 * @desc    Get product details
 * @route   GET /api/buy/product/:id
 * @access  Public
 */
const getProductDetails = async (req, res) => {
  try {
    const product = await BuyProduct.findById(req.params.id).populate(
      "partner",
      "shopName address phone rating"
    );

    if (!product) {
      return res.status(404).json({ message: "Product not found" });
    }

    // Find similar products from the same partner
    const similarProducts = await BuyProduct.find({
      partner: product.partner._id,
      category: product.category,
      _id: { $ne: product._id },
      "availability.inStock": true,
    }).limit(4);

    res.json({
      product: product,
      similarProducts,
    });
  } catch (error) {
    console.error("Error fetching product details:", error);
    res.status(500).json({ message: "Server error" });
  }
};

/**
 * @desc    Add product to cart
 * @route   POST /api/buy/cart
 * @access  Private
 */
const addToCart = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  try {
    const { productId, quantity } = req.body;
    const userId = req.user.id;

    // Check if product exists and is available
    const product = await BuyProduct.findById(productId);
    if (!product) {
      return res.status(404).json({ message: "Product not found" });
    }

    if (!product.availability.inStock) {
      return res.status(400).json({ message: "Product is not available" });
    }

    // Find or create user's cart
    let cart = await Cart.findOne({ user: userId });
    if (!cart) {
      cart = new Cart({ user: userId, items: [] });
    }

    // Check if product is already in cart
    const existingItemIndex = cart.items.findIndex(
      (item) => item.productId.toString() === productId
    );

    if (existingItemIndex !== -1) {
      cart.items[existingItemIndex].quantity += quantity;
    } else {
      // Add new item to cart
      cart.items.push({
        productId,
        quantity,
      });
    }

    await cart.save();

    // Fetch details for each cart item (same as getCart)
    const cartItemsPromises = cart.items.map(async (item) => {
      const product = await BuyProduct.findById(item.productId);

      if (!product) {
        return null;
      }

      return {
        productId: item.productId,
        quantity: item.quantity,
        price: product.pricing.discountedPrice || product.pricing.mrp,
        subtotal:
          (product.pricing.discountedPrice || product.pricing.mrp) *
          item.quantity,
        product: {
          brand: product.brand,
          name: product.name,
          images: product.images,
        },
        isAvailable: product.availability.inStock,
        addedAt: item.addedAt,
      };
    });

    let cartItems = await Promise.all(cartItemsPromises);
    cartItems = cartItems.filter((item) => item !== null);

    // Calculate total
    const total = cartItems.reduce((sum, item) => sum + item.subtotal, 0);

    res.json({
      message: "Product added to cart",
      cart: cartItems,
      total,
    });
  } catch (error) {
    console.error("Error adding to cart:", error);
    res.status(500).json({ message: "Server error" });
  }
};

/**
 * @desc    Get cart items
 * @route   GET /api/buy/cart
 * @access  Private
 */
const getCart = async (req, res) => {
  try {
    const userId = req.user.id;

    // Find user's cart
    const cart = await Cart.findOne({ user: userId });

    if (!cart || cart.items.length === 0) {
      return res.json({ cart: [], total: 0 });
    }

    // Fetch details for each cart item
    const cartItemsPromises = cart.items.map(async (item) => {
      const product = await BuyProduct.findById(item.productId);

      if (!product) {
        return null; // Item no longer exists
      }

      return {
        productId: item.productId,
        quantity: item.quantity,
        price: product.pricing.discountedPrice || product.pricing.mrp,
        subtotal:
          (product.pricing.discountedPrice || product.pricing.mrp) *
          item.quantity,
        product: {
          brand: product.brand,
          name: product.name,
          images: product.images,
        },
        isAvailable: product.availability.inStock,
        addedAt: item.addedAt,
      };
    });

    let cartItems = await Promise.all(cartItemsPromises);

    // Filter out null items (those that no longer exist)
    cartItems = cartItems.filter((item) => item !== null);

    // Update cart to remove items that no longer exist
    cart.items = cart.items.filter((item) =>
      cartItems.some(
        (cartItem) =>
          cartItem &&
          cartItem.productId.toString() === item.productId.toString()
      )
    );

    if (cart.items.length !== cartItems.length) {
      await cart.save();
    }

    // Calculate total
    const total = cartItems.reduce((sum, item) => sum + item.subtotal, 0);

    res.json({
      cart: cartItems,
      total,
    });
  } catch (error) {
    console.error("Error fetching cart:", error);
    res.status(500).json({ message: "Server error" });
  }
};

/**
 * @desc    Update cart item quantity
 * @route   PUT /api/buy/cart/:productId
 * @access  Private
 */
const updateCartItem = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  try {
    const { itemId } = req.params;
    const productId = itemId; // itemId is actually the productId
    const { quantity } = req.body;
    const userId = req.user.id;

    // Find user's cart
    const cart = await Cart.findOne({ user: userId });
    if (!cart) {
      return res.status(404).json({ message: "Cart is empty" });
    }

    // Find the item in the cart
    const itemIndex = cart.items.findIndex(
      (item) => item.productId.toString() === productId
    );

    if (itemIndex === -1) {
      return res.status(404).json({ message: "Item not found in cart" });
    }

    // Check product availability
    const product = await BuyProduct.findById(productId);
    if (!product) {
      // Remove item from cart if it no longer exists
      cart.items.splice(itemIndex, 1);
      await cart.save();
      return res.status(404).json({ message: "Product no longer exists" });
    }

    if (!product.availability.inStock) {
      return res.status(400).json({ message: "Product is not available" });
    }

    // Update quantity
    if (quantity <= 0) {
      // Remove item if quantity is 0 or negative
      cart.items.splice(itemIndex, 1);
    } else {
      cart.items[itemIndex].quantity = quantity;
    }

    await cart.save();

    res.json({
      message: "Cart updated successfully",
      cart: cart.items,
    });
  } catch (error) {
    console.error("Error updating cart:", error);
    res.status(500).json({ message: "Server error" });
  }
};

/**
 * @desc    Remove item from cart
 * @route   DELETE /api/buy/cart/:productId
 * @access  Private
 */
const removeCartItem = async (req, res) => {
  try {
    const { itemId } = req.params;
    const productId = itemId; // itemId is actually the productId
    const userId = req.user.id;

    // Find user's cart
    const cart = await Cart.findOne({ user: userId });
    if (!cart) {
      return res.status(404).json({ message: "Cart is empty" });
    }

    // Find the item in the cart
    const itemIndex = cart.items.findIndex(
      (item) => item.productId.toString() === productId
    );

    if (itemIndex === -1) {
      return res.status(404).json({ message: "Item not found in cart" });
    }

    // Remove item from cart
    cart.items.splice(itemIndex, 1);
    await cart.save();

    res.json({
      message: "Item removed from cart",
      cart: cart.items,
    });
  } catch (error) {
    console.error("Error removing cart item:", error);
    res.status(500).json({ message: "Server error" });
  }
};

/**
 * @desc    Create buy order (checkout)
 * @route   POST /api/buy/checkout
 * @access  Private
 */
const checkout = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  try {
    const { shippingAddress, paymentMethod } = req.body;
    const userId = req.user.id;

    // Find user's cart
    const cart = await Cart.findOne({ user: userId });
    if (!cart || cart.items.length === 0) {
      return res.status(400).json({ message: "Cart is empty" });
    }

    // Group cart items by partner
    const partnerItems = {};

    // Validate all items and group by partner
    for (const item of cart.items) {
      const product = await BuyProduct.findById(item.productId).populate(
        "partner"
      );

      if (!product) {
        return res.status(404).json({
          message: "One or more products in your cart are no longer available",
        });
      }

      if (!product.availability.inStock) {
        return res.status(400).json({
          message: `Product ${product.brand} ${product.model} is no longer available`,
        });
      }

      const partnerId = product.partner._id.toString();

      if (!partnerItems[partnerId]) {
        partnerItems[partnerId] = {
          partner: product.partner,
          items: [],
        };
      }

      partnerItems[partnerId].items.push({
        product: product._id,
        price: product.pricing.finalPrice,
        quantity: item.quantity,
      });
    }

    // Create orders for each partner
    const orders = [];

    for (const partnerId in partnerItems) {
      const partnerData = partnerItems[partnerId];

      // Calculate total amount for this partner's items
      const totalAmount = partnerData.items.reduce(
        (sum, item) => sum + item.price * item.quantity,
        0
      );

      // Calculate commission (5% of the total amount)
      const commissionRate = 5;
      const commissionAmount = (totalAmount * commissionRate) / 100;

      // Create order
      const order = new Order({
        orderType: "buy",
        user: req.user._id,
        partner: partnerId,
        items: partnerData.items,
        totalAmount,
        commission: {
          rate: commissionRate,
          amount: commissionAmount,
        },
        paymentDetails: {
          method: paymentMethod,
          status: "pending",
        },
        shippingDetails: {
          address: shippingAddress,
          contactPhone: req.user.phone,
          deliveryMethod: "Cashmitra Logistics",
        },
        status: "pending",
        statusHistory: [
          {
            status: "pending",
            note: "Order created and pending partner confirmation",
          },
        ],
      });

      await order.save();
      orders.push(order);
    }

    // Clear the cart after successful checkout
    cart.items = [];
    await cart.save();

    res.status(201).json({
      message: "Orders created successfully",
      orders: orders.map((order) => ({
        _id: order._id,
        partner: order.partner,
        totalAmount: order.totalAmount,
        status: order.status,
      })),
    });
  } catch (error) {
    console.error("Error during checkout:", error);
    res.status(500).json({ message: "Server error" });
  }
};

/**
 * @desc    Get buy order details
 * @route   GET /api/buy/order/:id
 * @access  Private
 */
const getBuyOrderDetails = async (req, res) => {
  try {
    const order = await Order.findOne({
      _id: req.params.id,
      user: req.user._id,
      orderType: "buy",
    })
      .populate("partner", "shopName address phone")
      .populate({
        path: "items.inventory",
        populate: {
          path: "product",
          select: "category brand model variant images",
        },
      });

    if (!order) {
      return res.status(404).json({ message: "Order not found" });
    }

    res.json({ order });
  } catch (error) {
    console.error("Error fetching buy order:", error);
    res.status(500).json({ message: "Server error" });
  }
};

/**
 * @desc    Get user's buy orders
 * @route   GET /api/buy/orders
 * @access  Private
 */
const getUserBuyOrders = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    const orders = await Order.find({
      user: req.user._id,
      orderType: "buy",
    })
      .populate("partner", "shopName")
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    const total = await Order.countDocuments({
      user: req.user._id,
      orderType: "buy",
    });

    res.json({
      orders,
      total,
      page,
      pages: Math.ceil(total / limit),
    });
  } catch (error) {
    console.error("Error fetching user buy orders:", error);
    res.status(500).json({ message: "Server error" });
  }
};

module.exports = {
  searchProducts,
  getProductDetails,
  addToCart,
  getCart,
  updateCartItem,
  removeCartItem,
  checkout,
  getBuyOrderDetails,
  getUserBuyOrders,
};
