import mongoose from 'mongoose';

const vendorSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      unique: true,
    },
    companyName: {
      type: String,
      required: [true, 'Company name is required'],
      trim: true,
    },
    companyAddress: {
      street: String,
      city: String,
      state: String,
      pincode: {
        type: String,
        required: [true, 'Pincode is required'],
      },
      country: { type: String, default: 'India' },
    },
    contactPerson: {
      name: {
        type: String,
        required: [true, 'Contact person name is required'],
        trim: true,
      },
      designation: {
        type: String,
        trim: true,
      },
      phone: {
        type: String,
        required: [true, 'Contact phone is required'],
        trim: true,
      },
      email: {
        type: String,
        required: [true, 'Contact email is required'],
        trim: true,
        lowercase: true,
      },
    },
    businessDetails: {
      gstNumber: {
        type: String,
        trim: true,
      },
      panNumber: {
        type: String,
        trim: true,
      },
      businessType: {
        type: String,
        enum: [
          'retailer',
          'distributor',
          'manufacturer',
          'service_provider',
          'other',
        ],
        default: 'retailer',
      },
      yearEstablished: {
        type: Number,
        min: 1900,
        max: new Date().getFullYear(),
      },
    },
    documents: {
      gstCertificate: String,
      panCard: String,
      businessLicense: String,
      additionalDocuments: [String],
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    isVerified: {
      type: Boolean,
      default: false,
    },
    verificationStatus: {
      type: String,
      enum: ['pending', 'approved', 'rejected', 'suspended'],
      default: 'pending',
    },
    verificationNotes: String,
    verifiedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
    verifiedAt: Date,
    lastLoginAt: Date,
    metadata: {
      type: Map,
      of: mongoose.Schema.Types.Mixed,
    },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

vendorSchema.index({ user: 1 });
vendorSchema.index({ isActive: 1 });
vendorSchema.index({ verificationStatus: 1 });
vendorSchema.index({ 'contactPerson.email': 1 });
vendorSchema.index({ 'businessDetails.gstNumber': 1 });
vendorSchema.index({ createdAt: -1 });

vendorSchema.virtual('ageInDays').get(function () {
  return Math.floor((Date.now() - this.createdAt) / (1000 * 60 * 60 * 24));
});

vendorSchema.methods.isFullyVerified = function () {
  return this.isVerified && this.verificationStatus === 'approved';
};

vendorSchema.statics.getActiveVendors = function () {
  return this.find({
    isActive: true,
    verificationStatus: 'approved',
  }).populate('user', 'name email');
};

vendorSchema.statics.getByStatus = function (status) {
  return this.find({ verificationStatus: status }).populate(
    'user',
    'name email'
  );
};

export const Vendor = mongoose.model('Vendor', vendorSchema);


