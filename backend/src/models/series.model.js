import mongoose from 'mongoose';

const seriesSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
      maxlength: 50,
    },

    slug: {
      type: String,
      lowercase: true,
      trim: true,
    },

    category: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Category', // Samsung
      required: true,
    },

    // superCategory: {
    //   type: mongoose.Schema.Types.ObjectId,
    //   ref: 'SellSuperCategory', // Mobile
    //   required: true,
    // },

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
  },
  { timestamps: true }
);

// Slug
seriesSchema.pre('save', function (next) {
  if (this.isModified('name')) {
    this.slug = this.name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '');
  }
  next();
});

/**
 * ✅ Unique per Category (Samsung)
 */
seriesSchema.index({ name: 1, category: 1 }, { unique: true });

export const Series = mongoose.model('Series', seriesSchema);
