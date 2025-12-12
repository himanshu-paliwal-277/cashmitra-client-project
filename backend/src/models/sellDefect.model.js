const mongoose = require('mongoose');

const sellDefectSchema = new mongoose.Schema(
  {
    categoryId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Category',
      required: [true, 'Category ID is required'],
    },
    section: {
      type: String,
      enum: [
        'screen',
        'body',
        'functional',
        'battery',
        'camera',
        'sensor',
        'buttons',
        'others',
      ],
      required: [true, 'Defect section is required'],
    },
    key: {
      type: String,
      required: [true, 'Defect key is required'],
      trim: true,
    },
    title: {
      type: String,
      required: [true, 'Defect title is required'],
      trim: true,
    },
    icon: {
      type: String,
      trim: true,
    },
    delta: {
      type: {
        type: String,
        enum: ['abs', 'percent'],
        required: [true, 'Delta type is required'],
      },
      sign: {
        type: String,
        enum: ['+', '-'],
        required: [true, 'Delta sign is required'],
      },
      value: {
        type: Number,
        required: [true, 'Delta value is required'],
        min: [0, 'Delta value cannot be negative'],
      },
    },
    order: {
      type: Number,
      required: [true, 'Order is required'],
      min: [0, 'Order cannot be negative'],
    },
    isActive: {
      type: Boolean,
      default: true,
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

// Compound index for unique key per category
sellDefectSchema.index({ categoryId: 1, key: 1 }, { unique: true });

// Index for querying by category and section
sellDefectSchema.index({ categoryId: 1, section: 1, order: 1 });

// Index for active defects
sellDefectSchema.index({ categoryId: 1, isActive: 1 });

// Method to get defects for specific category
sellDefectSchema.statics.getForCategory = function (categoryId) {
  const query = {
    categoryId,
    isActive: true,
  };

  return this.find(query).sort({ section: 1, order: 1 });
};

// Method to get defects grouped by section
sellDefectSchema.statics.getGroupedBySection = function (categoryId) {
  return this.aggregate([
    {
      $match: {
        categoryId: new mongoose.Types.ObjectId(categoryId),
        isActive: true,
      },
    },
    {
      $sort: { section: 1, order: 1 },
    },
    {
      $group: {
        _id: '$section',
        defects: { $push: '$$ROOT' },
      },
    },
    {
      $sort: { _id: 1 },
    },
  ]);
};

// Method to get defects for specific product variants
// Since defects are linked to categories, we need to get the product's category first
sellDefectSchema.statics.getForVariants = async function (
  productId,
  variantIds = []
) {
  const SellProduct = require('./sellProduct.model');

  // Get the product to find its categoryId
  const product = await SellProduct.findById(productId).select('categoryId');
  if (!product) {
    return [];
  }

  // Get defects for the product's category
  return this.getForCategory(product.categoryId);
};

// Method to get defects grouped by category for specific product variants
sellDefectSchema.statics.getGroupedByCategory = async function (
  productId,
  variantIds = []
) {
  const SellProduct = require('./sellProduct.model');

  // Get the product to find its categoryId
  const product = await SellProduct.findById(productId).select('categoryId');
  if (!product) {
    return [];
  }

  // Get defects grouped by section for the product's category
  return this.getGroupedBySection(product.categoryId);
};

const SellDefect = mongoose.model('SellDefect', sellDefectSchema);

module.exports = SellDefect;
