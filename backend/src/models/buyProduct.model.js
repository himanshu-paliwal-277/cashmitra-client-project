
const mongoose = require('mongoose');

const CameraSpecSchema = new mongoose.Schema(
  {
    resolution: String,
    aperture: String,
    type: String,
    lens: String,
  },
  { _id: false }
);

const FrontCameraSchema = new mongoose.Schema(
  {
    resolution: String,
    setup: String,
    aperture: String,
    flash: String,
    videoRecording: [String],
    type: String,
    features: [String],
  },
  { _id: false }
);

const RearCameraSchema = new mongoose.Schema(
  {
    setup: String,
    camera1: CameraSpecSchema,
    camera2: CameraSpecSchema,
    flash: String,
    sensor: String,
    ois: String,
    videoRecording: [String],
    features: [String],
  },
  { _id: false }
);

const BuyProductSchema = new mongoose.Schema(
  {
    categoryId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'BuyCategory',
      required: true,
    },
    name: { type: String, required: true },
    brand: { type: String, required: true },
    isRefurbished: { type: Boolean, default: false },

    images: mongoose.Schema.Types.Mixed,

    badges: {
      qualityChecks: String,
      warranty: String,
      refundPolicy: String,
      assurance: String,
    },

    pricing: {
      mrp: Number,
      discountedPrice: Number,
      discountPercent: Number,
    },

    conditionOptions: [
      {
        label: String, 
        price: Number,
      },
    ],

    variants: [
      {
        variantId: String,
        storage: String,
        color: String,
        price: Number,
        stock: Boolean,
      },
    ],

    addOns: [
      {
        name: String,
        cost: Number,
        description: String,
      },
    ],

    offers: mongoose.Schema.Types.Mixed,

    rating: {
      average: { type: Number, default: 0 },
      totalReviews: { type: Number, default: 0 },
      breakdown: {
        '5star': { type: Number, default: 0 },
        '4star': { type: Number, default: 0 },
        '3star': { type: Number, default: 0 },
        '2star': { type: Number, default: 0 },
        '1star': { type: Number, default: 0 },
      },
    },

    reviews: [
      {
        reviewer: String,
        rating: Number,
        date: String,
        comment: String,
      },
    ],

    paymentOptions: {
      emiAvailable: Boolean,
      emiPlans: [{ months: Number, amountPerMonth: Number }],
      methods: [String],
    },

    availability: {
      inStock: { type: Boolean, default: true },
      deliveryPincode: String,
      estimatedDelivery: String,
    },

    
    topSpecs: {
      screenSize: String,
      chipset: String,
      pixelDensity: String,
      networkSupport: String,
      simSlots: String,
    },

    
    productDetails: {
      frontCamera: FrontCameraSchema, 
      rearCamera: RearCameraSchema, 

      networkConnectivity: {
        wifi: String,
        wifiFeatures: [String],
        bluetooth: String,
        nfc: String,
        gps: String,
        volte: String,
        esim: String,
        audioJack: String,
        has3p5mmJack: Boolean,
        audioFeatures: [String],
        simSize: String,
        simSlots: String,
        sim1Bands: String,
        sim2Bands: String,
        networkSupport: String,
      },

      display: mongoose.Schema.Types.Mixed,
      general: {
        announcedOn: String,
        priceMrp: String,
        brand: String,
        marketStatus: String,
        priceStatus: String,
        modelNumber: String,
      },
      memoryStorage: {
        phoneVariants: [String],
        expandableStorage: Boolean,
        ramType: String,
        storageType: String,
      },
      performance: {
        chipset: String,
        cpu: String,
        clockSpeed: String,
        gpu: String,
        os: String,
        architecture: String,
        processTechnology: String,
      },
      battery: mongoose.Schema.Types.Mixed,
      design: {
        weight: String,
        dimensions: mongoose.Schema.Types.Mixed,
        colors: mongoose.Schema.Types.Mixed,
        build: String,
        sarValue: String,
      },
      sensorsMisc: {
        fingerprintScanner: Boolean,
        sensors: [String],
      },
    },

    description: String,

    trustMetrics: {
      devicesSold: { type: Number, default: 0 },
      qualityChecks: { type: Number, default: 0 },
    },

    relatedProducts: [
      {
        id: String,
        name: String,
        price: Number,
        image: String,
        rating: Number,
      },
    ],

    legal: {
      terms: String,
      privacy: String,
      copyright: String,
    },

    isActive: { type: Boolean, default: true },
    sortOrder: { type: Number, default: 0 },
    partnerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Partner',
      required: false, 
    },
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    updatedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  },
  { timestamps: true }
);


BuyProductSchema.virtual('displayName').get(function () {
  return `${this.brand} ${this.name}`;
});


BuyProductSchema.index({ name: 1, brand: 1 });
BuyProductSchema.index({ categoryId: 1 });
BuyProductSchema.index({ isActive: 1 });
BuyProductSchema.index({ 'rating.average': -1 });
BuyProductSchema.index({ 'pricing.discountedPrice': 1 });


module.exports =
  mongoose.models.BuyProduct || mongoose.model('BuyProduct', BuyProductSchema);
