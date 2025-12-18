import mongoose from 'mongoose';

const sellConfigSchema = new mongoose.Schema(
  {
    productId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'SellProduct',
      required: [true, 'Product ID is required'],
      unique: true,
    },
    steps: [
      {
        key: {
          type: String,
          enum: ['variant', 'questions', 'defects', 'accessories', 'summary'],
          required: [true, 'Step key is required'],
        },
        title: {
          type: String,
          required: [true, 'Step title is required'],
          trim: true,
        },
        order: {
          type: Number,
          required: [true, 'Step order is required'],
          min: [0, 'Step order cannot be negative'],
        },
      },
    ],
    rules: {
      roundToNearest: {
        type: Number,
        default: 10,
        min: [1, 'Round to nearest must be at least 1'],
      },
      floorPrice: {
        type: Number,
        default: 0,
        min: [0, 'Floor price cannot be negative'],
      },
      capPrice: {
        type: Number,
        min: [0, 'Cap price cannot be negative'],
      },
      minPercent: {
        type: Number,
        default: -90,
        min: [-100, 'Min percent cannot be less than -100'],
        max: [100, 'Min percent cannot be more than 100'],
      },
      maxPercent: {
        type: Number,
        default: 50,
        min: [-100, 'Max percent cannot be less than -100'],
        max: [100, 'Max percent cannot be more than 100'],
      },
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

sellConfigSchema.index({ productId: 1 }, { unique: true });

sellConfigSchema.virtual('orderedSteps').get(function () {
  return this.steps.sort((a, b) => a.order - b.order);
});

sellConfigSchema.statics.getDefaultConfig = function () {
  return {
    steps: [
      { key: 'variant', title: 'Select Variant', order: 1 },
      { key: 'questions', title: 'Answer Questions', order: 2 },
      { key: 'defects', title: 'Select Defects', order: 3 },
      { key: 'accessories', title: 'Select Accessories', order: 4 },
      { key: 'summary', title: 'Review & Confirm', order: 5 },
    ],
    rules: {
      roundToNearest: 10,
      floorPrice: 0,
      minPercent: -90,
      maxPercent: 50,
    },
  };
};

sellConfigSchema.statics.createDefaultForProduct = function (
  productId,
  createdBy
) {
  const defaultConfig = this.getDefaultConfig();
  return this.create({
    productId,
    ...defaultConfig,
    createdBy,
  });
};

sellConfigSchema.methods.applyPricingRules = function (
  basePrice,
  calculatedPrice
) {
  const { rules } = this;
  let finalPrice = calculatedPrice;

  if (rules.minPercent !== undefined) {
    const minPrice = basePrice * (1 + rules.minPercent / 100);
    finalPrice = Math.max(finalPrice, minPrice);
  }

  if (rules.maxPercent !== undefined) {
    const maxPrice = basePrice * (1 + rules.maxPercent / 100);
    finalPrice = Math.min(finalPrice, maxPrice);
  }

  if (rules.floorPrice !== undefined) {
    finalPrice = Math.max(finalPrice, rules.floorPrice);
  }

  if (rules.capPrice !== undefined) {
    finalPrice = Math.min(finalPrice, rules.capPrice);
  }

  if (rules.roundToNearest && rules.roundToNearest > 0) {
    finalPrice =
      Math.round(finalPrice / rules.roundToNearest) * rules.roundToNearest;
  }

  return Math.max(0, finalPrice);
};

export const SellConfig = mongoose.model('SellConfig', sellConfigSchema);
