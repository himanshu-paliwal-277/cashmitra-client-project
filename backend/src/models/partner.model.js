import mongoose from 'mongoose';

const partnerSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    shopName: {
      type: String,
      required: [true, 'Shop name is required'],
      trim: true,
    },
    shopAddress: {
      street: String,
      city: String,
      state: String,
      pincode: {
        type: String,
        required: [true, 'Pincode is required for location-based services'],
      },
      country: { type: String, default: 'India' },
      coordinates: {
        latitude: Number,
        longitude: Number,
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
    service_radius: {
      type: Number,
      default: 5000, // 5km default radius
      min: [1000, 'Service radius must be at least 1km'],
    },
    gstNumber: {
      type: String,
      required: [true, 'GST number is required'],
      unique: true,
      trim: true,
    },
    shopPhone: {
      type: String,
      required: [true, 'Shop phone number is required'],
      trim: true,
    },
    shopEmail: {
      type: String,
      required: [true, 'Shop email is required'],
      trim: true,
      lowercase: true,
    },
    shopLogo: {
      type: String,
      default: '',
    },
    shopImages: [String],
    documents: {
      gstCertificate: String,
      shopLicense: String,
      ownerIdProof: String,
      additionalDocuments: [String],
    },
    isVerified: {
      type: Boolean,
      default: false,
    },
    verificationStatus: {
      type: String,
      enum: ['pending', 'submitted', 'approved', 'rejected'],
      default: 'pending',
    },
    verificationNotes: String,
    rating: {
      type: Number,
      default: 0,
      min: 0,
      max: 5,
    },
    reviews: [
      {
        user: {
          type: mongoose.Schema.Types.ObjectId,
          ref: 'User',
        },
        rating: Number,
        comment: String,
        createdAt: {
          type: Date,
          default: Date.now,
        },
      },
    ],
    wallet: {
      balance: {
        type: Number,
        default: 0,
      },
      commissionBalance: {
        type: Number,
        default: 0,
        comment: 'Amount partner owes to admin as commission',
      },
      totalCommissionPaid: {
        type: Number,
        default: 0,
        comment: 'Total commission amount paid to admin',
      },
      transactions: [
        {
          type: {
            type: String,
            enum: ['credit', 'debit'],
            required: true,
          },
          amount: {
            type: Number,
            required: true,
          },
          description: {
            type: String,
            required: true,
          },
          timestamp: {
            type: Date,
            default: Date.now,
          },
          reference: {
            type: mongoose.Schema.Types.ObjectId,
            refPath: 'referenceModel',
          },
          referenceModel: {
            type: String,
            enum: ['WalletRechargeRequest', 'Order', 'SellOrder'],
          },
          transactionCategory: {
            type: String,
            enum: ['wallet', 'commission'],
            default: 'wallet',
          },
        },
      ],
    },
    bankDetails: {
      accountHolderName: String,
      accountNumber: String,
      ifscCode: String,
      bankName: String,
      branch: String,
    },
    upiId: String,
  },
  { timestamps: true }
);

partnerSchema.index({ location: '2dsphere' });

partnerSchema.pre('save', function (next) {
  if (
    this.shopAddress?.coordinates?.latitude &&
    this.shopAddress?.coordinates?.longitude
  ) {
    this.location = {
      type: 'Point',
      coordinates: [
        this.shopAddress.coordinates.longitude,
        this.shopAddress.coordinates.latitude,
      ],
    };
  }
  next();
});

partnerSchema.methods.updateLocationFromCoordinates = function (
  latitude,
  longitude
) {
  this.shopAddress.coordinates = { latitude, longitude };
  this.location = {
    type: 'Point',
    coordinates: [longitude, latitude],
  };
  return this.save();
};

export const Partner = mongoose.model('Partner', partnerSchema);
