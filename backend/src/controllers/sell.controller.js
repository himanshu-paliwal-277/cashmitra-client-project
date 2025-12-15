import { validationResult } from 'express-validator';

import Category from '../models/category.model';
import { Order } from '../models/order.model';
import Partner from '../models/partner.model';
import Product from '../models/product.model';
import SellProduct from '../models/sellProduct.model';
import SellSuperCategory from '../models/sellSuperCategory.model';
import Transaction from '../models/transaction.model';
import Wallet from '../models/wallet.model';

const getProductCategories = async (req, res) => {
  try {
    const categories = await Category.find({ isActive: true })
      .populate('superCategory', 'name displayName image')
      .populate('parentCategory', 'name')
      .sort({ sortOrder: 1, name: 1 })
      .select(
        'name displayName description image icon superCategory parentCategory isActive sortOrder'
      );

    res.json({
      success: true,
      data: categories,
      count: categories.length,
    });
  } catch (error) {
    console.error('Error fetching categories:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

const getBrandsByCategory = async (req, res) => {
  try {
    const { category } = req.params;

    const superCategory = await SellSuperCategory.findOne({
      name: { $regex: new RegExp(`^${category}$`, 'i') },
      isActive: true,
    });

    if (!superCategory) {
      return res.status(404).json({ message: 'Category not found' });
    }

    const categories = await Category.find({
      superCategory: superCategory._id,
      isActive: true,
    })
      .select('name')
      .sort({ name: 1 });

    const brands = categories.map((cat) => cat.name);

    res.json({ brands });
  } catch (error) {
    console.error('Error fetching brands:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

const getSeriesByBrand = async (req, res) => {
  try {
    const { category, brand } = req.params;

    const series = await Product.distinct('series', { category, brand });

    res.json({ series });
  } catch (error) {
    console.error('Error fetching series:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

const getModelsBySeries = async (req, res) => {
  try {
    const { category, brand, series } = req.params;

    const models = await Product.distinct('model', { category, brand, series });

    res.json({ models });
  } catch (error) {
    console.error('Error fetching models:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

const getVariantsByModel = async (req, res) => {
  try {
    const { category, brand, series, model } = req.params;

    const products = await Product.find(
      { category, brand, series, model },
      'variant.ram variant.storage'
    );

    const variants = products.map((product) => ({
      ram: product.variant.ram,
      storage: product.variant.storage,
      _id: product._id,
    }));

    res.json({ variants });
  } catch (error) {
    console.error('Error fetching variants:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

const calculatePrice = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  try {
    const {
      productId,
      purchaseDate,
      screenCondition,
      bodyCondition,
      batteryHealth,
      functionalIssues,
      accessories = [],
      warrantyStatus = 'expired',
    } = req.body;

    const product = await Product.findById(productId);
    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }

    const purchaseDateTime = new Date(purchaseDate);
    const currentDate = new Date();
    const ageInDays = Math.floor(
      (currentDate - purchaseDateTime) / (1000 * 60 * 60 * 24)
    );
    const ageInMonths = ageInDays / 30.44;

    let depreciationPercentage;
    if (ageInMonths <= 6) {
      depreciationPercentage =
        ageInMonths * (product.depreciation.ratePerMonth * 1.5);
    } else if (ageInMonths <= 24) {
      depreciationPercentage =
        9 + (ageInMonths - 6) * product.depreciation.ratePerMonth;
    } else {
      depreciationPercentage =
        45 + (ageInMonths - 24) * (product.depreciation.ratePerMonth * 0.7);
    }

    if (depreciationPercentage > product.depreciation.maxDepreciation) {
      depreciationPercentage = product.depreciation.maxDepreciation;
    }

    const screenFactor =
      product.conditionFactors.screenCondition[screenCondition] / 100;
    const bodyFactor =
      product.conditionFactors.bodyCondition[bodyCondition] / 100;
    const batteryFactor =
      product.conditionFactors.batteryHealth[batteryHealth] / 100;
    const functionalFactor =
      product.conditionFactors.functionalIssues[functionalIssues] / 100;

    const weightedConditionFactor =
      screenFactor * 0.35 +
      batteryFactor * 0.35 +
      bodyFactor * 0.2 +
      functionalFactor * 0.1;

    const brandDemandFactors = {
      Apple: 1.15,
      Samsung: 1.1,
      OnePlus: 1.05,
      Google: 1.05,
      Xiaomi: 1.0,
      Realme: 0.95,
      Oppo: 0.95,
      Vivo: 0.95,
      Lenovo: 1.0,
      HP: 1.0,
      Dell: 1.05,
      Asus: 1.0,
      Acer: 0.95,
    };
    const marketDemandFactor = brandDemandFactors[product.brand] || 1.0;

    const currentMonth = currentDate.getMonth();
    let seasonalFactor = 1.0;
    if ([9, 10, 11].includes(currentMonth)) {
      seasonalFactor = 1.05;
    } else if ([3, 4, 5].includes(currentMonth)) {
      seasonalFactor = 0.98;
    }

    const accessoryBonus = accessories.length * 0.02;

    const warrantyBonus = warrantyStatus === 'active' ? 0.05 : 0;

    const storageValue = parseInt(
      product.variant.storage.replace(/[^0-9]/g, '')
    );
    let storageFactor = 1.0;
    if (storageValue >= 512) storageFactor = 1.05;
    else if (storageValue >= 256) storageFactor = 1.02;
    else if (storageValue <= 64) storageFactor = 0.95;

    // Calculate base depreciated price
    const depreciatedPrice =
      product.basePrice * (1 - depreciationPercentage / 100);

    // Apply all factors
    let finalPrice =
      depreciatedPrice *
      weightedConditionFactor *
      marketDemandFactor *
      seasonalFactor *
      storageFactor;

    // Add bonuses
    finalPrice = finalPrice * (1 + accessoryBonus + warrantyBonus);

    // Round to nearest 50 for better user experience
    finalPrice = Math.round(finalPrice / 50) * 50;

    // Ensure minimum price (10% of base price)
    const minimumPrice = product.basePrice * 0.1;
    if (finalPrice < minimumPrice) {
      finalPrice = minimumPrice;
    }

    // Calculate confidence score based on data quality
    const confidenceScore = Math.min(
      95,
      70 +
        (screenCondition !== 'unknown' ? 5 : 0) +
        (batteryHealth !== 'unknown' ? 5 : 0) +
        (functionalIssues !== 'unknown' ? 5 : 0) +
        (accessories.length > 0 ? 5 : 0) +
        (ageInMonths < 36 ? 5 : 0)
    );

    res.json({
      basePrice: product.basePrice,
      ageInMonths: Math.round(ageInMonths * 10) / 10,
      ageInDays,
      depreciationPercentage: Math.round(depreciationPercentage * 100) / 100,
      depreciatedPrice: Math.round(depreciatedPrice),
      factors: {
        conditionFactors: {
          screen: Math.round(screenFactor * 100),
          body: Math.round(bodyFactor * 100),
          battery: Math.round(batteryFactor * 100),
          functional: Math.round(functionalFactor * 100),
          weighted: Math.round(weightedConditionFactor * 100),
        },
        marketDemandFactor: Math.round(marketDemandFactor * 100),
        seasonalFactor: Math.round(seasonalFactor * 100),
        storageFactor: Math.round(storageFactor * 100),
        accessoryBonus: Math.round(accessoryBonus * 100),
        warrantyBonus: Math.round(warrantyBonus * 100),
      },
      finalPrice: Math.round(finalPrice),
      priceRange: {
        min: Math.round(finalPrice * 0.95),
        max: Math.round(finalPrice * 1.05),
      },
      confidenceScore,
      recommendations: generatePriceRecommendations(product, {
        screenCondition,
        bodyCondition,
        batteryHealth,
        functionalIssues,
        accessories,
        warrantyStatus,
      }),
      product: {
        category: product.category,
        brand: product.brand,
        series: product.series,
        model: product.model,
        variant: product.variant,
      },
    });
  } catch (error) {
    console.error('Error calculating price:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

const generatePriceRecommendations = (product, condition) => {
  const recommendations = [];

  if (
    condition.screenCondition === 'cracked' ||
    condition.screenCondition === 'majorScratches'
  ) {
    recommendations.push({
      type: 'repair',
      message: 'Consider screen repair to increase value by 15-25%',
      impact: 'high',
    });
  }

  if (condition.batteryHealth === 'below50') {
    recommendations.push({
      type: 'repair',
      message: 'Battery replacement could increase value by 10-15%',
      impact: 'medium',
    });
  }

  if (condition.accessories.length === 0) {
    recommendations.push({
      type: 'accessories',
      message: 'Include original charger and box to increase value by 5-10%',
      impact: 'low',
    });
  }

  if (
    condition.functionalIssues === 'major' ||
    condition.functionalIssues === 'notWorking'
  ) {
    recommendations.push({
      type: 'repair',
      message: 'Functional repairs are essential for better pricing',
      impact: 'critical',
    });
  }

  return recommendations;
};

const createSellOrder = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  try {
    const { productId, condition, price, paymentMethod, pickupAddress } =
      req.body;

    const product = await Product.findById(productId);
    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }

    const partnerShop = await Partner.findOne({
      'address.pincode': pickupAddress.pincode,
      isVerified: true,
    });

    if (!partnerShop) {
      return res
        .status(404)
        .json({ message: 'No partner shop available in your area' });
    }

    const commissionRate = 10;
    const commissionAmount = (price * commissionRate) / 100;

    const order = new Order({
      orderType: 'sell',
      user: req.user._id,
      partner: partnerShop._id,
      items: [
        {
          product: productId,
          condition,
          price,
          quantity: 1,
        },
      ],
      totalAmount: price,
      commission: {
        rate: commissionRate,
        amount: commissionAmount,
      },
      paymentDetails: {
        method: paymentMethod,
        status: 'pending',
      },
      shippingDetails: {
        address: pickupAddress,
        contactPhone: req.user.phone,
        deliveryMethod: 'Pickup',
      },
      status: 'pending',
      statusHistory: [
        {
          status: 'pending',
          note: 'Order created and assigned to partner shop',
        },
      ],
    });

    await order.save();

    const transaction = new Transaction({
      type: 'sell_order',
      amount: price,
      currency: 'INR',
      user: req.user._id,
      partner: partnerShop._id,
      order: order._id,
      paymentMethod,
      status: 'pending',
      metadata: {
        commission: {
          rate: commissionRate,
          amount: commissionAmount,
        },
        productDetails: {
          category: product.category,
          brand: product.brand,
          model: product.model,
          condition,
        },
      },
    });

    await transaction.save();

    res.status(201).json({
      message: 'Sell order created successfully',
      order: {
        _id: order._id,
        status: order.status,
        partnerShop: {
          name: partnerShop.shopName,
          address: partnerShop.address,
        },
        price,
        product: {
          category: product.category,
          brand: product.brand,
          model: product.model,
        },
      },
    });
  } catch (error) {
    console.error('Error creating sell order:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

const getSellOrderStatus = async (req, res) => {
  try {
    const order = await Order.findOne({
      _id: req.params.id,
      user: req.user._id,
      orderType: 'sell',
    })
      .populate('partner', 'shopName address phone')
      .populate('items.product', 'category brand series model variant');

    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }

    res.json({
      order: {
        _id: order._id,
        status: order.status,
        statusHistory: order.statusHistory,
        partnerShop: order.partner,
        price: order.totalAmount,
        paymentDetails: order.paymentDetails,
        product: order.items[0].product,
        condition: order.items[0].condition,
        createdAt: order.createdAt,
      },
    });
  } catch (error) {
    console.error('Error fetching sell order:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

const updateSellOrderStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status, note } = req.body;

    const order = await Order.findById(id).populate('partner user');
    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }

    order.status = status;
    order.statusHistory.push({
      status,
      note: note || `Order status updated to ${status}`,
      updatedBy: req.user._id,
    });

    if (status === 'completed') {
      const commissionAmount = order.commission.amount;

      let wallet = await Wallet.findOne({ partner: order.partner._id });
      if (!wallet) {
        wallet = new Wallet({
          partner: order.partner._id,
          balance: 0,
          transactions: [],
          payoutSettings: {
            method: 'bank_transfer',
            minimumAmount: 500,
          },
        });
      }

      wallet.balance += commissionAmount;
      wallet.transactions.push({
        type: 'commission_earned',
        amount: commissionAmount,
        description: `Commission from sell order #${order._id}`,
        order: order._id,
        date: new Date(),
      });

      await wallet.save();

      const commissionTransaction = new Transaction({
        type: 'commission',
        amount: commissionAmount,
        currency: 'INR',
        partner: order.partner._id,
        order: order._id,
        status: 'completed',
        metadata: {
          commissionRate: order.commission.rate,
          originalAmount: order.totalAmount,
          walletBalance: wallet.balance,
        },
      });

      await commissionTransaction.save();

      order.paymentDetails.status = 'completed';
    }

    await order.save();

    res.json({
      message: 'Order status updated successfully',
      order: {
        _id: order._id,
        status: order.status,
        commission: order.commission,
      },
    });
  } catch (error) {
    console.error('Error updating sell order status:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

const getPriceQuote = async (req, res) => {
  try {
    const { assessmentId } = req.params;

    let order;

    if (assessmentId.startsWith('assessment_')) {
      order = await Order.findOne({ assessmentId: assessmentId });
    } else {
      order = await Order.findById(assessmentId);
    }

    if (!order) {
      return res.status(404).json({ message: 'Assessment not found' });
    }

    res.json({
      priceQuote: {
        assessmentId: order._id,
        finalPrice: order.finalPrice || order.estimatedPrice,
        confidence: 95,
        validUntil: new Date(Date.now() + 24 * 60 * 60 * 1000),
        conditionSummary: {
          screen_condition: order.screenCondition || 'good',
          body_condition: order.bodyCondition || 'good',
          battery_health: order.batteryHealth || 'good',
          functional_issues: order.functionalIssues || 'none',
        },
        marketInsights: {
          demand: 'high',
          brandRetention: 'excellent',
          expectedSaleDays: '2-3',
        },
      },
      productDetails: {
        brand: {
          name: order.brand,
          logo: order.brand?.charAt(0).toUpperCase(),
          bgColor: '#007bff',
          textColor: '#ffffff',
        },
        model: {
          name: order.productName || order.model,
          year: new Date().getFullYear() - 1,
          specs: {
            storage: '128GB',
          },
        },
      },
    });
  } catch (error) {
    console.error('Error fetching price quote:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

const refreshPriceQuote = async (req, res) => {
  try {
    const { assessmentId } = req.params;

    let order;

    if (assessmentId.startsWith('assessment_')) {
      order = await Order.findOne({ assessmentId: assessmentId });
    } else {
      order = await Order.findById(assessmentId);
    }

    if (!order) {
      return res.status(404).json({ message: 'Assessment not found' });
    }

    const priceVariation = Math.random() * 0.1 - 0.05;
    const newPrice = Math.round(order.estimatedPrice * (1 + priceVariation));

    order.finalPrice = newPrice;
    order.updatedAt = new Date();
    await order.save();

    res.json({
      priceQuote: {
        assessmentId: order._id,
        finalPrice: newPrice,
        confidence: 95,
        validUntil: new Date(Date.now() + 24 * 60 * 60 * 1000),
        conditionSummary: {
          screen_condition: order.screenCondition || 'good',
          body_condition: order.bodyCondition || 'good',
          battery_health: order.batteryHealth || 'good',
          functional_issues: order.functionalIssues || 'none',
        },
        marketInsights: {
          demand: 'high',
          brandRetention: 'excellent',
          expectedSaleDays: '2-3',
        },
      },
    });
  } catch (error) {
    console.error('Error refreshing price quote:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

const submitAssessment = async (req, res) => {
  try {
    let { category, brand, model, answers, productDetails } = req.body;

    if (typeof category === 'object' && category.category) {
      const categoryObj = category;
      category = categoryObj.category;
      brand = brand || categoryObj.brand;
      model = model || categoryObj.model;
    }

    const assessmentId = `assessment_${Date.now()}_${Math.random()
      .toString(36)
      .substr(2, 9)}`;

    let basePrice = 15000;

    const brandMultipliers = {
      Apple: 1.5,
      Samsung: 1.3,
      OnePlus: 1.2,
      Google: 1.2,
      Xiaomi: 1.0,
      redmin: 1.0,
      Realme: 0.9,
      Oppo: 0.9,
      Vivo: 0.9,
    };

    const brandKey = Object.keys(brandMultipliers).find(
      (key) => key.toLowerCase() === brand.toLowerCase()
    );

    if (brandKey) {
      basePrice *= brandMultipliers[brandKey];
    }

    let conditionMultiplier = 1.0;

    if (answers.screen_condition) {
      const screenMultipliers = {
        excellent: 1.0,
        good: 0.9,
        fair: 0.7,
        poor: 0.5,
      };
      conditionMultiplier *= screenMultipliers[answers.screen_condition] || 0.8;
    }

    if (answers.body_condition) {
      const bodyMultipliers = {
        excellent: 1.0,
        good: 0.95,
        fair: 0.8,
        poor: 0.6,
      };
      conditionMultiplier *= bodyMultipliers[answers.body_condition] || 0.8;
    }

    if (answers.functionality) {
      const functionalMultipliers = {
        excellent: 1.0,
        good: 0.9,
        fair: 0.7,
        poor: 0.5,
      };
      conditionMultiplier *=
        functionalMultipliers[answers.functionality] || 0.8;
    }

    if (answers.accessories) {
      const accessoryMultipliers = {
        complete: 1.0,
        partial: 0.9,
        none: 0.8,
      };
      conditionMultiplier *= accessoryMultipliers[answers.accessories] || 0.8;
    }

    const finalPrice = Math.round(basePrice * conditionMultiplier);

    const order = new Order({
      assessmentId,
      orderType: 'sell',
      user: req.user ? req.user._id : null,
      partner: null,
      items: [
        {
          product: null,
          condition: {
            screenCondition: answers.screen_condition,
            bodyCondition: answers.body_condition,
            batteryHealth: answers.battery_health || 'good',
            functionalIssues: answers.functionality,
          },
          price: finalPrice,
          quantity: 1,
        },
      ],
      totalAmount: finalPrice,
      commission: {
        rate: 0.05,
        amount: Math.round(finalPrice * 0.05),
      },
      paymentDetails: {
        method: 'UPI',
        status: 'pending',
      },
      status: 'pending',
      statusHistory: [
        {
          status: 'pending',
          timestamp: new Date(),
          note: 'Assessment completed, awaiting confirmation',
        },
      ],
      notes: `Assessment for ${brand} ${model} - Category: ${category}`,
    });

    await order.save();

    res.json({
      success: true,
      assessmentId,
      priceQuote: {
        basePrice: Math.round(basePrice),
        finalPrice,
        conditionMultiplier: Math.round(conditionMultiplier * 100) / 100,
        breakdown: {
          screen_condition: answers.screen_condition,
          body_condition: answers.body_condition,
          functionality: answers.functionality,
          accessories: answers.accessories,
        },
        validUntil: new Date(Date.now() + 24 * 60 * 60 * 1000),
        marketInsights: {
          demand: 'high',
          brandRetention:
            brandKey && brandMultipliers[brandKey] > 1.2 ? 'excellent' : 'good',
          expectedSaleDays: '2-3',
        },
      },
      deviceInfo: {
        category,
        brand,
        model,
        ...productDetails,
      },
    });
  } catch (error) {
    console.error('Error submitting assessment:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

const findProductsByModel = async (req, res) => {
  try {
    const { category, brand, model } = req.query;

    const query = { status: 'active' };

    if (category) {
      const superCategory = await SellSuperCategory.findOne({
        name: { $regex: new RegExp(`^${category}$`, 'i') },
        isActive: true,
      });

      if (superCategory) {
        const categories = await Category.find({
          superCategory: superCategory._id,
          isActive: true,
        });

        const categoryIds = categories.map((cat) => cat._id);
        query.categoryId = { $in: categoryIds };
      }
    }

    if (brand) {
      const brandCategory = await Category.findOne({
        name: { $regex: new RegExp(`^${brand}$`, 'i') },
        isActive: true,
      });

      if (brandCategory) {
        query.categoryId = brandCategory._id;
      }
    }

    if (model) {
      query.name = { $regex: model, $options: 'i' };
    }

    const products = await SellProduct.find(query)
      .populate('categoryId', 'name')
      .select('_id name images variants categoryId')
      .sort({ name: 1 });

    res.json({
      success: true,
      data: products,
      count: products.length,
    });
  } catch (error) {
    console.error('Error finding products:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
    });
  }
};

export default {
  getProductCategories,
  getBrandsByCategory,
  getSeriesByBrand,
  getModelsBySeries,
  getVariantsByModel,
  calculatePrice,
  createSellOrder,
  getSellOrderStatus,
  updateSellOrderStatus,
  getPriceQuote,
  refreshPriceQuote,
  submitAssessment,
  findProductsByModel,
};
