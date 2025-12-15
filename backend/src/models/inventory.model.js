const mongoose = require('mongoose');

const inventorySchema = new mongoose.Schema(
  {
    partner: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Partner',
      required: true,
    },
    productModel: {
      type: String,
      required: true,
      enum: ['Product', 'BuyProduct'],
      default: 'Product',
    },
    product: {
      type: mongoose.Schema.Types.ObjectId,
      refPath: 'productModel',
      required: true,
    },
    condition: {
      type: String,
      enum: ['New', 'Like New', 'Good', 'Fair', 'Refurbished'],
      required: true,
    },
    price: {
      type: Number,
      required: true,
    },
    originalPrice: {
      type: Number,
      required: true,
    },
    quantity: {
      type: Number,
      required: true,
      default: 1,
      min: 0,
    },
    images: [String],
    description: String,
    warranty: {
      available: {
        type: Boolean,
        default: false,
      },
      durationMonths: {
        type: Number,
        default: 0,
      },
      description: String,
    },
    additionalSpecifications: {
      type: Map,
      of: String,
    },
    isAvailable: {
      type: Boolean,
      default: true,
    },
    purchaseDate: Date,
    listedDate: {
      type: Date,
      default: Date.now,
    },
  },
  { timestamps: true }
);

inventorySchema.index({ partner: 1 });
inventorySchema.index({ product: 1 });
inventorySchema.index({ condition: 1, price: 1 });
inventorySchema.index({ isAvailable: 1 });

const Inventory = mongoose.model('Inventory', inventorySchema);

module.exports = Inventory;
