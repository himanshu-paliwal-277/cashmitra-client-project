import mongoose from 'mongoose';

const bankConfigSchema = new mongoose.Schema(
  {
    configType: {
      type: String,
      enum: ['recharge', 'commission'],
      required: true,
      default: 'recharge',
    },
    bankName: {
      type: String,
      required: [true, 'Bank name is required'],
      trim: true,
    },
    accountNumber: {
      type: String,
      required: [true, 'Account number is required'],
      trim: true,
    },
    ifscCode: {
      type: String,
      required: [true, 'IFSC code is required'],
      trim: true,
      uppercase: true,
    },
    accountHolderName: {
      type: String,
      required: [true, 'Account holder name is required'],
      trim: true,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    updatedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
  },
  { timestamps: true }
);

// Ensure only one active bank config per type at a time
bankConfigSchema.index(
  { configType: 1, isActive: 1 },
  {
    unique: true,
    partialFilterExpression: { isActive: true },
    name: 'unique_active_config_per_type',
  }
);

export const BankConfig = mongoose.model('BankConfig', bankConfigSchema);
