const mongoose = require('mongoose');

const sellOrderSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
    sessionId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'SellOfferSession',
      required: [true, 'Session ID is required'],
    },
    partnerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Partner',
      required: false,
    },
    orderNumber: {
      type: String,
      unique: true,
      required: [true, 'Order number is required'],
    },
    status: {
      type: String,
      enum: ['draft', 'confirmed', 'cancelled', 'picked', 'paid'],
      default: 'draft',
    },
    pickup: {
      address: {
        fullName: {
          type: String,
          required: [true, 'Full name is required'],
          trim: true,
        },
        phone: {
          type: String,
          required: [true, 'Phone number is required'],
          trim: true,
        },
        street: {
          type: String,
          required: [true, 'Street address is required'],
          trim: true,
        },
        city: {
          type: String,
          required: [true, 'City is required'],
          trim: true,
        },
        state: {
          type: String,
          required: [true, 'State is required'],
          trim: true,
        },
        pincode: {
          type: String,
          required: [true, 'Pincode is required'],
          trim: true,
        },
      },
      slot: {
        date: {
          type: Date,
          required: [true, 'Pickup date is required'],
        },
        window: {
          type: String,
          required: [true, 'Pickup time window is required'],
          trim: true,
        },
      },
    },
    payment: {
      method: {
        type: String,
        enum: ['upi', 'bank_transfer', 'wallet', 'cash'],
        required: [true, 'Payment method is required'],
      },
      status: {
        type: String,
        enum: ['pending', 'success', 'failed'],
        default: 'pending',
      },
      transactionId: {
        type: String,
        trim: true,
      },
      paidAt: {
        type: Date,
      },
    },
    quoteAmount: {
      type: Number,
      required: [true, 'Quote amount is required'],
      min: [0, 'Quote amount cannot be negative'],
    },
    actualAmount: {
      type: Number,
      min: [0, 'Actual amount cannot be negative'],
    },
    notes: {
      type: String,
      trim: true,
    },
    assignedTo: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Partner',
    },
    pickedAt: {
      type: Date,
    },
    cancelledAt: {
      type: Date,
    },
    cancellationReason: {
      type: String,
      trim: true,
    },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

sellOrderSchema.index({ userId: 1, createdAt: -1 });
sellOrderSchema.index({ orderNumber: 1 }, { unique: true });
sellOrderSchema.index({ status: 1, createdAt: -1 });
sellOrderSchema.index({ 'pickup.slot.date': 1, status: 1 });
sellOrderSchema.index({ assignedTo: 1, status: 1 });

sellOrderSchema.virtual('formattedAddress').get(function () {
  const addr = this.pickup.address;
  return `${addr.street}, ${addr.city}, ${addr.state} - ${addr.pincode}`;
});

sellOrderSchema.virtual('pickupSlotDisplay').get(function () {
  const slot = this.pickup.slot;
  const date = new Date(slot.date).toLocaleDateString('en-IN');
  return `${date} (${slot.window})`;
});

sellOrderSchema.pre('save', async function (next) {
  if (this.isNew && !this.orderNumber) {
    const date = new Date();
    const year = date.getFullYear().toString().slice(-2);
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const day = date.getDate().toString().padStart(2, '0');

    const prefix = `SO${year}${month}${day}`;
    const lastOrder = await this.constructor
      .findOne({
        orderNumber: new RegExp(`^${prefix}`),
      })
      .sort({ orderNumber: -1 });

    let sequence = 1;
    if (lastOrder) {
      const lastSequence = parseInt(lastOrder.orderNumber.slice(-4));
      sequence = lastSequence + 1;
    }

    this.orderNumber = `${prefix}${sequence.toString().padStart(4, '0')}`;
  }
  next();
});

sellOrderSchema.methods.confirm = function () {
  this.status = 'confirmed';
  return this.save();
};

sellOrderSchema.methods.cancel = function (reason) {
  this.status = 'cancelled';
  this.cancelledAt = new Date();
  this.cancellationReason = reason;
  return this.save();
};

sellOrderSchema.methods.markPicked = function (actualAmount, assignedTo) {
  this.status = 'picked';
  this.pickedAt = new Date();
  if (actualAmount !== undefined) this.actualAmount = actualAmount;
  if (assignedTo) this.assignedTo = assignedTo;
  return this.save();
};

sellOrderSchema.methods.markPaid = function (transactionId) {
  this.payment.status = 'success';
  this.payment.paidAt = new Date();
  this.payment.transactionId = transactionId;
  this.status = 'paid';
  return this.save();
};

sellOrderSchema.statics.getByStatus = function (status, limit = 50, skip = 0) {
  return this.find({ status })
    .populate('userId', 'name email phone')
    .populate('sessionId')
    .populate({
      path: 'assignedTo',
      populate: {
        path: 'user',
        select: 'name email phone',
      },
      select: 'businessName shopName email phone user',
    })
    .sort({ createdAt: -1 })
    .limit(limit)
    .skip(skip);
};

const SellOrder = mongoose.model('SellOrder', sellOrderSchema);

module.exports = SellOrder;
