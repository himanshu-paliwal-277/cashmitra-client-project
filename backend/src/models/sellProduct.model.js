import mongoose from 'mongoose';

const sellProductSchema = new mongoose.Schema(
  {
    categoryId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Category',
      required: [true, 'Category is required'],
    },
    name: {
      type: String,
      required: [true, 'Product name is required'],
      trim: true,
    },
    slug: {
      type: String,

      unique: true,
      lowercase: true,
      trim: true,
    },
    images: [
      {
        type: String,
        trim: true,
      },
    ],
    status: {
      type: String,
      enum: ['active', 'inactive'],
      default: 'active',
    },
    variants: [
      {
        _id: {
          type: mongoose.Schema.Types.ObjectId,
          default: () => new mongoose.Types.ObjectId(),
        },
        label: {
          type: String,
          required: [true, 'Variant label is required'],
          trim: true,
        },
        basePrice: {
          type: Number,
          required: [true, 'Base price is required'],
          min: [0, 'Base price cannot be negative'],
        },
        isActive: {
          type: Boolean,
          default: true,
        },
      },
    ],
    tags: [
      {
        type: String,
        trim: true,
      },
    ],
    partnerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Partner',
      required: false,
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

sellProductSchema.index({ categoryId: 1, status: 1 });
sellProductSchema.index({ slug: 1 }, { unique: true });
sellProductSchema.index({ name: 'text', tags: 'text' });

sellProductSchema.virtual('activeVariants').get(function () {
  return this.variants
    ? this.variants.filter((variant) => variant.isActive)
    : [];
});

sellProductSchema.pre('save', function (next) {
  if (!this.slug && this.name) {
    this.slug = this.name
      .toLowerCase()
      .replace(/[^a-z0-9\s-]/g, '')
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-')
      .trim('-');
  }
  next();
});

export const SellProduct = mongoose.model('SellProduct', sellProductSchema);


