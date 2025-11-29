const axios = require('axios');

// Configuration
const BASE_URL = 'http://localhost:5000/api/v1';
const API_ENDPOINT = `${BASE_URL}/buy-products`;

// Test data
const validCategoryId = '507f1f77bcf86cd799439011'; // Replace with actual category ID
const adminToken = 'your-admin-jwt-token-here'; // Replace with actual admin token

// Valid product payload
const validProductPayload = {
  categoryId: validCategoryId,
  name: 'iPhone 14 Pro Max',
  brand: 'Apple',
  isRefurbished: false,
  images: [
    'https://example.com/image1.jpg',
    'https://example.com/image2.jpg'
  ],
  badges: {
    qualityChecks: '32-Point Quality Check',
    warranty: '6 Month Warranty',
    refundPolicy: '7 Day Return',
    assurance: 'Cashify Assured'
  },
  pricing: {
    mrp: 129900,
    discountedPrice: 119900,
    discountPercent: 8
  },
  conditionOptions: [
    {
      label: 'Excellent',
      price: 119900
    },
    {
      label: 'Good',
      price: 109900
    }
  ],
  variants: [
    {
      variantId: 'iphone14pro-256gb-purple',
      storage: '256GB',
      color: 'Deep Purple',
      price: 119900,
      stock: true
    }
  ],
  addOns: [
    {
      name: 'Screen Protection',
      cost: 999,
      description: 'Tempered glass screen protector'
    }
  ],
  offers: [
    {
      type: 'Exchange',
      value: 'Up to ₹10,000 off',
      conditions: 'On exchange of old device'
    }
  ],
  rating: {
    average: 4.5,
    totalReviews: 1250
  },
  reviews: [
    {
      reviewer: 'John Doe',
      rating: 5,
      comment: 'Excellent condition, works perfectly!'
    }
  ],
  paymentOptions: {
    emiAvailable: true,
    emiPlans: ['3 months', '6 months', '12 months'],
    methods: ['Credit Card', 'Debit Card', 'UPI', 'Net Banking']
  },
  availability: {
    inStock: true,
    deliveryPincode: '110001',
    estimatedDelivery: '2-3 business days'
  },
  topSpecs: {
    screenSize: '6.7 inches',
    chipset: 'A16 Bionic',
    pixelDensity: '460 PPI',
    networkSupport: '5G, 4G VoLTE',
    simSlots: 'Dual SIM (nano + eSIM)'
  },
  productDetails: {
    frontCamera: {
      resolution: '12MP TrueDepth',
      features: ['Face ID', 'Portrait Mode', '4K Video']
    },
    rearCamera: {
      setup: 'Triple Camera (48MP + 12MP + 12MP)',
      features: ['ProRAW', 'ProRes Video', 'Cinematic Mode']
    },
    networkConnectivity: {
      wifi: 'Wi-Fi 6',
      wifiFeatures: ['802.11ax', 'MIMO', 'Bluetooth 5.3'],
      has3p5mmJack: false
    },
    display: {
      type: 'Super Retina XDR OLED',
      size: '6.7 inches'
    },
    general: {
      brand: 'Apple',
      modelNumber: 'A2894'
    },
    memoryStorage: {
      phoneVariants: ['128GB', '256GB', '512GB', '1TB'],
      expandableStorage: false
    },
    performance: {
      chipset: 'Apple A16 Bionic',
      os: 'iOS 16'
    },
    battery: {
      type: 'Li-Ion 4323 mAh'
    },
    design: {
      colors: ['Deep Purple', 'Gold', 'Silver', 'Space Black'],
      weight: '240g'
    },
    sensorsMisc: {
      fingerprintScanner: false,
      sensors: ['Face ID', 'Accelerometer', 'Gyroscope', 'Proximity', 'Compass']
    }
  },
  description: 'The iPhone 14 Pro Max features the most advanced Pro camera system ever, A16 Bionic chip, and a stunning 6.7-inch Super Retina XDR display with ProMotion.',
  trustMetrics: {
    devicesSold: 15000,
    qualityChecks: 32
  },
  relatedProducts: [
    {
      id: '507f1f77bcf86cd799439012',
      name: 'iPhone 14 Pro',
      price: 109900
    }
  ],
  legal: {
    terms: 'Standard terms and conditions apply',
    privacy: 'Privacy policy compliant',
    copyright: '© 2024 Cashify'
  },
  isActive: true,
  sortOrder: 1
};

// Invalid payloads for testing validation
const invalidPayloads = [
  {
    name: 'Missing required fields',
    payload: {
      name: 'Test Product'
      // Missing categoryId and brand
    }
  },
  {
    name: 'Invalid category ID format',
    payload: {
      categoryId: 'invalid-id',
      name: 'Test Product',
      brand: 'Test Brand'
    }
  },
  {
    name: 'Invalid pricing values',
    payload: {
      categoryId: validCategoryId,
      name: 'Test Product',
      brand: 'Test Brand',
      pricing: {
        mrp: -100, // Negative price
        discountPercent: 150 // Invalid percentage
      }
    }
  },
  {
    name: 'Invalid rating',
    payload: {
      categoryId: validCategoryId,
      name: 'Test Product',
      brand: 'Test Brand',
      rating: {
        average: 6, // Rating above 5
        totalReviews: -5 // Negative reviews
      }
    }
  },
  {
    name: 'Invalid images array',
    payload: {
      categoryId: validCategoryId,
      name: 'Test Product',
      brand: 'Test Brand',
      images: ['not-a-valid-url', 'also-not-valid']
    }
  }
];

// Test functions
async function testValidProductCreation() {
  console.log('\n🧪 Testing valid product creation...');
  try {
    const response = await axios.post(API_ENDPOINT, validProductPayload, {
      headers: {
        'Authorization': `Bearer ${adminToken}`,
        'Content-Type': 'application/json'
      }
    });
    
    console.log('✅ Valid product creation successful');
    console.log('Response status:', response.status);
    console.log('Product ID:', response.data.data?._id);
    console.log('Product name:', response.data.data?.name);
    return response.data.data;
  } catch (error) {
    console.log('❌ Valid product creation failed');
    console.log('Error status:', error.response?.status);
    console.log('Error message:', error.response?.data?.message);
    console.log('Validation errors:', error.response?.data?.errors);
  }
}

async function testInvalidPayloads() {
  console.log('\n🧪 Testing invalid payloads...');
  
  for (const testCase of invalidPayloads) {
    console.log(`\n📋 Testing: ${testCase.name}`);
    try {
      const response = await axios.post(API_ENDPOINT, testCase.payload, {
        headers: {
          'Authorization': `Bearer ${adminToken}`,
          'Content-Type': 'application/json'
        }
      });
      
      console.log('❌ Expected validation error but request succeeded');
      console.log('Response status:', response.status);
    } catch (error) {
      if (error.response?.status === 400) {
        console.log('✅ Validation error caught correctly');
        console.log('Error message:', error.response.data.message);
        if (error.response.data.errors) {
          console.log('Validation errors:');
          error.response.data.errors.forEach(err => {
            console.log(`  - ${err.field}: ${err.message}`);
          });
        }
      } else {
        console.log('❌ Unexpected error');
        console.log('Error status:', error.response?.status);
        console.log('Error message:', error.response?.data?.message);
      }
    }
  }
}

async function testProductRetrieval(productId) {
  console.log('\n🧪 Testing product retrieval...');
  try {
    const response = await axios.get(`${API_ENDPOINT}/${productId}`);
    console.log('✅ Product retrieval successful');
    console.log('Product name:', response.data.data?.name);
    console.log('Product brand:', response.data.data?.brand);
  } catch (error) {
    console.log('❌ Product retrieval failed');
    console.log('Error status:', error.response?.status);
    console.log('Error message:', error.response?.data?.message);
  }
}

async function testProductUpdate(productId) {
  console.log('\n🧪 Testing product update...');
  const updatePayload = {
    name: 'Updated iPhone 14 Pro Max',
    pricing: {
      mrp: 125900,
      discountedPrice: 115900,
      discountPercent: 8
    }
  };
  
  try {
    const response = await axios.put(`${API_ENDPOINT}/${productId}`, updatePayload, {
      headers: {
        'Authorization': `Bearer ${adminToken}`,
        'Content-Type': 'application/json'
      }
    });
    
    console.log('✅ Product update successful');
    console.log('Updated name:', response.data.data?.name);
    console.log('Updated price:', response.data.data?.pricing?.discountedPrice);
  } catch (error) {
    console.log('❌ Product update failed');
    console.log('Error status:', error.response?.status);
    console.log('Error message:', error.response?.data?.message);
    if (error.response?.data?.errors) {
      console.log('Validation errors:');
      error.response.data.errors.forEach(err => {
        console.log(`  - ${err.field}: ${err.message}`);
      });
    }
  }
}

// Main test runner
async function runTests() {
  console.log('🚀 Starting BuyProduct API Tests');
  console.log('=====================================');
  
  // Test 1: Valid product creation
  const createdProduct = await testValidProductCreation();
  
  // Test 2: Invalid payloads
  await testInvalidPayloads();
  
  // Test 3: Product retrieval (if product was created)
  if (createdProduct?._id) {
    await testProductRetrieval(createdProduct._id);
    await testProductUpdate(createdProduct._id);
  }
  
  console.log('\n🏁 Tests completed');
  console.log('=====================================');
}

// Instructions for running the tests
console.log(`
📋 INSTRUCTIONS FOR RUNNING TESTS:
==================================

1. Make sure your server is running on ${BASE_URL}
2. Update the following variables in this file:
   - validCategoryId: Replace with a valid category ID from your database
   - adminToken: Replace with a valid admin JWT token

3. Install axios if not already installed:
   npm install axios

4. Run the tests:
   node test/buyProduct.api.test.js

5. Check the console output for test results

Note: These tests will create actual data in your database.
Make sure to run them in a development environment.
`);

// Uncomment the line below to run tests automatically
// runTests();

module.exports = {
  runTests,
  testValidProductCreation,
  testInvalidPayloads,
  testProductRetrieval,
  testProductUpdate
};