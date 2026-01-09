import mongoose from 'mongoose';

const buySuperCategorySchema = new mongoose.Schema(
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
    grades: {
      superb: {
        title: {
          type: String,
          default: 'Superb',
        },
        image: {
          type: String,
          default: '',
        },
      },
      veryGood: {
        title: {
          type: String,
          default: 'Very Good',
        },
        image: {
          type: String,
          default: '',
        },
      },
      good: {
        title: {
          type: String,
          default: 'Good',
        },
        image: {
          type: String,
          default: '',
        },
      },
    },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

buySuperCategorySchema.virtual('displayName').get(function () {
  return this.name;
});

buySuperCategorySchema.virtual('categories', {
  ref: 'BuyCategory',
  localField: '_id',
  foreignField: 'superCategory',
});

buySuperCategorySchema.pre('save', function (next) {
  if (this.isModified('name') && !this.slug) {
    this.slug = this.name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '');
  }
  next();
});

// Indexes
buySuperCategorySchema.index({ name: 1 });
buySuperCategorySchema.index({ slug: 1 });
buySuperCategorySchema.index({ isActive: 1, sortOrder: 1 });

export const BuySuperCategory = mongoose.model(
  'BuySuperCategory',
  buySuperCategorySchema
);
