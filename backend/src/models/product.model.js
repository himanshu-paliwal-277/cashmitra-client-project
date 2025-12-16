import mongoose from 'mongoose';

const productSchema = new mongoose.Schema(
  {
    category: {
      type: String,
      required: [true, 'Product category is required'],
      enum: ['mobile', 'tablet', 'laptop'],
    },
    brand: {
      type: String,
      required: [true, 'Brand is required'],
    },
    series: {
      type: String,
    },
    model: {
      type: String,
      required: [true, 'Model is required'],
    },
    variant: {
      ram: {
        type: String,
        required: [true, 'RAM specification is required'],
      },
      storage: {
        type: String,
        required: [true, 'Storage specification is required'],
      },
      processor: String,
      screenSize: String,
      color: String,
    },
    basePrice: {
      type: Number,
      required: [true, 'Base price is required'],
    },
    depreciation: {
      ratePerMonth: {
        type: Number,
        default: 2,
      },
      maxDepreciation: {
        type: Number,
        default: 70,
      },
    },
    conditionFactors: {
      screenCondition: {
        perfect: { type: Number, default: 100 },
        minorScratches: { type: Number, default: 90 },
        majorScratches: { type: Number, default: 75 },
        cracked: { type: Number, default: 50 },
      },
      bodyCondition: {
        perfect: { type: Number, default: 100 },
        minorScratches: { type: Number, default: 95 },
        majorScratches: { type: Number, default: 85 },
        dented: { type: Number, default: 70 },
      },
      batteryHealth: {
        above90: { type: Number, default: 100 },
        between70And90: { type: Number, default: 90 },
        between50And70: { type: Number, default: 80 },
        below50: { type: Number, default: 60 },
      },
      functionalIssues: {
        none: { type: Number, default: 100 },
        minor: { type: Number, default: 85 },
        major: { type: Number, default: 60 },
        notWorking: { type: Number, default: 30 },
      },
    },
    images: [String],
    specifications: {
      type: Map,
      of: String,
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
  { timestamps: true }
);

productSchema.index(
  { category: 1, brand: 1, series: 1, model: 1 },
  { name: 'product_search_index' }
);

export const Product = mongoose.model('Product', productSchema);


