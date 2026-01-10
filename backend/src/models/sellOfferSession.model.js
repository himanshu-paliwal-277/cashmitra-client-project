import crypto from 'crypto';
import mongoose from 'mongoose';

const sellOfferSessionSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'User ID is required'],
    },
    productId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'SellProduct',
      required: [true, 'Product ID is required'],
    },
    variantId: {
      type: mongoose.Schema.Types.ObjectId,
      required: [true, 'Variant ID is required'],
    },
    partnerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Partner',
      required: false,
    },
    answers: {
      type: Map,
      of: mongoose.Schema.Types.Mixed,
      default: new Map(),
    },
    defects: [
      {
        type: String,
        trim: true,
      },
    ],
    accessories: [
      {
        type: String,
        trim: true,
      },
    ],
    basePrice: {
      type: Number,
      required: [true, 'Base price is required'],
      min: [0, 'Base price cannot be negative'],
    },
    breakdown: [
      {
        label: {
          type: String,
          required: [true, 'Breakdown label is required'],
          trim: true,
        },
        delta: {
          type: Number,
          required: [true, 'Breakdown delta is required'],
        },
        type: {
          type: String,
          enum: ['base', 'question', 'defect', 'accessory', 'rule'],
          default: 'question',
        },
      },
    ],
    finalPrice: {
      type: Number,
      required: [true, 'Final price is required'],
      min: [0, 'Final price cannot be negative'],
    },
    currency: {
      type: String,
      default: 'INR',
      enum: ['INR'],
    },
    computedAt: {
      type: Date,
      default: Date.now,
    },
    sessionToken: {
      type: String,
      unique: true,
      sparse: true,
    },
    expiresAt: {
      type: Date,
      default: () => new Date(Date.now() + 24 * 60 * 60 * 1000),
      index: { expireAfterSeconds: 0 },
    },
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

sellOfferSessionSchema.index({ userId: 1, createdAt: -1 });
sellOfferSessionSchema.index({ productId: 1, variantId: 1 });
sellOfferSessionSchema.index(
  { sessionToken: 1 },
  { unique: true, sparse: true }
);
sellOfferSessionSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

sellOfferSessionSchema.virtual('totalAdjustments').get(function () {
  return this.breakdown
    .filter((item) => item.type !== 'base')
    .reduce((sum, item) => sum + item.delta, 0);
});

sellOfferSessionSchema.methods.generateSessionToken = function () {
  this.sessionToken = crypto.randomBytes(32).toString('hex');
  return this.sessionToken;
};

sellOfferSessionSchema.methods.isExpired = function () {
  return new Date() > this.expiresAt;
};

sellOfferSessionSchema.methods.extendExpiry = function (hours = 24) {
  this.expiresAt = new Date(Date.now() + hours * 60 * 60 * 1000);
  return this.save();
};

sellOfferSessionSchema.statics.findActiveSession = function (sessionToken) {
  return this.findOne({
    sessionToken,
    isActive: true,
    expiresAt: { $gt: new Date() },
  });
};

sellOfferSessionSchema.statics.findActiveSessions = function (userId) {
  return this.find({
    userId,
    isActive: true,
    expiresAt: { $gt: new Date() },
  });
};

sellOfferSessionSchema.statics.cleanupExpired = function () {
  return this.deleteMany({
    expiresAt: { $lt: new Date() },
  });
};

sellOfferSessionSchema.pre('save', function (next) {
  if (
    this.isModified('answers') ||
    this.isModified('defects') ||
    this.isModified('accessories')
  ) {
    this.computedAt = new Date();
  }
  next();
});

export const SellOfferSession = mongoose.model(
  'SellOfferSession',
  sellOfferSessionSchema
);
