import mongoose from 'mongoose';

const buyCategorySchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Buy category name is required'],
      unique: true,
      trim: true,
      maxlength: [50, 'Category name cannot exceed 50 characters'],
    },
    slug: {
      type: String,
      required: false,
      unique: true,
      lowercase: true,
    },
    image: {
      type: String,
      required: [true, 'Category image is required'],
    },
    superCategory: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'BuySuperCategory',
      required: [true, 'Super category is required'],
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    sortOrder: {
      type: Number,
      default: 0,
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    updatedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

buyCategorySchema.virtual('displayName').get(function () {
  return this.name;
});

buyCategorySchema.pre('save', function (next) {
  if (this.isModified('name') && !this.slug) {
    this.slug = this.name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '');
  }
  next();
});

// Indexes
buyCategorySchema.index({ name: 1 });
buyCategorySchema.index({ slug: 1 });
buyCategorySchema.index({ isActive: 1, sortOrder: 1 });

export const BuyCategory = mongoose.model('BuyCategory', buyCategorySchema);
