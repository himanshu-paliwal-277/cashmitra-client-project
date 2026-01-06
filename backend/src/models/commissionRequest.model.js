import mongoose from 'mongoose';

const commissionRequestSchema = new mongoose.Schema(
  {
    partner: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Partner',
      required: true,
    },
    amount: {
      type: Number,
      required: true,
      min: [1, 'Amount must be at least 1'],
    },
    requestType: {
      type: String,
      enum: ['commission_payment'],
      default: 'commission_payment',
    },
    status: {
      type: String,
      enum: ['pending', 'approved', 'rejected'],
      default: 'pending',
    },
    screenshot: {
      type: String,
      required: true,
    },
    paymentMethod: {
      type: String,
      enum: ['bank_transfer', 'upi'],
      default: 'bank_transfer', // Default to bank transfer
    },
    bankDetails: {
      accountHolderName: String,
      accountNumber: String,
      ifscCode: String,
      bankName: String,
      branch: String,
    },
    upiDetails: {
      upiId: {
        type: String,
        required: function () {
          return this.paymentMethod === 'upi';
        },
      },
    },
    description: {
      type: String,
      default: 'Commission payment request',
    },
    adminNotes: String,
    processedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
    processedAt: Date,
    transactionId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Transaction',
    },
  },
  { timestamps: true }
);

commissionRequestSchema.index({ partner: 1 });
commissionRequestSchema.index({ status: 1 });
commissionRequestSchema.index({ createdAt: -1 });

export const CommissionRequest = mongoose.model(
  'CommissionRequest',
  commissionRequestSchema
);
