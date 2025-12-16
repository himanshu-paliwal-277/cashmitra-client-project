import mongoose from 'mongoose';

const sellAccessorySchema = new mongoose.Schema(
  {
    categoryId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Category',
      required: [true, 'Category ID is required'],
    },
    key: {
      type: String,
      required: [true, 'Accessory key is required'],
      trim: true,
    },
    title: {
      type: String,
      required: [true, 'Accessory title is required'],
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

sellAccessorySchema.index({ categoryId: 1, key: 1 }, { unique: true });

sellAccessorySchema.index({ categoryId: 1, order: 1 });

sellAccessorySchema.index({ categoryId: 1, isActive: 1 });

sellAccessorySchema.statics.getActiveForCategory = function (categoryId) {
  return this.find({
    categoryId,
    isActive: true,
  }).sort({ order: 1 });
};

export const SellAccessory = mongoose.model('SellAccessory', sellAccessorySchema);


