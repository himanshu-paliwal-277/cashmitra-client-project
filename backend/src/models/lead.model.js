const mongoose = require('mongoose');

const leadSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    email: {
      type: String,
      required: true,
      lowercase: true,
      trim: true,
    },
    phone: {
      type: String,
      required: true,
      trim: true,
    },
    source: {
      type: String,
      enum: [
        'website',
        'social_media',
        'referral',
        'advertisement',
        'direct',
        'other',
      ],
      default: 'website',
    },
    status: {
      type: String,
      enum: ['new', 'contacted', 'qualified', 'converted', 'lost'],
      default: 'new',
    },
    priority: {
      type: String,
      enum: ['low', 'medium', 'high', 'urgent'],
      default: 'medium',
    },
    interestedIn: {
      type: String,
      enum: ['selling', 'buying', 'both'],
      required: true,
    },
    deviceType: {
      type: String,
      trim: true,
    },
    estimatedValue: {
      type: Number,
      min: 0,
    },
    notes: {
      type: String,
      trim: true,
    },
    assignedTo: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
    followUpDate: {
      type: Date,
    },
    lastContactDate: {
      type: Date,
    },
    conversionDate: {
      type: Date,
    },
    tags: [
      {
        type: String,
        trim: true,
      },
    ],
    metadata: {
      ipAddress: String,
      userAgent: String,
      referrer: String,
    },
  },
  {
    timestamps: true,
  }
);

// Indexes for better query performance
leadSchema.index({ email: 1 });
leadSchema.index({ phone: 1 });
leadSchema.index({ status: 1 });
leadSchema.index({ priority: 1 });
leadSchema.index({ assignedTo: 1 });
leadSchema.index({ createdAt: -1 });
leadSchema.index({ followUpDate: 1 });

// Virtual for lead age in days
leadSchema.virtual('ageInDays').get(function () {
  return Math.floor((Date.now() - this.createdAt) / (1000 * 60 * 60 * 24));
});

// Method to check if lead is overdue for follow-up
leadSchema.methods.isOverdue = function () {
  return this.followUpDate && this.followUpDate < new Date();
};

// Static method to get leads by status
leadSchema.statics.getByStatus = function (status) {
  return this.find({ status }).populate('assignedTo', 'name email');
};

// Static method to get overdue leads
leadSchema.statics.getOverdue = function () {
  return this.find({
    followUpDate: { $lt: new Date() },
    status: { $nin: ['converted', 'lost'] },
  }).populate('assignedTo', 'name email');
};

module.exports = mongoose.model('Lead', leadSchema);
