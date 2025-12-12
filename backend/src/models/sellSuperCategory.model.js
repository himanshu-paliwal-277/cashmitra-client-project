const mongoose = require('mongoose');

const sellSuperCategorySchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Super category name is required'],
      unique: true,
      trim: true,
      maxlength: [50, 'Super category name cannot exceed 50 characters'],
    },
    slug: {
      type: String,
      required: false,
      unique: true,
      lowercase: true,
    },
    image: {
      type: String,
      required: [true, 'Super category image is required'],
    },
    description: {
      type: String,
      trim: true,
      maxlength: [200, 'Description cannot exceed 200 characters'],
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

// Virtual for display name
sellSuperCategorySchema.virtual('displayName').get(function () {
  return this.name;
});

// Virtual to populate categories
sellSuperCategorySchema.virtual('categories', {
  ref: 'Category',
  localField: '_id',
  foreignField: 'superCategory',
});

// Pre-save middleware to generate slug
sellSuperCategorySchema.pre('save', function (next) {
  if (this.isModified('name') && !this.slug) {
    this.slug = this.name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '');
  }
  next();
});

// Indexes
sellSuperCategorySchema.index({ name: 1 });
sellSuperCategorySchema.index({ slug: 1 });
sellSuperCategorySchema.index({ isActive: 1, sortOrder: 1 });

const SellSuperCategory = mongoose.model(
  'SellSuperCategory',
  sellSuperCategorySchema
);

module.exports = SellSuperCategory;
