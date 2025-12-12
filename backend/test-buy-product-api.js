const axios = require('axios');

// Base URL for the API
const BASE_URL = 'http://localhost:5000/api';

// Dummy data for testing buy product creation
const dummyBuyProductData = {
  categoryId: '68ded4d10abfa075fd99a13f', // Valid category ID
  name: 'iPhone 15 Pro Max',
  brand: 'Apple',
  isRefurbished: false,

  images: {
    main: 'https://example.com/iphone15-main.jpg',
    gallery:
      'https://example.com/iphone15-1.jpg,https://example.com/iphone15-2.jpg,https://example.com/iphone15-3.jpg',
    thumbnail: 'https://example.com/iphone15-thumb.jpg',
  },

  badges: {
    qualityChecks: '32-Point Quality Check',
    warranty: '6 Months Warranty',
    refundPolicy: '7 Days Return',
    assurance: 'Cashify Assured',
  },

  pricing: {
    mrp: 159900,
    discountedPrice: 145000,
    discountPercent: 9,
  },

  conditionOptions: [
    { label: 'Fair', price: 120000 },
    { label: 'Good', price: 135000 },
    { label: 'Superb', price: 145000 },
  ],

  variants: [
    {
      variantId: 'iphone15-256-blue',
      storage: '256GB',
      color: 'Blue Titanium',
      price: 145000,
      stock: true,
    },
    {
      variantId: 'iphone15-512-natural',
      storage: '512GB',
      color: 'Natural Titanium',
      price: 165000,
      stock: true,
    },
    {
      variantId: 'iphone15-1tb-black',
      storage: '1TB',
      color: 'Black Titanium',
      price: 185000,
      stock: false,
    },
  ],

  addOns: [
    {
      name: 'Screen Protection',
      cost: 1500,
      description: 'Premium tempered glass screen protector',
    },
    {
      name: 'Phone Case',
      cost: 2500,
      description: 'Official Apple leather case',
    },
  ],

  offers: {
    exchangeBonus: 5000,
    bankOffers: [
      '10% off with HDFC Credit Card',
      '5% cashback with SBI Debit Card',
    ],
  },

  rating: {
    average: 4.5,
    totalReviews: 128,
    breakdown: {
      '5star': 75,
      '4star': 35,
      '3star': 12,
      '2star': 4,
      '1star': 2,
    },
  },

  reviews: [
    {
      reviewer: 'John Doe',
      rating: 5,
      date: '2024-01-15',
      comment: 'Excellent condition, works perfectly!',
    },
    {
      reviewer: 'Jane Smith',
      rating: 4,
      date: '2024-01-10',
      comment: 'Good phone, minor scratches but overall satisfied',
    },
  ],

  paymentOptions: {
    emiAvailable: true,
    emiPlans: [
      { months: 3, amountPerMonth: 48333 },
      { months: 6, amountPerMonth: 24167 },
      { months: 12, amountPerMonth: 12083 },
    ],
    methods: ['Credit Card', 'Debit Card', 'UPI', 'Net Banking', 'EMI'],
  },

  availability: {
    inStock: true,
    deliveryPincode: '110001',
    estimatedDelivery: '2-3 business days',
  },

  topSpecs: {
    screenSize: '6.7 inches',
    chipset: 'A17 Pro',
    pixelDensity: '460 PPI',
    networkSupport: '5G',
    simSlots: 'Dual SIM (nano-SIM and eSIM)',
  },

  productDetails: {
    frontCamera: {
      resolution: '12MP',
      setup: 'Single',
      aperture: 'f/2.2',
      flash: 'Retina Flash',
      videoRecording: ['4K@60fps', '1080p@240fps'],
      type: 'Wide',
      features: ['Night Mode', 'Deep Fusion', 'Smart HDR 5'],
    },
    rearCamera: {
      setup: 'Triple',
      camera1: {
        resolution: '48MP',
        aperture: 'f/1.78',
        type: 'Main',
        lens: 'Wide',
      },
      camera2: {
        resolution: '12MP',
        aperture: 'f/2.8',
        type: 'Telephoto',
        lens: '3x Optical Zoom',
      },
      flash: 'True Tone',
      sensor: 'CMOS',
      ois: 'Yes',
      videoRecording: ['4K@60fps', 'ProRes', 'Cinematic Mode'],
      features: ['Night Mode', 'Deep Fusion', 'Smart HDR 5'],
    },
    networkConnectivity: {
      wifi: 'Wi-Fi 6E',
      wifiFeatures: ['MIMO', 'Beamforming'],
      bluetooth: '5.3',
      nfc: 'Yes',
      gps: 'A-GPS, GLONASS',
      volte: 'Yes',
      esim: 'Yes',
      audioJack: 'Lightning',
      has3p5mmJack: false,
      audioFeatures: ['Spatial Audio', 'Dolby Atmos'],
      simSize: 'Nano-SIM',
      simSlots: 'Dual SIM',
      sim1Bands: '2G, 3G, 4G, 5G',
      sim2Bands: '2G, 3G, 4G, 5G',
      networkSupport: '5G',
    },
    display: {
      size: '6.7 inches',
      resolution: '2796 x 1290',
      type: 'Super Retina XDR OLED',
      pixelDensity: '460 PPI',
      refreshRate: '120Hz ProMotion',
      brightness: '2000 nits peak',
      features: ['HDR10', 'Dolby Vision', 'True Tone'],
    },
    general: {
      announcedOn: 'September 2023',
      priceMrp: '₹1,59,900',
      brand: 'Apple',
      marketStatus: 'Available',
      priceStatus: 'Official',
      modelNumber: 'A3108',
    },
    memoryStorage: {
      phoneVariants: ['256GB', '512GB', '1TB'],
      expandableStorage: false,
      ramType: 'LPDDR5',
      storageType: 'NVMe',
    },
    performance: {
      chipset: 'Apple A17 Pro',
      cpu: 'Hexa-core',
      clockSpeed: '3.78 GHz',
      gpu: 'Apple GPU (6-core)',
      os: 'iOS 17',
      architecture: '64-bit',
      processTechnology: '3nm',
    },
    battery: {
      capacity: '4441 mAh',
      type: 'Li-Ion',
      removable: false,
      fastCharging: '27W',
      wirelessCharging: '15W MagSafe',
      reverseCharging: false,
    },
    design: {
      weight: '221g',
      dimensions: {
        height: '159.9 mm',
        width: '76.7 mm',
        thickness: '8.25 mm',
      },
      colors: [
        'Natural Titanium',
        'Blue Titanium',
        'White Titanium',
        'Black Titanium',
      ],
      build: 'Titanium frame, Ceramic Shield front',
      sarValue: '1.07 W/kg',
    },
    sensorsMisc: {
      fingerprintScanner: false,
      sensors: [
        'Face ID',
        'Accelerometer',
        'Gyroscope',
        'Proximity',
        'Compass',
        'Barometer',
      ],
    },
  },

  description:
    'The iPhone 15 Pro Max represents the pinnacle of smartphone technology with its titanium design, A17 Pro chip, and advanced camera system. Perfect for professionals and enthusiasts who demand the best.',

  trustMetrics: {
    devicesSold: 1250,
    qualityChecks: 32,
  },

  relatedProducts: [
    {
      id: 'iphone14pro',
      name: 'iPhone 14 Pro',
      price: 125000,
      image: 'https://example.com/iphone14pro.jpg',
      rating: 4.3,
    },
    {
      id: 'iphone15',
      name: 'iPhone 15',
      price: 95000,
      image: 'https://example.com/iphone15.jpg',
      rating: 4.4,
    },
  ],

  legal: {
    terms: 'Standard terms and conditions apply',
    privacy: 'Privacy policy compliant',
    copyright: '© 2024 Cashify. All rights reserved.',
  },

  isActive: true,
  sortOrder: 1,
};

// Test function to create buy product
async function testCreateBuyProduct() {
  try {
    console.log('🚀 Testing Buy Product Creation API...\n');
    console.log('📦 Dummy Data:', JSON.stringify(dummyBuyProductData, null, 2));

    const response = await axios.post(
      `${BASE_URL}/buy-products`,
      dummyBuyProductData,
      {
        headers: {
          'Content-Type': 'application/json',
          // Add authorization header if needed
          // 'Authorization': 'Bearer YOUR_TOKEN_HERE'
        },
      }
    );

    console.log('\n✅ SUCCESS: Buy Product Created');
    console.log('📊 Response Status:', response.status);
    console.log('📋 Response Data:', JSON.stringify(response.data, null, 2));

    return response.data;
  } catch (error) {
    console.log('\n❌ ERROR: Failed to create buy product');
    console.log('📊 Status:', error.response?.status);
    console.log(
      '📋 Error Message:',
      error.response?.data?.message || error.message
    );
    console.log(
      '📋 Full Error:',
      JSON.stringify(error.response?.data, null, 2)
    );

    return null;
  }
}

// Test function to get all buy products
async function testGetBuyProducts() {
  try {
    console.log('\n🔍 Testing Get Buy Products API...');

    const response = await axios.get(`${BASE_URL}/buy-products?page=1&limit=5`);

    console.log('✅ SUCCESS: Retrieved Buy Products');
    console.log('📊 Response Status:', response.status);
    console.log('📋 Total Products:', response.data.pagination?.total || 0);
    console.log('📋 Products:', JSON.stringify(response.data.data, null, 2));

    return response.data;
  } catch (error) {
    console.log('❌ ERROR: Failed to get buy products');
    console.log('📊 Status:', error.response?.status);
    console.log(
      '📋 Error Message:',
      error.response?.data?.message || error.message
    );

    return null;
  }
}

// Main test function
async function runTests() {
  console.log('🧪 CASHIFY BUY PRODUCT API TESTS');
  console.log('================================\n');

  // Test 1: Create buy product
  const createdProduct = await testCreateBuyProduct();

  // Test 2: Get all buy products
  await testGetBuyProducts();

  // Test 3: Get specific product if created successfully
  if (createdProduct && createdProduct.data && createdProduct.data._id) {
    try {
      console.log('\n🔍 Testing Get Single Buy Product API...');

      const response = await axios.get(
        `${BASE_URL}/buy-products/${createdProduct.data._id}`
      );

      console.log('✅ SUCCESS: Retrieved Single Buy Product');
      console.log('📊 Response Status:', response.status);
      console.log(
        '📋 Product Details:',
        JSON.stringify(response.data.data, null, 2)
      );
    } catch (error) {
      console.log('❌ ERROR: Failed to get single buy product');
      console.log('📊 Status:', error.response?.status);
      console.log(
        '📋 Error Message:',
        error.response?.data?.message || error.message
      );
    }
  }

  console.log('\n🏁 Tests Completed!');
}

// Run the tests
if (require.main === module) {
  runTests();
}

module.exports = {
  testCreateBuyProduct,
  testGetBuyProducts,
  dummyBuyProductData,
};
