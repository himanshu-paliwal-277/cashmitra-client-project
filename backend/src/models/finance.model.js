import mongoose from 'mongoose';

const financeSchema = new mongoose.Schema(
  {
    transactionType: {
      type: String,
      enum: ['commission', 'refund', 'adjustment', 'withdrawal', 'deposit'],
      required: true,
    },
    order: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Order',
    },
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
    partner: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Partner',
    },
    amount: {
      type: Number,
      required: true,
    },
    currency: {
      type: String,
      default: 'INR',
    },
    commission: {
      rate: {
        type: Number,
        min: 0,
        max: 100,
      },
      amount: {
        type: Number,
        min: 0,
      },
      type: {
        type: String,
        enum: ['percentage', 'fixed'],
        default: 'percentage',
      },
    },
    status: {
      type: String,
      enum: ['pending', 'processed', 'failed', 'cancelled'],
      default: 'pending',
    },
    paymentMethod: {
      type: String,
      enum: ['bank_transfer', 'upi', 'wallet', 'cash', 'cheque'],
    },
    paymentDetails: {
      accountNumber: String,
      ifscCode: String,
      upiId: String,
      transactionId: String,
      referenceNumber: String,
    },
    description: {
      type: String,
      trim: true,
    },
    category: {
      type: String,
      enum: [
        'sales_commission',
        'partner_commission',
        'platform_fee',
        'processing_fee',
        'other',
      ],
      default: 'sales_commission',
    },
    processedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
    processedAt: {
      type: Date,
    },
    metadata: {
      originalAmount: Number,
      taxAmount: Number,
      netAmount: Number,
      exchangeRate: Number,
      fees: [
        {
          type: String,
          amount: Number,
          description: String,
        },
      ],
    },
  },
  {
    timestamps: true,
  }
);

financeSchema.index({ transactionType: 1 });
financeSchema.index({ order: 1 });
financeSchema.index({ user: 1 });
financeSchema.index({ partner: 1 });
financeSchema.index({ status: 1 });
financeSchema.index({ category: 1 });
financeSchema.index({ createdAt: -1 });
financeSchema.index({ processedAt: -1 });

financeSchema.virtual('netAmount').get(function () {
  if (this.commission && this.commission.amount) {
    return this.amount - this.commission.amount;
  }
  return this.amount;
});

financeSchema.pre('save', function (next) {
  if (this.isModified('amount') || this.isModified('commission.rate')) {
    if (this.commission && this.commission.rate) {
      if (this.commission.type === 'percentage') {
        this.commission.amount = Math.round(
          this.amount * (this.commission.rate / 100)
        );
      } else {
        this.commission.amount = this.commission.rate;
      }
    }
  }
  next();
});

financeSchema.methods.processTransaction = function (processedBy) {
  this.status = 'processed';
  this.processedBy = processedBy;
  this.processedAt = new Date();
  return this.save();
};

financeSchema.statics.getCommissionSummary = function (startDate, endDate) {
  const matchStage = {
    transactionType: 'commission',
    status: 'processed',
  };

  if (startDate && endDate) {
    matchStage.processedAt = {
      $gte: new Date(startDate),
      $lte: new Date(endDate),
    };
  }

  return this.aggregate([
    { $match: matchStage },
    {
      $group: {
        _id: '$category',
        totalAmount: { $sum: '$amount' },
        totalCommission: { $sum: '$commission.amount' },
        count: { $sum: 1 },
        avgAmount: { $avg: '$amount' },
      },
    },
    {
      $sort: { totalAmount: -1 },
    },
  ]);
};

financeSchema.statics.getPartnerEarnings = function (
  partnerId,
  startDate,
  endDate
) {
  const matchStage = {
    partner: mongoose.Types.ObjectId(partnerId),
    status: 'processed',
  };

  if (startDate && endDate) {
    matchStage.processedAt = {
      $gte: new Date(startDate),
      $lte: new Date(endDate),
    };
  }

  return this.aggregate([
    { $match: matchStage },
    {
      $group: {
        _id: null,
        totalEarnings: { $sum: '$amount' },
        totalCommission: { $sum: '$commission.amount' },
        netEarnings: { $sum: { $subtract: ['$amount', '$commission.amount'] } },
        transactionCount: { $sum: 1 },
      },
    },
  ]);
};

export const Finance = mongoose.model('Finance', financeSchema);
