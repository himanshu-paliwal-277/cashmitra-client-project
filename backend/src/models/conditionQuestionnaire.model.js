const mongoose = require('mongoose');
const { Schema } = mongoose;

// Question Option Schema
const questionOptionSchema = new Schema(
  {
    id: {
      type: String,
      required: true,
    },
    title: {
      type: String,
      required: true,
      trim: true,
    },
    description: {
      type: String,
      trim: true,
    },
    icon: {
      type: String, // Icon name or component identifier
      trim: true,
    },
    type: {
      type: String,
      enum: ['good', 'fair', 'poor', 'excellent'],
      required: true,
    },
    priceImpact: {
      type: Number,
      default: 0, // Percentage impact on price (positive or negative)
      min: -100,
      max: 100,
    },
    sortOrder: {
      type: Number,
      default: 0,
    },
  },
  { _id: false }
);

// Question Schema
const questionSchema = new Schema(
  {
    id: {
      type: String,
      // required: true
    },
    title: {
      type: String,
      // required: true,
      trim: true,
    },
    description: {
      type: String,
      trim: true,
    },
    type: {
      type: String,
      enum: ['single_choice', 'multiple_choice', 'boolean', 'text', 'number'],
      default: 'single_choice',
    },
    required: {
      type: Boolean,
      default: true,
    },
    options: [questionOptionSchema],
    helpText: {
      type: String,
      trim: true,
    },
    sortOrder: {
      type: Number,
      default: 0,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  { _id: false }
);

// Main Condition Questionnaire Schema
const conditionQuestionnaireSchema = new Schema(
  {
    title: {
      type: String,
      required: [true, 'Title is required'],
      trim: true,
      maxlength: [200, 'Title cannot exceed 200 characters'],
    },
    description: {
      type: String,
      trim: true,
      maxlength: [1000, 'Description cannot exceed 1000 characters'],
    },
    category: {
      type: String,
      required: [true, 'Category is required'],
      enum: {
        values: [
          'smartphone',
          'laptop',
          'tablet',
          'smartwatch',
          'headphones',
          'camera',
          'gaming',
          'general',
        ],
        message:
          'Category must be one of: smartphone, laptop, tablet, smartwatch, headphones, camera, gaming, general',
      },
      lowercase: true,
    },
    subcategory: {
      type: String,
      trim: true,
      lowercase: true,
    },
    brand: {
      type: String,
      trim: true, // Optional: can be brand-specific or general
    },
    model: {
      type: String,
      trim: true, // Optional: can be model-specific or general
    },
    questions: {
      type: [questionSchema],
      validate: {
        validator: function (questions) {
          return questions && questions.length > 0;
        },
        message: 'At least one question is required',
      },
    },
    version: {
      type: String,
      default: '1.0.0',
      trim: true,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    isDefault: {
      type: Boolean,
      default: false, // Whether this is the default questionnaire for the category
    },
    metadata: {
      estimatedTime: {
        type: Number, // Estimated completion time in minutes
        default: 5,
        min: 1,
        max: 60,
      },
      difficulty: {
        type: String,
        enum: ['easy', 'medium', 'hard'],
        default: 'easy',
      },
      tags: [
        {
          type: String,
          trim: true,
          lowercase: true,
        },
      ],
      instructions: {
        type: String,
        trim: true,
      },
    },
    analytics: {
      totalResponses: {
        type: Number,
        default: 0,
      },
      averageCompletionTime: {
        type: Number, // in minutes
        default: 0,
      },
      lastUsed: {
        type: Date,
      },
    },
    createdBy: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    updatedBy: {
      type: Schema.Types.ObjectId,
      ref: 'User',
    },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

// Indexes for better performance
conditionQuestionnaireSchema.index({ category: 1, isActive: 1 });
conditionQuestionnaireSchema.index({ brand: 1, model: 1 });
conditionQuestionnaireSchema.index({ isDefault: 1, category: 1 });
conditionQuestionnaireSchema.index({ createdAt: -1 });
conditionQuestionnaireSchema.index({ 'metadata.tags': 1 });

// Virtual for question count
conditionQuestionnaireSchema.virtual('questionCount').get(function () {
  return this.questions ? this.questions.length : 0;
});

// Virtual for active question count
conditionQuestionnaireSchema.virtual('activeQuestionCount').get(function () {
  return this.questions ? this.questions.filter((q) => q.isActive).length : 0;
});

// Pre-save middleware
conditionQuestionnaireSchema.pre('save', function (next) {
  // Ensure only one default questionnaire per category
  if (this.isDefault && this.isModified('isDefault')) {
    this.constructor
      .updateMany(
        {
          category: this.category,
          _id: { $ne: this._id },
          isDefault: true,
        },
        { $set: { isDefault: false } }
      )
      .exec();
  }

  // Sort questions by sortOrder
  if (this.questions && this.questions.length > 0) {
    this.questions.sort((a, b) => (a.sortOrder || 0) - (b.sortOrder || 0));

    // Sort options within each question
    this.questions.forEach((question) => {
      if (question.options && question.options.length > 0) {
        question.options.sort(
          (a, b) => (a.sortOrder || 0) - (b.sortOrder || 0)
        );
      }
    });
  }

  next();
});

// Static methods
conditionQuestionnaireSchema.statics.findByCategory = function (
  category,
  includeInactive = false
) {
  const query = { category: category.toLowerCase() };
  if (!includeInactive) {
    query.isActive = true;
  }
  return this.find(query).sort({ isDefault: -1, createdAt: -1 });
};

conditionQuestionnaireSchema.statics.findDefault = function (category) {
  return this.findOne({
    category: category.toLowerCase(),
    isDefault: true,
    isActive: true,
  });
};

conditionQuestionnaireSchema.statics.findByBrandModel = function (
  brand,
  model,
  category
) {
  return this.find({
    $or: [
      { brand: brand, model: model, category: category.toLowerCase() },
      {
        brand: brand,
        model: { $exists: false },
        category: category.toLowerCase(),
      },
      { brand: { $exists: false }, category: category.toLowerCase() },
    ],
    isActive: true,
  }).sort({ brand: -1, model: -1, isDefault: -1, createdAt: -1 });
};

// Instance methods
conditionQuestionnaireSchema.methods.incrementUsage = function () {
  this.analytics.totalResponses += 1;
  this.analytics.lastUsed = new Date();
  return this.save();
};

conditionQuestionnaireSchema.methods.updateCompletionTime = function (
  timeInMinutes
) {
  const currentAvg = this.analytics.averageCompletionTime || 0;
  const currentCount = this.analytics.totalResponses || 0;

  if (currentCount === 0) {
    this.analytics.averageCompletionTime = timeInMinutes;
  } else {
    this.analytics.averageCompletionTime =
      (currentAvg * currentCount + timeInMinutes) / (currentCount + 1);
  }

  return this;
};

conditionQuestionnaireSchema.methods.getActiveQuestions = function () {
  return this.questions.filter((question) => question.isActive);
};

conditionQuestionnaireSchema.methods.duplicate = function (
  newTitle,
  createdBy
) {
  const duplicated = new this.constructor({
    title: newTitle || `${this.title} (Copy)`,
    description: this.description,
    category: this.category,
    subcategory: this.subcategory,
    brand: this.brand,
    model: this.model,
    questions: this.questions.map((q) => ({ ...q.toObject() })),
    version: '1.0.0',
    isActive: false, // Start as inactive
    isDefault: false, // Never default
    metadata: { ...this.metadata.toObject() },
    createdBy: createdBy,
  });

  return duplicated;
};

module.exports = mongoose.model(
  'ConditionQuestionnaire',
  conditionQuestionnaireSchema
);
