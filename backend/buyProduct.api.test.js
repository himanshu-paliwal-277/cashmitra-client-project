// buy-product.e2e.test.js
// End-to-end test script for BuyProduct API (create → get → list → update → delete)
//
// Usage examples:
//   node buy-product.e2e.test.js
//   BASE_URL=http://127.0.0.1:5000/api CATEGORY_ID=68ded4d10abfa075fd99a13f node buy-product.e2e.test.js
//
// Notes:
// - No health-check here (per your request).
// - Ensure your server is listening on BASE_URL and the route is mounted at /buy-products.

const axios = require('axios');

// ---------- Config ----------
const BASE_URL = (process.env.BASE_URL || 'http://127.0.0.1:5000/api').replace(/\/$/, '');
const CATEGORY_ID = process.env.CATEGORY_ID || '68ded4d10abfa075fd99a13f';

// ---------- Helpers ----------
function logAxiosErr(err, label) {
  console.error(`\n❌ ${label}`);
  console.error('Message:', err.message);
  if (err.code) console.error('Code:', err.code);
  if (err.config) {
    console.error('URL:', err.config.url);
    console.error('Method:', err.config.method);
    console.error('Timeout(ms):', err.config.timeout);
  }
  if (err.response) {
    console.error('Status:', err.response.status);
    console.error('Data:', JSON.stringify(err.response.data, null, 2));
  } else if (err.request) {
    console.error('No response received (network/connection issue).');
  }
}

function uniqSuffix() {
  return Date.now().toString(36);
}

// ---------- Comprehensive Payload (covers almost all schema fields) ----------
function buildValidProductData() {
  const uniq = uniqSuffix();
  return {
    categoryId: CATEGORY_ID,
    name: `iPhone 14 Pro ${uniq}`,
    brand: 'Apple',
    isRefurbished: false,

    images: [
      'https://cdn.example.com/products/iphone14pro/front.jpg',
      'https://cdn.example.com/products/iphone14pro/back.jpg',
    ],

    badges: {
      qualityChecks: '32-Point Quality Check',
      warranty: '6 Months Warranty',
      refundPolicy: '10 Days Return',
      assurance: 'Cashify Assured',
    },

    pricing: {
      mrp: 129900,
      discountedPrice: 119900,
      discountPercent: 8,
    },

    conditionOptions: [
      { label: 'Fair', price: 109900 },
      { label: 'Good', price: 115000 },
      { label: 'Superb', price: 119900 },
    ],

    variants: [
      {
        variantId: `iphone14pro-128-deeppurple-${uniq}`,
        storage: '128GB',
        color: 'Deep Purple',
        price: 119900,
        stock: true,
      },
      {
        variantId: `iphone14pro-256-gold-${uniq}`,
        storage: '256GB',
        color: 'Gold',
        price: 129900,
        stock: true,
      },
      {
        variantId: `iphone14pro-512-spaceblack-${uniq}`,
        storage: '512GB',
        color: 'Space Black',
        price: 149900,
        stock: false,
      },
    ],

    addOns: [
      { name: 'Screen Protection', cost: 999, description: 'Premium tempered glass' },
      { name: 'Back Cover', cost: 699, description: 'Matte shockproof case' },
      {
        name: '1-Year Accidental Damage Plan',
        cost: 3999,
        description: 'Covers accidental damage',
      },
    ],

    offers: [
      { type: 'Membership', value: 'Extra 5% off', conditions: 'For Plus members' },
      { type: 'Bank', value: '₹2000 instant discount', conditions: 'ABC Bank Credit Cards' },
    ],

    rating: {
      average: 4.6,
      totalReviews: 248,
      breakdown: {
        '5star': 180,
        '4star': 45,
        '3star': 15,
        '2star': 6,
        '1star': 2,
      },
    },

    reviews: [
      { reviewer: 'John Doe', rating: 5, date: '2024-01-15', comment: 'Excellent condition!' },
      {
        reviewer: 'Aisha K.',
        rating: 4,
        date: '2024-03-02',
        comment: 'Battery health good, minor scratches.',
      },
      {
        reviewer: 'Rahul S.',
        rating: 5,
        date: '2024-05-18',
        comment: 'As good as new. Fast delivery.',
      },
    ],

    paymentOptions: {
      emiAvailable: true,
      emiPlans: [
        { months: 3, amountPerMonth: 39967 },
        { months: 6, amountPerMonth: 19983 },
        { months: 12, amountPerMonth: 9992 },
      ],
      methods: ['UPI', 'NetBanking', 'Credit Card', 'Debit Card', 'Wallet'],
    },

    availability: {
      inStock: true,
      deliveryPincode: '110001',
      estimatedDelivery: '2-3 days',
    },

    topSpecs: {
      screenSize: '6.1 inches',
      chipset: 'A16 Bionic',
      pixelDensity: '460 ppi',
      networkSupport: '5G, 4G, 3G, 2G',
      simSlots: 'Dual SIM',
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
        camera1: { resolution: '48MP', aperture: 'f/1.78', type: 'Main', lens: 'Wide' },
        camera2: {
          resolution: '12MP',
          aperture: 'f/2.8',
          type: 'Telephoto',
          lens: '3x Optical Zoom',
        },
        flash: 'Dual-LED dual-tone',
        sensor: 'Quad-pixel',
        ois: 'Sensor-shift OIS',
        videoRecording: ['4K@60fps', 'ProRes', 'Cinematic Mode 4K@30fps'],
        features: ['Night Mode', 'Macro', 'Photonic Engine'],
      },
      networkConnectivity: {
        wifi: 'Wi-Fi 6',
        wifiFeatures: ['Hotspot', 'Wi-Fi calling'],
        bluetooth: '5.3',
        nfc: 'Yes',
        gps: 'A-GPS, GLONASS, GALILEO, QZSS, BeiDou',
        volte: 'Yes',
        esim: 'Supported',
        audioJack: 'No',
        has3p5mmJack: false,
        audioFeatures: ['Spatial Audio', 'Dolby Atmos'],
        simSize: 'Nano + eSIM',
        simSlots: 'Dual SIM',
        sim1Bands: '5G/4G/3G/2G',
        sim2Bands: '5G/4G/3G/2G',
        networkSupport: '5G SA/NSA',
      },
      display: {
        size: '6.1 inches',
        resolution: '2556 x 1179',
        technology: 'Super Retina XDR OLED',
        refreshRate: '120Hz ProMotion',
        protection: 'Ceramic Shield',
      },
      general: {
        announcedOn: '2022-09-07',
        priceMrp: '₹129,900',
        brand: 'Apple',
        marketStatus: 'Available',
        priceStatus: 'Stable',
        modelNumber: 'A2890',
      },
      memoryStorage: {
        phoneVariants: ['128GB', '256GB', '512GB', '1TB'],
        expandableStorage: false,
        ramType: 'LPDDR4X',
        storageType: 'NVMe',
      },
      performance: {
        chipset: 'A16 Bionic',
        cpu: 'Hexa-core',
        clockSpeed: 'Up to 3.46 GHz',
        gpu: 'Apple 5-core GPU',
        os: 'iOS 16',
        architecture: '64-bit',
        processTechnology: '4nm',
      },
      battery: {
        capacity: '3200mAh',
        fastCharging: '20W',
        wirelessCharging: '15W MagSafe',
        endurance: 'All-day battery life',
      },
      design: {
        weight: '206g',
        dimensions: { length: '147.5mm', width: '71.5mm', height: '7.85mm' },
        colors: ['Deep Purple', 'Gold', 'Silver', 'Space Black'],
        build: 'Stainless steel frame, Ceramic Shield front',
        sarValue: 'Head: 0.98 W/kg',
      },
      sensorsMisc: {
        fingerprintScanner: false,
        sensors: ['Face ID', 'Gyro', 'Accelerometer', 'Proximity', 'Ambient Light', 'Barometer'],
      },
    },

    description:
      'The iPhone 14 Pro features the A16 Bionic chip, Pro camera system, and ProMotion display.',

    trustMetrics: {
      devicesSold: 50000,
      qualityChecks: 32,
    },

    relatedProducts: [
      {
        id: `iph-14-${uniq}`,
        name: 'iPhone 14',
        price: 79900,
        image: 'https://cdn.example.com/p/iph14.jpg',
        rating: 4.4,
      },
      {
        id: `iph-14-plus-${uniq}`,
        name: 'iPhone 14 Plus',
        price: 89900,
        image: 'https://cdn.example.com/p/iph14plus.jpg',
        rating: 4.5,
      },
    ],

    legal: {
      terms: 'Standard terms apply',
      privacy: 'We value your privacy and comply with applicable laws.',
      copyright: '© 2024',
    },

    isActive: true,
    sortOrder: 10,
  };
}

// ---------- API Calls ----------
async function apiCreate() {
  const payload = buildValidProductData();
  try {
    const res = await axios.post(`${BASE_URL}/buy-products`, payload, {
      timeout: 15000,
      proxy: false,
      headers: { 'Content-Type': 'application/json' },
    });
    const item = res.data?.data;
    console.log('\n✅ Created: ', item?._id, '-', item?.name);
    return item?._id;
  } catch (err) {
    logAxiosErr(err, 'Create product failed');
    return null;
  }
}

async function apiGet(id) {
  try {
    const res = await axios.get(`${BASE_URL}/buy-products/${id}`, { timeout: 15000, proxy: false });
    const item = res.data?.data;
    console.log('✅ Fetched by ID:', item?._id, '-', item?.name);
  } catch (err) {
    logAxiosErr(err, 'Get product by ID failed');
  }
}

async function apiList(q = 'iphone', page = 1, limit = 5) {
  try {
    const res = await axios.get(`${BASE_URL}/buy-products`, {
      params: { q, page, limit },
      timeout: 15000,
      proxy: false,
    });
    const items = res.data?.data || [];
    console.log(`✅ Listed (${items.length}) items. First:`, items[0]?._id, '-', items[0]?.name);
  } catch (err) {
    logAxiosErr(err, 'List products failed');
  }
}

async function apiUpdate(id) {
  try {
    const patch = {
      name: `iPhone 14 Pro (Updated ${uniqSuffix()})`,
      pricing: { mrp: 129900, discountedPrice: 114900, discountPercent: 12 },
      isActive: true,
    };
    const res = await axios.put(`${BASE_URL}/buy-products/${id}`, patch, {
      timeout: 15000,
      proxy: false,
      headers: { 'Content-Type': 'application/json' },
    });
    console.log('✅ Updated: ', res.data?.data?._id, '-', res.data?.data?.name);
  } catch (err) {
    logAxiosErr(err, 'Update product failed');
  }
}

async function apiDelete(id) {
  try {
    const res = await axios.delete(`${BASE_URL}/buy-products/${id}`, { timeout: 15000, proxy: false });
    console.log('✅ Deleted:', id, '-', res.data?.message || 'OK');
  } catch (err) {
    logAxiosErr(err, 'Delete product failed');
  }
}

// ---------- Run ----------
(async function run() {
  console.log('BASE_URL:', BASE_URL);
  console.log('CATEGORY_ID:', CATEGORY_ID);

  // CREATE
  const id = await apiCreate();
  if (!id) {
    console.log('\n⚠️ Create did not return an ID. Aborting further steps.');
    return;
  }


  console.log('\n🏁 E2E test finished.');
})();
