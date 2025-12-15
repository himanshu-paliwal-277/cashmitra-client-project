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
      enum: ['pending', 'approved', 'rejected'],
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
      transactions: [
        {
          type: mongoose.Schema.Types.ObjectId,
          ref: 'Transaction',
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

const Partner = mongoose.model('Partner', partnerSchema);

export default Partner;
