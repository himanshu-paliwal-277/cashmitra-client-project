import mongoose from 'mongoose';

const orderSchema = new mongoose.Schema(
  {
    assessmentId: {
      type: String,
      unique: true,
      sparse: true,
    },
    orderType: {
      type: String,
      enum: ['sell', 'buy'],
      required: true,
    },
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: false,
    },
    partner: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Partner',
      required: false,
    },
    assignedAgent: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Agent',
      required: false,
    },
    items: [
      {
        inventory: {
          type: mongoose.Schema.Types.ObjectId,
          ref: 'Inventory',
        },
        product: {
          type: mongoose.Schema.Types.ObjectId,
          ref: 'BuyProduct',
        },
        condition: {
          screenCondition: String,
          bodyCondition: String,
          batteryHealth: String,
          functionalIssues: String,
        },
        price: Number,
        quantity: {
          type: Number,
          default: 1,
        },
      },
    ],
    totalAmount: {
      type: Number,
      required: true,
    },
    commission: {
      rate: {
        type: Number,
        required: true,
      },
      amount: {
        type: Number,
        required: true,
      },
    },
    paymentDetails: {
      method: {
        type: String,
        enum: ['UPI', 'netbanking', 'Wallet', 'Cash', 'card'],
        required: true,
      },
      transactionId: String,
      status: {
        type: String,
        enum: ['pending', 'completed', 'failed', 'refunded', 'confirmed'],
        default: 'pending',
      },
      paidAt: Date,
    },
    shippingDetails: {
      address: {
        street: String,
        city: String,
        state: String,
        pincode: String,
        country: {
          type: String,
          default: 'India',
        },
      },
      contactPhone: String,
      trackingId: String,
      deliveryMethod: {
        type: String,
        enum: ['Cashmitra Logistics', 'Shop Delivery', 'Pickup'],
      },
      deliveryOption: {
        type: String,
        enum: ['standard', 'express', 'priority'],
        default: 'standard',
      },
      deliveryFee: {
        type: Number,
        default: 0,
      },
      estimatedDelivery: Date,
      deliveredAt: Date,
    },
    status: {
      type: String,
      enum: [
        'pending',
        'confirmed',
        'processing',
        'verified',
        'shipped',
        'delivered',
        'completed',
        'cancelled',
        'refunded',
      ],
      default: 'pending',
    },
    statusHistory: [
      {
        status: String,
        timestamp: {
          type: Date,
          default: Date.now,
        },
        note: String,
      },
    ],
    partnerAssignment: {
      assignedAt: Date,
      assignedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
      },
      response: {
        status: {
          type: String,
          enum: ['pending', 'accepted', 'rejected'],
          default: 'pending',
        },
        respondedAt: Date,
        reason: String,
      },
      reassignmentHistory: [
        {
          previousPartner: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Partner',
          },
          reason: String,
          reassignedAt: {
            type: Date,
            default: Date.now,
          },
        },
      ],
    },
    notes: String,
  },
  { timestamps: true }
);

orderSchema.index({ user: 1 });
orderSchema.index({ partner: 1 });
orderSchema.index({ orderType: 1 });
orderSchema.index({ status: 1 });
orderSchema.index({ createdAt: -1 });
orderSchema.index({ assessmentId: 1 });

export const Order = mongoose.model('Order', orderSchema);
