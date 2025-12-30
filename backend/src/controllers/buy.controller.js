import { BuyProduct } from '../models/buyProduct.model.js';
import { Cart } from '../models/cart.model.js';
import { Order } from '../models/order.model.js';
import { Partner } from '../models/partner.model.js';
import { Product } from '../models/product.model.js';

export const searchProducts = async (req, res) => {
  try {
    const { query, category, condition, minPrice, maxPrice, pincode } =
      req.query;

    const filter = { isAvailable: true };

    if (category) {
      filter['product.category'] = category;
    }

    if (condition) {
      filter.condition = condition;
    }

    if (minPrice || maxPrice) {
      filter.price = {};
      if (minPrice) filter.price.$gte = Number(minPrice);
      if (maxPrice) filter.price.$lte = Number(maxPrice);
    }

    let partnerIds = [];
    if (pincode) {
      const partners = await Partner.find({
        'address.pincode': pincode,
        isVerified: true,
      });
      partnerIds = partners.map((partner) => partner._id);

      if (partnerIds.length === 0) {
        return res.json({
          products: [],
          total: 0,
          message: 'No partner shops available in your area',
        });
      }

      filter.partnerId = { $in: partnerIds };
    }

    let inventoryItems;
    if (query) {
      const products = await Product.find(
        { $text: { $search: query } },
        { score: { $meta: 'textScore' } }
      ).sort({ score: { $meta: 'textScore' } });

      const productIds = products.map((product) => product._id);

      if (productIds.length > 0) {
        filter.product = { $in: productIds };
      } else {
        return res.json({ products: [], total: 0 });
      }
    }

    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    inventoryItems = await BuyProduct.find(filter)
      .populate('partnerId', 'shopName address rating')
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
    console.error('Error searching products:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

export const getProductDetails = async (req, res) => {
  try {
    const product = await BuyProduct.findById(req.params.id).populate(
      'partnerId',
      'shopName address phone rating'
    );

    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }

    const similarProducts = await BuyProduct.find({
      partnerId: product.partnerId,
      categoryId: product.categoryId,
      _id: { $ne: product._id },
      'availability.inStock': true,
    }).limit(4);

    res.json({
      product: product,
      similarProducts,
    });
  } catch (error) {
    console.error('Error fetching product details:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

export const addToCart = async (req, res) => {
  try {
    const { productId, quantity, selectedCondition } = req.body;
    const userId = req.user.id;

    console.log('AddToCart - Received data:', {
      productId,
      quantity,
      selectedCondition,
    });
    console.log(
      'AddToCart - selectedCondition type:',
      typeof selectedCondition
    );
    console.log(
      'AddToCart - selectedCondition JSON:',
      JSON.stringify(selectedCondition)
    );

    const product = await BuyProduct.findById(productId);
    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }

    if (!product.availability.inStock) {
      return res.status(400).json({ message: 'Product is not available' });
    }

    let cart = await Cart.findOne({ user: userId });
    if (!cart) {
      cart = new Cart({ user: userId, items: [] });
    }

    const existingItemIndex = cart.items.findIndex(
      (item) =>
        item.productId.toString() === productId &&
        JSON.stringify(item.selectedCondition) ===
          JSON.stringify(selectedCondition)
    );

    // If adding an item with a condition, remove any existing items with null condition for the same product
    if (selectedCondition) {
      const nullConditionIndex = cart.items.findIndex(
        (item) =>
          item.productId.toString() === productId && !item.selectedCondition
      );
      if (nullConditionIndex !== -1) {
        console.log(
          'Removing existing item with null condition for product:',
          productId
        );
        cart.items.splice(nullConditionIndex, 1);
      }
    }

    if (existingItemIndex !== -1) {
      cart.items[existingItemIndex].quantity += quantity;
    } else {
      cart.items.push({
        productId,
        quantity,
        selectedCondition: selectedCondition || null,
      });
    }

    await cart.save();

    console.log(
      'AddToCart - Cart saved, items:',
      JSON.stringify(cart.items, null, 2)
    );

    const cartItemsPromises = cart.items.map(async (item) => {
      const product = await BuyProduct.findById(item.productId);

      if (!product) {
        return null;
      }

      // Calculate price including condition price
      const basePrice = product.pricing.discountedPrice || product.pricing.mrp;
      const conditionPrice = item.selectedCondition?.price || 0;
      const finalPrice = basePrice + conditionPrice;

      return {
        productId: item.productId,
        quantity: item.quantity,
        price: finalPrice,
        originalPrice: product.pricing.mrp + conditionPrice,
        subtotal: finalPrice * item.quantity,
        product: {
          brand: product.brand,
          name: product.name,
          model:
            product.model && product.model !== product.name
              ? product.model
              : null, // Only include model if different from name
          images: product.images,
          pricing: {
            mrp: product.pricing.mrp,
            discountedPrice: product.pricing.discountedPrice,
            discountPercent: product.pricing.discountPercent,
          },
          condition: item.selectedCondition ||
            product.conditionOptions?.[0] || {
              label: 'Good',
              price: 0,
            }, // Use selected condition or default
          variant: product.variants?.[0] || null, // Use first variant or null
          conditionOptions: product.conditionOptions,
          variants: product.variants,
        },
        isAvailable: product.availability.inStock,
        addedAt: item.addedAt,
      };
    });

    let cartItems = await Promise.all(cartItemsPromises);
    cartItems = cartItems.filter((item) => item !== null);

    const total = cartItems.reduce((sum, item) => sum + item.subtotal, 0);

    res.json({
      message: 'Product added to cart',
      cart: cartItems,
      total,
    });
  } catch (error) {
    console.error('Error adding to cart:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

export const getCart = async (req, res) => {
  try {
    const userId = req.user.id;

    const cart = await Cart.findOne({ user: userId });

    if (!cart || cart.items.length === 0) {
      return res.json({ cart: [], total: 0 });
    }

    const cartItemsPromises = cart.items.map(async (item) => {
      const product = await BuyProduct.findById(item.productId);

      if (!product) {
        return null;
      }

      // Calculate price including condition price
      const basePrice = product.pricing.discountedPrice || product.pricing.mrp;
      const conditionPrice = item.selectedCondition?.price || 0;
      const finalPrice = basePrice + conditionPrice;

      return {
        productId: item.productId,
        quantity: item.quantity,
        price: finalPrice,
        originalPrice: product.pricing.mrp + conditionPrice,
        subtotal: finalPrice * item.quantity,
        product: {
          brand: product.brand,
          name: product.name,
          model:
            product.model && product.model !== product.name
              ? product.model
              : null, // Only include model if different from name
          images: product.images,
          pricing: {
            mrp: product.pricing.mrp,
            discountedPrice: product.pricing.discountedPrice,
            discountPercent: product.pricing.discountPercent,
          },
          condition: item.selectedCondition ||
            product.conditionOptions?.[0] || {
              label: 'Good',
              price: 0,
            }, // Use selected condition or default
          variant: product.variants?.[0] || null, // Use first variant or null
          conditionOptions: product.conditionOptions,
          variants: product.variants,
        },
        isAvailable: product.availability.inStock,
        addedAt: item.addedAt,
      };
    });

    let cartItems = await Promise.all(cartItemsPromises);

    cartItems = cartItems.filter((item) => item !== null);

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

    const total = cartItems.reduce((sum, item) => sum + item.subtotal, 0);

    res.json({
      cart: cartItems,
      total,
    });
  } catch (error) {
    console.error('Error fetching cart:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

export const updateCartItem = async (req, res) => {
  try {
    const { itemId } = req.params;
    const productId = itemId;
    const { quantity } = req.body;
    const userId = req.user.id;

    const cart = await Cart.findOne({ user: userId });
    if (!cart) {
      return res.status(404).json({ message: 'Cart is empty' });
    }

    const itemIndex = cart.items.findIndex(
      (item) => item.productId.toString() === productId
    );

    if (itemIndex === -1) {
      return res.status(404).json({ message: 'Item not found in cart' });
    }

    const product = await BuyProduct.findById(productId);
    if (!product) {
      cart.items.splice(itemIndex, 1);
      await cart.save();
      return res.status(404).json({ message: 'Product no longer exists' });
    }

    if (!product.availability.inStock) {
      return res.status(400).json({ message: 'Product is not available' });
    }

    if (quantity <= 0) {
      cart.items.splice(itemIndex, 1);
    } else {
      cart.items[itemIndex].quantity = quantity;
    }

    await cart.save();

    res.json({
      message: 'Cart updated successfully',
      cart: cart.items,
    });
  } catch (error) {
    console.error('Error updating cart:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

export const removeCartItem = async (req, res) => {
  try {
    const { itemId } = req.params;
    const productId = itemId;
    const userId = req.user.id;

    const cart = await Cart.findOne({ user: userId });
    if (!cart) {
      return res.status(404).json({ message: 'Cart is empty' });
    }

    const itemIndex = cart.items.findIndex(
      (item) => item.productId.toString() === productId
    );

    if (itemIndex === -1) {
      return res.status(404).json({ message: 'Item not found in cart' });
    }

    cart.items.splice(itemIndex, 1);
    await cart.save();

    res.json({
      message: 'Item removed from cart',
      cart: cart.items,
    });
  } catch (error) {
    console.error('Error removing cart item:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

export const checkout = async (req, res) => {
  try {
    const { shippingAddress, paymentMethod } = req.body;
    const userId = req.user.id;

    const cart = await Cart.findOne({ user: userId });
    if (!cart || cart.items.length === 0) {
      return res.status(400).json({ message: 'Cart is empty' });
    }

    const partnerItems = {};

    for (const item of cart.items) {
      const product = await BuyProduct.findById(item.productId).populate(
        'partnerId',
        '_id shopName'
      );

      if (!product) {
        return res.status(404).json({
          message: 'One or more products in your cart are no longer available',
        });
      }

      if (!product.availability.inStock) {
        return res.status(400).json({
          message: `Product ${product.brand} ${product.name} is no longer available`,
        });
      }

      // Extract partnerId from the product - handle both populated and non-populated cases
      let partnerId = null;

      if (product.partnerId) {
        // If partnerId is populated (object with _id)
        if (typeof product.partnerId === 'object' && product.partnerId._id) {
          partnerId = product.partnerId._id.toString();
        }
        // If partnerId is just an ObjectId string
        else {
          partnerId = product.partnerId.toString();
        }
      }

      if (!partnerId) {
        return res.status(400).json({
          message: `Product ${product.brand} ${product.name} is not associated with any partner`,
        });
      }

      if (!partnerItems[partnerId]) {
        partnerItems[partnerId] = {
          partner: product.partnerId,
          items: [],
        };
      }

      partnerItems[partnerId].items.push({
        product: product._id,
        price: product.pricing.finalPrice,
        quantity: item.quantity,
      });
    }

    const orders = [];

    for (const partnerId in partnerItems) {
      const partnerData = partnerItems[partnerId];

      const totalAmount = partnerData.items.reduce(
        (sum, item) => sum + item.price * item.quantity,
        0
      );

      const commissionRate = 5;
      const commissionAmount = (totalAmount * commissionRate) / 100;

      const order = new Order({
        orderType: 'buy',
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
          status: 'pending',
        },
        shippingDetails: {
          address: shippingAddress,
          contactPhone: req.user.phone,
          deliveryMethod: 'Cashmitra Logistics',
        },
        status: 'pending',
        statusHistory: [
          {
            status: 'pending',
            note: 'Order created and pending partner confirmation',
          },
        ],
      });

      await order.save();
      orders.push(order);
    }

    cart.items = [];
    await cart.save();

    res.status(201).json({
      message: 'Orders created successfully',
      orders: orders.map((order) => ({
        _id: order._id,
        partner: order.partner,
        totalAmount: order.totalAmount,
        status: order.status,
      })),
    });
  } catch (error) {
    console.error('Error during checkout:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

export const getBuyOrderDetails = async (req, res) => {
  try {
    const order = await Order.findOne({
      _id: req.params.id,
      user: req.user._id,
      orderType: 'buy',
    })
      .populate('partner', 'shopName address phone')
      .populate(
        'items.product',
        'name brand model images pricing categoryId variants conditionOptions isActive'
      )
      .populate({
        path: 'items.inventory',
        populate: {
          path: 'product',
          select: 'name category brand model variant images pricing',
        },
      });

    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }

    res.json({ order });
  } catch (error) {
    console.error('Error fetching buy order:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

export const getUserBuyOrders = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    const orders = await Order.find({
      user: req.user._id,
      orderType: 'buy',
    })
      .populate('partner', 'shopName')
      .populate(
        'items.product',
        'name brand model images pricing categoryId variants conditionOptions isActive'
      )
      .populate('items.inventory', 'condition price')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    const total = await Order.countDocuments({
      user: req.user._id,
      orderType: 'buy',
    });

    res.json({
      orders,
      total,
      page,
      pages: Math.ceil(total / limit),
    });
  } catch (error) {
    console.error('Error fetching user buy orders:', error);
    res.status(500).json({ message: 'Server error' });
  }
};
