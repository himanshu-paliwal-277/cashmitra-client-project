import mongoose from 'mongoose';

const sellQuestionSchema = new mongoose.Schema(
  {
    categoryId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Category',
      required: [true, 'Category ID is required'],
    },
    section: {
      type: String,
      required: [true, 'Section is required'],
      trim: true,
      minlength: [1, 'Section must be at least 1 character'],
      maxlength: [100, 'Section cannot exceed 100 characters'],
    },
    order: {
      type: Number,
      required: [true, 'Order is required'],
      min: [0, 'Order cannot be negative'],
    },
    key: {
      type: String,
      required: [true, 'Question key is required'],
      trim: true,
      minlength: [1, 'Key must be at least 1 character'],
      maxlength: [100, 'Key cannot exceed 100 characters'],
      match: [
        /^[a-z0-9_]+$/,
        'Key must contain only lowercase letters, numbers, and underscores',
      ],
    },
    title: {
      type: String,
      required: [true, 'Question title is required'],
      trim: true,
      minlength: [1, 'Title must be at least 1 character'],
      maxlength: [200, 'Title cannot exceed 200 characters'],
    },
    description: {
      type: String,
      trim: true,
      maxlength: [500, 'Description cannot exceed 500 characters'],
    },
    uiType: {
      type: String,
      enum: {
        values: [
          'radio',
          'checkbox',
          'select',
          'multiselect',
          'slider',
          'toggle',
        ],
        message:
          'UI type must be one of: radio, checkbox, select, multiselect, slider, toggle',
      },
      required: [true, 'UI type is required'],
    },
    multiSelect: {
      type: Boolean,
      default: false,
    },
    required: {
      type: Boolean,
      default: false,
    },
    showIf: {
      questionKey: {
        type: String,
        trim: true,
        minlength: [1, 'showIf questionKey must be at least 1 character'],
      },
      value: {
        type: mongoose.Schema.Types.Mixed,
      },
    },
    options: [
      {
        _id: false,
        key: {
          type: String,
          required: [true, 'Option key is required'],
          trim: true,
          minlength: [1, 'Option key must be at least 1 character'],
          maxlength: [100, 'Option key cannot exceed 100 characters'],
        },
        label: {
          type: String,
          required: [true, 'Option label is required'],
          trim: true,
          minlength: [1, 'Option label must be at least 1 character'],
          maxlength: [200, 'Option label cannot exceed 200 characters'],
        },
        value: {
          type: mongoose.Schema.Types.Mixed,
          required: [true, 'Option value is required'],
        },
        delta: {
          type: {
            type: String,
            enum: {
              values: ['abs', 'percent'],
              message: 'Delta type must be either abs or percent',
            },
          },
          sign: {
            type: String,
            enum: {
              values: ['+', '-'],
              message: 'Delta sign must be either + or -',
            },
          },
          value: {
            type: Number,
            min: [0, 'Delta value cannot be negative'],
          },
        },
        showIf: {
          type: mongoose.Schema.Types.Mixed,
          validate: {
            validator: function (v) {
              if (v === undefined || v === null) return true;
              return (
                typeof v === 'object' && 'questionKey' in v && 'value' in v
              );
            },
            message:
              'Option showIf must be an object with questionKey and value or undefined',
          },
          default: undefined,
        },
      },
    ],
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

sellQuestionSchema.pre('save', function (next) {
  this.options = this.options.map((opt) => ({
    ...opt,
    showIf: opt.showIf === null ? undefined : opt.showIf,
  }));
  next();
});

sellQuestionSchema.index({ categoryId: 1, key: 1 }, { unique: true });

sellQuestionSchema.index({ categoryId: 1, section: 1, order: 1 });

sellQuestionSchema.index({ categoryId: 1, isActive: 1 });

sellQuestionSchema.virtual('activeOptions').get(function () {
  return this.options.filter((option) => option.isActive !== false);
});

sellQuestionSchema.statics.getForCategory = function (categoryId) {
  const query = {
    categoryId,
    isActive: true,
  };

  return this.find(query).sort({ section: 1, order: 1 });
};

sellQuestionSchema.statics.getForVariants = async function (
  productId
  // variantIds = []
) {
  const { SellProduct } = await import('./sellProduct.model.js');

  const product = await SellProduct.findById(productId).select('categoryId');
  if (!product) {
    return [];
  }

  return this.getForCategory(product.categoryId);
};

export const SellQuestion = mongoose.model('SellQuestion', sellQuestionSchema);
