import mongoose from 'mongoose';

import { calculateCommissionForOrder } from '../controllers/commissionSettings.controller.js';
import { Partner } from '../models/partner.model.js';
import { Transaction } from '../models/transaction.model.js';

/**
 * Apply commission to partner's balance when order is accepted
 * @param {string} partnerId - Partner ID
 * @param {number} orderValue - Order value
 * @param {string} category - Product category (mobile, tablet, laptop, accessories)
 * @param {string} orderType - Order type (buy, sell)
 * @param {string} orderId - Order ID for reference
 * @param {string} orderModel - Order model name ('Order' or 'SellOrder')
 * @returns {Object} Commission details
 */
export const applyCommissionToPartner = async (
  partnerId,
  orderValue,
  category,
  orderType,
  orderId,
  orderModel = 'Order'
) => {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    // Calculate commission
    const commissionData = await calculateCommissionForOrder(
      orderValue,
      category,
      orderType,
      partnerId
    );

    // Get partner
    const partner = await Partner.findById(partnerId).session(session);
    if (!partner) {
      throw new Error('Partner not found');
    }

    // Add commission to partner's balance
    const oldBalance = partner.wallet.commissionBalance;
    partner.wallet.commissionBalance += commissionData.amount;

    // Add transaction to partner's wallet
    partner.wallet.transactions.push({
      type: 'debit',
      amount: commissionData.amount,
      description: `Commission charge for ${orderType} order - ${category} (${commissionData.rate}%)`,
      timestamp: new Date(),
      reference: orderId,
      referenceModel: orderModel,
      transactionCategory: 'commission',
    });

    await partner.save({ session });

    // Create Transaction record
    const transaction = await Transaction.create(
      [
        {
          transactionType: 'commission_charge',
          amount: commissionData.amount,
          partner: partnerId,
          order: orderModel === 'Order' ? orderId : undefined,
          paymentMethod: 'System',
          status: 'completed',
          description: `Commission charge for ${orderType} order - ${category} (${commissionData.rate}%)`,
          metadata: {
            orderType,
            category,
            commissionRate: commissionData.rate,
            orderValue,
            orderId,
            orderModel,
            previousBalance: oldBalance,
            newBalance: partner.wallet.commissionBalance,
            appliedAt: new Date(),
          },
        },
      ],
      { session }
    );

    await session.commitTransaction();

    console.log(`✅ Commission applied to partner ${partnerId}:`, {
      orderType,
      category,
      orderValue,
      commissionRate: commissionData.rate,
      commissionAmount: commissionData.amount,
      previousBalance: oldBalance,
      newBalance: partner.wallet.commissionBalance,
    });

    return {
      success: true,
      commission: commissionData,
      transactionId: transaction[0]._id,
      previousBalance: oldBalance,
      newBalance: partner.wallet.commissionBalance,
    };
  } catch (error) {
    await session.abortTransaction();
    console.error('Apply commission error:', error);
    throw error;
  } finally {
    session.endSession();
  }
};

/**
 * Rollback commission when order is cancelled or rejected
 * @param {string} partnerId - Partner ID
 * @param {number} commissionAmount - Commission amount to rollback
 * @param {string} orderId - Order ID for reference
 * @param {string} orderModel - Order model name ('Order' or 'SellOrder')
 * @param {string} reason - Reason for rollback
 * @returns {Object} Rollback details
 */
export const rollbackCommissionFromPartner = async (
  partnerId,
  commissionAmount,
  orderId,
  orderModel = 'Order',
  reason = 'Order cancelled'
) => {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    // Get partner
    const partner = await Partner.findById(partnerId).session(session);
    if (!partner) {
      throw new Error('Partner not found');
    }

    // Check if partner has sufficient commission balance
    if (partner.wallet.commissionBalance < commissionAmount) {
      console.warn(
        `Partner ${partnerId} has insufficient commission balance for rollback. Current: ${partner.wallet.commissionBalance}, Required: ${commissionAmount}`
      );
      // Still proceed with rollback but set balance to 0 if it goes negative
    }

    // Subtract commission from partner's balance
    const oldBalance = partner.wallet.commissionBalance;
    partner.wallet.commissionBalance = Math.max(
      0,
      partner.wallet.commissionBalance - commissionAmount
    );

    // Add rollback transaction to partner's wallet
    partner.wallet.transactions.push({
      type: 'credit',
      amount: commissionAmount,
      description: `Commission rollback - ${reason}`,
      timestamp: new Date(),
      reference: orderId,
      referenceModel: orderModel,
      transactionCategory: 'commission',
    });

    await partner.save({ session });

    // Create Transaction record
    const transaction = await Transaction.create(
      [
        {
          transactionType: 'commission_rollback',
          amount: -commissionAmount, // Negative amount for rollback
          partner: partnerId,
          order: orderModel === 'Order' ? orderId : undefined,
          paymentMethod: 'System',
          status: 'completed',
          description: `Commission rollback - ${reason}`,
          metadata: {
            orderId,
            orderModel,
            reason,
            rollbackAmount: commissionAmount,
            previousBalance: oldBalance,
            newBalance: partner.wallet.commissionBalance,
            rolledBackAt: new Date(),
          },
        },
      ],
      { session }
    );

    await session.commitTransaction();

    console.log(`✅ Commission rolled back for partner ${partnerId}:`, {
      reason,
      rollbackAmount: commissionAmount,
      previousBalance: oldBalance,
      newBalance: partner.wallet.commissionBalance,
    });

    return {
      success: true,
      rollbackAmount: commissionAmount,
      transactionId: transaction[0]._id,
      previousBalance: oldBalance,
      newBalance: partner.wallet.commissionBalance,
    };
  } catch (error) {
    await session.abortTransaction();
    console.error('Rollback commission error:', error);
    throw error;
  } finally {
    session.endSession();
  }
};

/**
 * Get category from product or order data
 * @param {Object} productData - Product data containing category information
 * @returns {string} Category (mobile, tablet, laptop, accessories)
 */
export const getCategoryFromProduct = (productData) => {
  if (!productData) return 'accessories'; // Default fallback

  // Check if category is directly available
  if (productData.category) {
    const category = productData.category.toLowerCase();
    if (['mobile', 'tablet', 'laptop', 'accessories'].includes(category)) {
      return category;
    }
  }

  // Check superCategory (the proper way)
  if (productData.categoryId && productData.categoryId.superCategory) {
    const superCategoryName =
      productData.categoryId.superCategory.name.toLowerCase();
    const superCategorySlug =
      productData.categoryId.superCategory.slug.toLowerCase();

    if (
      superCategoryName.includes('mobile') ||
      superCategorySlug === 'mobile'
    ) {
      return 'mobile';
    } else if (
      superCategoryName.includes('tablet') ||
      superCategorySlug === 'tablet'
    ) {
      return 'tablet';
    } else if (
      superCategoryName.includes('laptop') ||
      superCategorySlug === 'laptops'
    ) {
      return 'laptop';
    }
  }

  // Fallback: check categoryId name (for backward compatibility)
  if (productData.categoryId && productData.categoryId.name) {
    const categoryName = productData.categoryId.name.toLowerCase();
    if (categoryName.includes('mobile') || categoryName.includes('phone')) {
      return 'mobile';
    }
    if (categoryName.includes('tablet') || categoryName.includes('ipad')) {
      return 'tablet';
    }
    if (categoryName.includes('laptop') || categoryName.includes('computer')) {
      return 'laptop';
    }
  }

  // Final fallback: check product name/brand for category hints
  if (productData.name || productData.brand) {
    const productName = (productData.name || '').toLowerCase();
    const brandName = (productData.brand || '').toLowerCase();
    const combinedText = `${productName} ${brandName}`;

    if (
      combinedText.includes('iphone') ||
      combinedText.includes('samsung') ||
      combinedText.includes('mobile') ||
      combinedText.includes('phone')
    ) {
      return 'mobile';
    }
    if (
      combinedText.includes('ipad') ||
      combinedText.includes('tablet') ||
      combinedText.includes('tab')
    ) {
      return 'tablet';
    }
    if (
      combinedText.includes('laptop') ||
      combinedText.includes('macbook') ||
      combinedText.includes('computer')
    ) {
      return 'laptop';
    }
  }

  // Default to accessories if category cannot be determined
  return 'accessories';
};

/**
 * Mark commission as applied in order
 * @param {Object} order - Order object
 */
export const markCommissionAsApplied = async (order) => {
  try {
    order.commission.isApplied = true;
    order.commission.appliedAt = new Date();
    await order.save();

    console.log(`✅ Commission marked as applied for order ${order._id}`);
  } catch (error) {
    console.error('Mark commission as applied error:', error);
    // Don't throw error as this is not critical
  }
};

/**
 * Calculate commission for multiple items with different categories
 * @param {Array} items - Array of order items with product data
 * @param {string} orderType - Order type (buy, sell)
 * @param {string} partnerId - Partner ID
 * @returns {Object} Commission breakdown and totals
 */
export const calculateCommissionForItems = async (
  items,
  orderType,
  partnerId
) => {
  try {
    const commissionBreakdown = {};
    let totalCommissionAmount = 0;
    let totalOrderValue = 0;

    // Calculate commission for each item
    for (const item of items) {
      const category = getCategoryFromProduct(item.product);
      const itemValue = item.price * item.quantity;

      // Get commission rate for this category
      const commissionData = await calculateCommissionForOrder(
        itemValue,
        category,
        orderType,
        partnerId
      );

      // Add to breakdown
      if (!commissionBreakdown[category]) {
        commissionBreakdown[category] = {
          category,
          rate: commissionData.rate,
          amount: 0,
          itemCount: 0,
          itemValue: 0,
        };
      }

      commissionBreakdown[category].amount += commissionData.amount;
      commissionBreakdown[category].itemCount += item.quantity;
      commissionBreakdown[category].itemValue += itemValue;

      totalCommissionAmount += commissionData.amount;
      totalOrderValue += itemValue;

      // Add commission to item
      item.commission = {
        rate: commissionData.rate,
        amount: Math.round(commissionData.amount), // Round individual item commission
        category: commissionData.category,
      };
    }

    // Round breakdown amounts to whole numbers
    Object.values(commissionBreakdown).forEach((breakdown) => {
      breakdown.amount = Math.round(breakdown.amount);
    });

    // Calculate weighted average rate
    const totalRate =
      totalOrderValue > 0 ? (totalCommissionAmount / totalOrderValue) * 100 : 0;

    return {
      totalRate: Math.round(totalRate * 100) / 100, // Keep rate precision for display
      totalAmount: Math.round(totalCommissionAmount), // Round to whole number
      breakdown: Object.values(commissionBreakdown),
      items, // Return items with commission data
    };
  } catch (error) {
    console.error('Calculate commission for items error:', error);
    throw error;
  }
};

/**
 * Apply commission to partner's balance for mixed-category order
 * @param {string} partnerId - Partner ID
 * @param {Object} commissionData - Commission data from calculateCommissionForItems
 * @param {string} orderId - Order ID for reference
 * @param {string} orderModel - Order model name ('Order' or 'SellOrder')
 * @returns {Object} Commission details
 */
export const applyCommissionForItems = async (
  partnerId,
  commissionData,
  orderId,
  orderModel = 'Order'
) => {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    // Get partner
    const partner = await Partner.findById(partnerId).session(session);
    if (!partner) {
      throw new Error('Partner not found');
    }

    // Add commission to partner's balance
    const oldBalance = partner.wallet.commissionBalance;
    partner.wallet.commissionBalance += commissionData.totalAmount;

    // Create detailed description
    const categoryBreakdown = commissionData.breakdown
      .map((b) => `${b.category}: ₹${b.amount} (${b.rate}%)`)
      .join(', ');

    // Add transaction to partner's wallet
    partner.wallet.transactions.push({
      type: 'debit',
      amount: commissionData.totalAmount,
      description: `Commission charge - ${categoryBreakdown}`,
      timestamp: new Date(),
      reference: orderId,
      referenceModel: orderModel,
      transactionCategory: 'commission',
    });

    await partner.save({ session });

    // Create Transaction record
    const transaction = await Transaction.create(
      [
        {
          transactionType: 'commission_charge',
          amount: commissionData.totalAmount,
          partner: partnerId,
          order: orderModel === 'Order' ? orderId : undefined,
          paymentMethod: 'System',
          status: 'completed',
          description: `Commission charge - Multi-category order`,
          metadata: {
            orderType: orderModel === 'Order' ? 'buy' : 'sell',
            commissionBreakdown: commissionData.breakdown,
            totalRate: commissionData.totalRate,
            totalAmount: commissionData.totalAmount,
            orderId,
            orderModel,
            previousBalance: oldBalance,
            newBalance: partner.wallet.commissionBalance,
            appliedAt: new Date(),
          },
        },
      ],
      { session }
    );

    await session.commitTransaction();

    console.log(
      `✅ Multi-category commission applied to partner ${partnerId}:`,
      {
        totalAmount: commissionData.totalAmount,
        totalRate: commissionData.totalRate,
        breakdown: commissionData.breakdown,
        previousBalance: oldBalance,
        newBalance: partner.wallet.commissionBalance,
      }
    );

    return {
      success: true,
      commission: commissionData,
      transactionId: transaction[0]._id,
      previousBalance: oldBalance,
      newBalance: partner.wallet.commissionBalance,
    };
  } catch (error) {
    await session.abortTransaction();
    console.error('Apply commission for items error:', error);
    throw error;
  } finally {
    session.endSession();
  }
};

/**
 * Rollback commission for mixed-category order
 * @param {string} partnerId - Partner ID
 * @param {number} totalCommissionAmount - Total commission amount to rollback
 * @param {string} orderId - Order ID for reference
 * @param {string} orderModel - Order model name ('Order' or 'SellOrder')
 * @param {string} reason - Reason for rollback
 * @returns {Object} Rollback details
 */
export const rollbackCommissionForItems = async (
  partnerId,
  totalCommissionAmount,
  orderId,
  orderModel = 'Order',
  reason = 'Order cancelled'
) => {
  return await rollbackCommissionFromPartner(
    partnerId,
    totalCommissionAmount,
    orderId,
    orderModel,
    reason
  );
};
