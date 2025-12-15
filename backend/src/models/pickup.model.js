const mongoose = require('mongoose');

const pickupSchema = new mongoose.Schema(
  {
    orderId: {
      type: mongoose.Schema.Types.ObjectId,
      refPath: 'orderType',
      required: [true, 'Order ID is required'],
    },
    orderType: {
      type: String,
      enum: ['Order', 'SellOrder'],
      required: [true, 'Order type is required'],
    },
    orderNumber: {
      type: String,
      required: [true, 'Order number is required'],
      trim: true,
    },
    assignedTo: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Assigned agent is required'],
    },
    assignedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Assigned by user is required'],
    },
    status: {
      type: String,
      enum: [
        'scheduled',
        'confirmed',
        'in_transit',
        'completed',
        'cancelled',
        'rescheduled',
      ],
      default: 'scheduled',
    },
    scheduledDate: {
      type: Date,
      required: [true, 'Scheduled date is required'],
    },
    scheduledTimeSlot: {
      type: String,
      required: [true, 'Time slot is required'],
      enum: ['09:00-12:00', '12:00-15:00', '15:00-18:00', '18:00-21:00'],
    },
    customer: {
      name: {
        type: String,
        required: [true, 'Customer name is required'],
        trim: true,
      },
      phone: {
        type: String,
        required: [true, 'Customer phone is required'],
        trim: true,
      },
      email: {
        type: String,
        trim: true,
        lowercase: true,
      },
    },
    address: {
      street: {
        type: String,

        trim: true,
      },
      city: {
        type: String,

        trim: true,
      },
      state: {
        type: String,

        trim: true,
      },
      zipCode: {
        type: String,

        trim: true,
      },
      landmark: {
        type: String,
        trim: true,
      },
    },
    items: [
      {
        name: {
          type: String,
          required: [true, 'Item name is required'],
          trim: true,
        },
        description: {
          type: String,
          trim: true,
        },
        quantity: {
          type: Number,
          required: [true, 'Item quantity is required'],
          min: [1, 'Quantity must be at least 1'],
        },
        estimatedValue: {
          type: Number,
          min: [0, 'Estimated value cannot be negative'],
        },
      },
    ],
    priority: {
      type: String,
      enum: ['low', 'medium', 'high', 'urgent'],
      default: 'medium',
    },
    specialInstructions: {
      type: String,
      trim: true,
    },
    pickupImages: [
      {
        type: String,
      },
    ],
    communication: [
      {
        type: {
          type: String,
          enum: ['sms', 'email', 'call', 'whatsapp'],
          required: true,
        },
        message: {
          type: String,
          required: true,
          trim: true,
        },
        sentAt: {
          type: Date,
          default: Date.now,
        },
        sentBy: {
          type: mongoose.Schema.Types.ObjectId,
          ref: 'User',
          required: true,
        },
      },
    ],
    actualPickupTime: {
      type: Date,
    },
    completedAt: {
      type: Date,
    },
    cancelledAt: {
      type: Date,
    },
    cancellationReason: {
      type: String,
      trim: true,
    },
    rescheduledFrom: {
      date: Date,
      timeSlot: String,
      reason: String,
    },
    notes: [
      {
        content: {
          type: String,
          required: true,
          trim: true,
        },
        addedBy: {
          type: mongoose.Schema.Types.ObjectId,
          ref: 'User',
          required: true,
        },
        addedAt: {
          type: Date,
          default: Date.now,
        },
      },
    ],
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

pickupSchema.index({ orderId: 1 });
pickupSchema.index({ assignedTo: 1 });
pickupSchema.index({ status: 1 });
pickupSchema.index({ scheduledDate: 1 });
pickupSchema.index({ 'customer.phone': 1 });
pickupSchema.index({ orderNumber: 1 });

pickupSchema.virtual('formattedScheduledTime').get(function () {
  if (!this.scheduledDate || !this.scheduledTimeSlot) return null;

  const date = this.scheduledDate.toLocaleDateString();
  const timeSlot = this.scheduledTimeSlot;
  return `${date} ${timeSlot}`;
});

pickupSchema.virtual('pickupDuration').get(function () {
  if (!this.actualPickupTime || !this.completedAt) return null;

  const duration = this.completedAt - this.actualPickupTime;
  return Math.round(duration / (1000 * 60));
});

pickupSchema.pre('save', function (next) {
  if (this.isModified('status')) {
    const now = new Date();

    switch (this.status) {
      case 'completed':
        if (!this.completedAt) this.completedAt = now;
        break;
      case 'cancelled':
        if (!this.cancelledAt) this.cancelledAt = now;
        break;
      case 'in_transit':
        if (!this.actualPickupTime) this.actualPickupTime = now;
        break;
    }
  }
  next();
});

pickupSchema.statics.getPickupStats = async function (filters = {}) {
  const pipeline = [
    { $match: filters },
    {
      $group: {
        _id: '$status',
        count: { $sum: 1 },
      },
    },
  ];

  const stats = await this.aggregate(pipeline);

  const result = {
    total: 0,
    scheduled: 0,
    confirmed: 0,
    in_transit: 0,
    completed: 0,
    cancelled: 0,
    rescheduled: 0,
  };

  stats.forEach((stat) => {
    result[stat._id] = stat.count;
    result.total += stat.count;
  });

  return result;
};

pickupSchema.methods.addCommunication = function (type, message, sentBy) {
  this.communication.push({
    type,
    message,
    sentBy,
    sentAt: new Date(),
  });
  return this.save();
};

pickupSchema.methods.addNote = function (content, addedBy) {
  this.notes.push({
    content,
    addedBy,
    addedAt: new Date(),
  });
  return this.save();
};

module.exports = mongoose.model('Pickup', pickupSchema);
