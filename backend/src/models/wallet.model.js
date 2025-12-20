import mongoose from 'mongoose';

const walletSchema = new mongoose.Schema(
  {
    partner: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Partner',
      required: true,
    },
    balance: {
      type: Number,
      default: 0,
      min: 0,
    },
    currency: {
      type: String,
      default: 'INR',
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    transactions: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Transaction',
      },
    ],
    lastUpdated: {
      type: Date,
      default: Date.now,
    },
    payoutSettings: {
      minimumPayoutAmount: {
        type: Number,
        default: 1000,
      },
      autoPayoutEnabled: {
        type: Boolean,
        default: false,
      },
      payoutSchedule: {
        type: String,
        enum: ['manual', 'weekly', 'biweekly', 'monthly'],
        default: 'manual',
      },
      bankDetails: {
        accountNumber: String,
        ifscCode: String,
        accountHolderName: String,
        bankName: String,
        branch: String,
      },
      upiId: String,
    },
  },
  { timestamps: true }
);

walletSchema.index({ partner: 1 }, { unique: true });

export const Wallet = mongoose.model('Wallet', walletSchema);
