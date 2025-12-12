const mongoose = require('mongoose');

const pricingSchema = new mongoose.Schema(
  {
    product: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Product',
      required: true,
    },
    basePrice: {
      type: Number,
      required: true,
      min: 0,
    },
    conditions: {
      excellent: {
        percentage: {
          type: Number,
          default: 100,
          min: 0,
          max: 100,
        },
        price: Number,
      },
      good: {
        percentage: {
          type: Number,
          default: 85,
          min: 0,
          max: 100,
        },
        price: Number,
      },
      fair: {
        percentage: {
          type: Number,
          default: 70,
          min: 0,
          max: 100,
        },
        price: Number,
      },
      poor: {
        percentage: {
          type: Number,
          default: 50,
          min: 0,
          max: 100,
        },
        price: Number,
      },
    },
    marketAdjustments: {
      demandMultiplier: {
        type: Number,
        default: 1.0,
        min: 0.1,
        max: 3.0,
      },
      seasonalAdjustment: {
        type: Number,
        default: 0,
        min: -50,
        max: 50,
      },
      competitorPricing: {
        type: Number,
        min: 0,
      },
    },
    priceHistory: [
      {
        date: {
          type: Date,
          default: Date.now,
        },
        basePrice: Number,
        conditions: {
          excellent: { percentage: Number, price: Number },
          good: { percentage: Number, price: Number },
          fair: { percentage: Number, price: Number },
          poor: { percentage: Number, price: Number },
        },
        reason: String,
        updatedBy: {
          type: mongoose.Schema.Types.ObjectId,
          ref: 'User',
        },
      },
    ],
    isActive: {
      type: Boolean,
      default: true,
    },
    effectiveFrom: {
      type: Date,
      default: Date.now,
    },
    effectiveTo: {
      type: Date,
    },
    updatedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

// Indexes
pricingSchema.index({ product: 1 });
pricingSchema.index({ isActive: 1 });
pricingSchema.index({ effectiveFrom: 1, effectiveTo: 1 });
pricingSchema.index({ updatedBy: 1 });

// Pre-save middleware to calculate condition prices
pricingSchema.pre('save', function (next) {
  if (this.isModified('basePrice') || this.isModified('conditions')) {
    this.conditions.excellent.price = Math.round(
      this.basePrice * (this.conditions.excellent.percentage / 100)
    );
    this.conditions.good.price = Math.round(
      this.basePrice * (this.conditions.good.percentage / 100)
    );
    this.conditions.fair.price = Math.round(
      this.basePrice * (this.conditions.fair.percentage / 100)
    );
    this.conditions.poor.price = Math.round(
      this.basePrice * (this.conditions.poor.percentage / 100)
    );
  }
  next();
});

// Method to get price for specific condition
pricingSchema.methods.getPriceForCondition = function (condition) {
  const conditionKey = condition.toLowerCase();
  if (this.conditions[conditionKey]) {
    return this.conditions[conditionKey].price;
  }
  return this.basePrice;
};

// Method to calculate final price with market adjustments
pricingSchema.methods.calculateFinalPrice = function (condition) {
  let basePrice = this.getPriceForCondition(condition);

  // Apply demand multiplier
  basePrice *= this.marketAdjustments.demandMultiplier;

  // Apply seasonal adjustment
  basePrice += (basePrice * this.marketAdjustments.seasonalAdjustment) / 100;

  return Math.round(basePrice);
};

// Static method to get active pricing for product
pricingSchema.statics.getActivePricing = function (productId) {
  return this.findOne({
    product: productId,
    isActive: true,
    effectiveFrom: { $lte: new Date() },
    $or: [{ effectiveTo: { $gte: new Date() } }, { effectiveTo: null }],
  }).populate('product', 'name brand model');
};

module.exports = mongoose.model('Pricing', pricingSchema);
