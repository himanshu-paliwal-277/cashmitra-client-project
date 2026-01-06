import mongoose from 'mongoose';

const transactionSchema = new mongoose.Schema(
  {
    transactionType: {
      type: String,
      enum: [
        'order_payment',
        'commission',
        'payout',
        'refund',
        'wallet_credit',
        'wallet_debit',
        'commission_charge',
        'commission_payment',
        'commission_rollback',
      ],
      required: true,
    },
    amount: {
      type: Number,
      required: true,
    },
    currency: {
      type: String,
      default: 'INR',
    },
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
    partner: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Partner',
    },
    order: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Order',
    },
    paymentMethod: {
      type: String,
      enum: ['UPI', 'Bank Transfer', 'Wallet', 'Cash', 'System'],
    },
    paymentDetails: {
      transactionId: String,
      gatewayResponse: Object,
      bankDetails: {
        accountNumber: String,
        ifscCode: String,
        accountHolderName: String,
      },
      upiDetails: {
        upiId: String,
        reference: String,
      },
    },
    status: {
      type: String,
      enum: ['pending', 'completed', 'failed', 'cancelled'],
      default: 'pending',
    },
    description: String,
    metadata: {
      type: Map,
      of: mongoose.Schema.Types.Mixed,
    },
  },
  { timestamps: true }
);

transactionSchema.index({ transactionType: 1 });
transactionSchema.index({ user: 1 });
transactionSchema.index({ partner: 1 });
transactionSchema.index({ order: 1 });
transactionSchema.index({ status: 1 });
transactionSchema.index({ createdAt: -1 });

export const Transaction = mongoose.model('Transaction', transactionSchema);
