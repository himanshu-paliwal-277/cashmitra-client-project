import mongoose from 'mongoose';

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

sellDefectSchema.index({ categoryId: 1, key: 1 }, { unique: true });

sellDefectSchema.index({ categoryId: 1, section: 1, order: 1 });

sellDefectSchema.index({ categoryId: 1, isActive: 1 });

sellDefectSchema.statics.getForCategory = function (categoryId) {
  const query = {
    categoryId,
    isActive: true,
  };

  return this.find(query).sort({ section: 1, order: 1 });
};

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

sellDefectSchema.statics.getForVariants = async function (
  productId
  // variantIds = []
) {
  const SellProduct = require('./sellProduct.model');

  const product = await SellProduct.findById(productId).select('categoryId');
  if (!product) {
    return [];
  }

  return this.getForCategory(product.categoryId);
};

sellDefectSchema.statics.getGroupedByCategory = async function (
  productId
  // variantIds = []
) {
  const SellProduct = require('./sellProduct.model');

  const product = await SellProduct.findById(productId).select('categoryId');
  if (!product) {
    return [];
  }

  return this.getGroupedBySection(product.categoryId);
};

export const SellDefect = mongoose.model('SellDefect', sellDefectSchema);
