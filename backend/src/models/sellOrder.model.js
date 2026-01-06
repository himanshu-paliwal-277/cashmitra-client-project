import mongoose from 'mongoose';

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
    assigned_partner_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Partner',
      default: null,
    },
    orderNumber: {
      type: String,
      unique: true,
      required: [true, 'Order number is required'],
    },
    status: {
      type: String,
      enum: [
        'draft',
        'open',
        'pending_acceptance',
        'confirmed',
        'cancelled',
        'picked',
        'paid',
      ],
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
      location: {
        type: {
          type: String,
          enum: ['Point'],
          default: 'Point',
        },
        coordinates: {
          type: [Number], // [longitude, latitude]
          default: [0, 0],
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
    commission: {
      totalRate: {
        type: Number,
        required: true,
        min: 0,
        max: 100,
        comment: 'Commission rate for this sell order',
      },
      totalAmount: {
        type: Number,
        required: true,
        min: 0,
        comment: 'Total commission amount for this sell order',
      },
      breakdown: [
        {
          category: {
            type: String,
            enum: ['mobile', 'tablet', 'laptop', 'accessories'],
            required: true,
          },
          rate: {
            type: Number,
            required: true,
            min: 0,
            max: 100,
          },
          amount: {
            type: Number,
            required: true,
            min: 0,
          },
          itemCount: {
            type: Number,
            required: true,
            min: 1,
            default: 1,
          },
        },
      ],
      isApplied: {
        type: Boolean,
        default: false,
      },
      appliedAt: {
        type: Date,
      },
    },
    notes: {
      type: String,
      trim: true,
    },
    assignedTo: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Partner',
    },
    assignedAgent: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Agent',
      default: null,
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
sellOrderSchema.index({ assigned_partner_id: 1, status: 1 });
sellOrderSchema.index({ assignedAgent: 1, status: 1 });
sellOrderSchema.index({ 'pickup.location': '2dsphere' });

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

sellOrderSchema.methods.confirm = async function () {
  // Apply commission when order is confirmed
  if (
    this.assigned_partner_id &&
    (!this.commission || !this.commission.isApplied)
  ) {
    try {
      const {
        applyCommissionForItems,
        applyCommissionToPartner,
        getCategoryFromProduct,
      } = await import('../utils/commission.utils.js');

      // For sell orders, use the pre-calculated commission from order creation
      if (this.commission && this.commission.totalAmount) {
        console.log(
          `🔄 Applying commission for confirmed sell order ${this._id}:`,
          {
            partnerId: this.assigned_partner_id.toString(),
            orderValue: this.quoteAmount,
            commissionAmount: this.commission.totalAmount,
          }
        );

        // Apply commission using the pre-calculated data
        await applyCommissionForItems(
          this.assigned_partner_id,
          {
            totalAmount: this.commission.totalAmount,
            totalRate: this.commission.totalRate,
            breakdown: this.commission.breakdown,
          },
          this._id,
          'SellOrder'
        );

        // Mark commission as applied
        this.commission.isApplied = true;
        this.commission.appliedAt = new Date();
      } else {
        // Fallback: calculate commission if not pre-calculated
        const product = this.sessionId?.productId;
        const category = getCategoryFromProduct(product);
        const orderValue = this.quoteAmount;

        console.log(
          `🔄 Calculating and applying commission for confirmed sell order ${this._id}:`,
          {
            partnerId: this.assigned_partner_id.toString(),
            orderValue,
            category,
          }
        );

        const commissionResult = await applyCommissionToPartner(
          this.assigned_partner_id,
          orderValue,
          category,
          'sell',
          this._id,
          'SellOrder'
        );

        // Update order with commission details
        this.commission = {
          totalRate: commissionResult.commission.rate,
          totalAmount: commissionResult.commission.amount,
          breakdown: [
            {
              category: commissionResult.commission.category,
              rate: commissionResult.commission.rate,
              amount: commissionResult.commission.amount,
              itemCount: 1,
            },
          ],
          isApplied: true,
          appliedAt: new Date(),
        };
      }

      console.log(
        `✅ Commission applied successfully for confirmed sell order ${this._id}`
      );
    } catch (commissionError) {
      console.error(
        'Commission application error during sell order confirmation:',
        commissionError
      );
      // Don't fail the confirmation, but log the error
    }
  }

  this.status = 'confirmed';
  return this.save();
};

sellOrderSchema.methods.cancel = async function (reason) {
  // Rollback commission if it was applied
  if (
    this.commission &&
    this.commission.isApplied &&
    this.assigned_partner_id
  ) {
    try {
      const { rollbackCommissionForItems } =
        await import('../utils/commission.utils.js');

      console.log(
        `🔄 Rolling back commission for cancelled sell order ${this._id}`
      );

      await rollbackCommissionForItems(
        this.assigned_partner_id,
        this.commission.totalAmount,
        this._id,
        'SellOrder',
        reason || 'Sell order cancelled by user'
      );

      // Mark commission as not applied
      this.commission.isApplied = false;
      this.commission.appliedAt = undefined;

      console.log(
        `✅ Commission rolled back for cancelled sell order ${this._id}`
      );
    } catch (rollbackError) {
      console.error(
        'Commission rollback error during sell order cancellation:',
        rollbackError
      );
      // Don't fail the cancellation, but log the error
    }
  }

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

sellOrderSchema.methods.setPickupLocation = function (latitude, longitude) {
  this.pickup.location = {
    type: 'Point',
    coordinates: [longitude, latitude],
  };
  return this;
};

sellOrderSchema.methods.makeAvailable = function () {
  this.status = 'open';
  this.assigned_partner_id = null;
  return this.save();
};

sellOrderSchema.methods.assignToPartner = function (partnerId) {
  this.assigned_partner_id = partnerId;
  this.status = 'pending_acceptance';
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

sellOrderSchema.statics.findAvailableNearPartner = function (
  partnerLocation,
  serviceRadius,
  limit = 20
) {
  const radiusInRadians = serviceRadius / 6378100;

  return this.aggregate([
    {
      $match: {
        assigned_partner_id: null,
        status: 'open',
        'pickup.location': {
          $geoWithin: {
            $centerSphere: [partnerLocation.coordinates, radiusInRadians],
          },
        },
      },
    },
    {
      $sort: { createdAt: -1 },
    },
    {
      $limit: limit,
    },
    {
      $lookup: {
        from: 'users',
        localField: 'userId',
        foreignField: '_id',
        as: 'userId',
        pipeline: [{ $project: { name: 1, email: 1, phone: 1 } }],
      },
    },
    {
      $lookup: {
        from: 'selloffersessions',
        localField: 'sessionId',
        foreignField: '_id',
        as: 'sessionId',
      },
    },
    {
      $unwind: {
        path: '$userId',
        preserveNullAndEmptyArrays: true,
      },
    },
    {
      $unwind: {
        path: '$sessionId',
        preserveNullAndEmptyArrays: true,
      },
    },
    {
      $lookup: {
        from: 'sellproducts',
        localField: 'sessionId.productId',
        foreignField: '_id',
        as: 'sessionId.productId',
        pipeline: [
          {
            $project: {
              name: 1,
              brand: 1,
              images: 1,
              categoryId: 1,
              variants: 1,
              isActive: 1,
              description: 1,
              specifications: 1,
            },
          },
        ],
      },
    },
    {
      $unwind: {
        path: '$sessionId.productId',
        preserveNullAndEmptyArrays: true,
      },
    },
  ]);
};

sellOrderSchema.statics.claimOrder = function (orderId, partnerId) {
  return this.findOneAndUpdate(
    {
      _id: orderId,
      assigned_partner_id: null,
      status: 'open',
    },
    {
      assigned_partner_id: partnerId,
      status: 'pending_acceptance',
    },
    {
      new: true,
      runValidators: true,
    }
  );
};

export const SellOrder = mongoose.model('SellOrder', sellOrderSchema);
