// Enhanced product data for Cashify-style Product Details page
// Includes multiple SKUs, variants, reviews, Q&A, and comprehensive specifications

export const productDetailsData = {
  'mob-001': {
    id: 'mob-001',
    title: 'iPhone 12',
    brand: 'Apple',
    model: 'iPhone 12',
    category: 'mobile',
    baseSpecs: 'Refurbished, Excellent Condition',
    conditionGrade: 'A',
    conditionBadge: 'Certified Used',
    verifiedBadge: 'Verified by Cashmitra',
    overallRating: 4.4,
    totalReviews: 2183,
    totalQuestions: 500,
    
    // SKU variants with different RAM/Storage combinations
    skus: {
      '4gb-64gb-blue': {
        id: '4gb-64gb-blue',
        ram: '4GB',
        storage: '64GB',
        color: 'Pacific Blue',
        price: 45999,
        mrp: 79900,
        discount: 42,
        availability: {
          inStock: true,
          stockCount: 8,
          deliveryDays: '2-3',
          deliveryFee: 0
        },
        images: [
          'https://images.unsplash.com/photo-1592750475338-74b7b21085ab?w=500&h=500&fit=crop',
          'https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=500&h=500&fit=crop',
          'https://images.unsplash.com/photo-1565849904461-04a58ad377e0?w=500&h=500&fit=crop',
          'https://images.unsplash.com/photo-1574944985070-8f3ebc6b79d2?w=500&h=500&fit=crop',
          'https://images.unsplash.com/photo-1556656793-08538906a9f8?w=500&h=500&fit=crop'
        ],
        thumbnails: [
          { type: 'image', url: 'https://images.unsplash.com/photo-1592750475338-74b7b21085ab?w=100&h=100&fit=crop' },
          { type: 'image', url: 'https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=100&h=100&fit=crop' },
          { type: 'image', url: 'https://images.unsplash.com/photo-1565849904461-04a58ad377e0?w=100&h=100&fit=crop' },
          { type: 'image', url: 'https://images.unsplash.com/photo-1574944985070-8f3ebc6b79d2?w=100&h=100&fit=crop' },
          { type: '360', url: 'https://images.unsplash.com/photo-1556656793-08538906a9f8?w=100&h=100&fit=crop', badge: '360°' }
        ]
      },
      '6gb-128gb-blue': {
        id: '6gb-128gb-blue',
        ram: '6GB',
        storage: '128GB',
        color: 'Pacific Blue',
        price: 52999,
        mrp: 89900,
        discount: 41,
        availability: {
          inStock: true,
          stockCount: 15,
          deliveryDays: '2-3',
          deliveryFee: 0
        },
        images: [
          'https://images.unsplash.com/photo-1592750475338-74b7b21085ab?w=500&h=500&fit=crop',
          'https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=500&h=500&fit=crop',
          'https://images.unsplash.com/photo-1565849904461-04a58ad377e0?w=500&h=500&fit=crop',
          'https://images.unsplash.com/photo-1574944985070-8f3ebc6b79d2?w=500&h=500&fit=crop',
          'https://images.unsplash.com/photo-1556656793-08538906a9f8?w=500&h=500&fit=crop',
          'https://images.unsplash.com/photo-1607936854279-55e8f4bc0b9a?w=500&h=500&fit=crop'
        ],
        thumbnails: [
          { type: 'image', url: 'https://images.unsplash.com/photo-1592750475338-74b7b21085ab?w=100&h=100&fit=crop' },
          { type: 'image', url: 'https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=100&h=100&fit=crop' },
          { type: 'image', url: 'https://images.unsplash.com/photo-1565849904461-04a58ad377e0?w=100&h=100&fit=crop' },
          { type: 'image', url: 'https://images.unsplash.com/photo-1574944985070-8f3ebc6b79d2?w=100&h=100&fit=crop' },
          { type: '360', url: 'https://images.unsplash.com/photo-1556656793-08538906a9f8?w=100&h=100&fit=crop', badge: '360°' },
          { type: 'video', url: 'https://images.unsplash.com/photo-1607936854279-55e8f4bc0b9a?w=100&h=100&fit=crop', badge: 'Video' }
        ]
      },
      '6gb-256gb-blue': {
        id: '6gb-256gb-blue',
        ram: '6GB',
        storage: '256GB',
        color: 'Pacific Blue',
        price: 59999,
        mrp: 99900,
        discount: 40,
        availability: {
          inStock: true,
          stockCount: 12,
          deliveryDays: '2-3',
          deliveryFee: 0
        },
        images: [
          'https://images.unsplash.com/photo-1592750475338-74b7b21085ab?w=500&h=500&fit=crop',
          'https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=500&h=500&fit=crop',
          'https://images.unsplash.com/photo-1565849904461-04a58ad377e0?w=500&h=500&fit=crop',
          'https://images.unsplash.com/photo-1574944985070-8f3ebc6b79d2?w=500&h=500&fit=crop',
          'https://images.unsplash.com/photo-1556656793-08538906a9f8?w=500&h=500&fit=crop',
          'https://images.unsplash.com/photo-1607936854279-55e8f4bc0b9a?w=500&h=500&fit=crop',
          'https://images.unsplash.com/photo-1605236453806-b25e5d5cce04?w=500&h=500&fit=crop'
        ],
        thumbnails: [
          { type: 'image', url: 'https://images.unsplash.com/photo-1592750475338-74b7b21085ab?w=100&h=100&fit=crop' },
          { type: 'image', url: 'https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=100&h=100&fit=crop' },
          { type: 'image', url: 'https://images.unsplash.com/photo-1565849904461-04a58ad377e0?w=100&h=100&fit=crop' },
          { type: 'image', url: 'https://images.unsplash.com/photo-1574944985070-8f3ebc6b79d2?w=100&h=100&fit=crop' },
          { type: '360', url: 'https://images.unsplash.com/photo-1556656793-08538906a9f8?w=100&h=100&fit=crop', badge: '360°' },
          { type: 'video', url: 'https://images.unsplash.com/photo-1607936854279-55e8f4bc0b9a?w=100&h=100&fit=crop', badge: 'Video' },
          { type: 'image', url: 'https://images.unsplash.com/photo-1605236453806-b25e5d5cce04?w=100&h=100&fit=crop' }
        ]
      },
      // Black color variants
      '6gb-128gb-black': {
        id: '6gb-128gb-black',
        ram: '6GB',
        storage: '128GB',
        color: 'Black',
        price: 53999,
        mrp: 89900,
        discount: 40,
        availability: {
          inStock: true,
          stockCount: 6,
          deliveryDays: '3-4',
          deliveryFee: 0
        },
        images: [
          'https://images.unsplash.com/photo-1556656793-08538906a9f8?w=500&h=500&fit=crop',
          'https://images.unsplash.com/photo-1607936854279-55e8f4bc0b9a?w=500&h=500&fit=crop',
          'https://images.unsplash.com/photo-1605236453806-b25e5d5cce04?w=500&h=500&fit=crop',
          'https://images.unsplash.com/photo-1574944985070-8f3ebc6b79d2?w=500&h=500&fit=crop'
        ],
        thumbnails: [
          { type: 'image', url: 'https://images.unsplash.com/photo-1556656793-08538906a9f8?w=100&h=100&fit=crop' },
          { type: 'image', url: 'https://images.unsplash.com/photo-1607936854279-55e8f4bc0b9a?w=100&h=100&fit=crop' },
          { type: 'image', url: 'https://images.unsplash.com/photo-1605236453806-b25e5d5cce04?w=100&h=100&fit=crop' },
          { type: '360', url: 'https://images.unsplash.com/photo-1574944985070-8f3ebc6b79d2?w=100&h=100&fit=crop', badge: '360°' }
        ]
      },
      // Out of stock variant
      '8gb-512gb-white': {
        id: '8gb-512gb-white',
        ram: '8GB',
        storage: '512GB',
        color: 'White',
        price: 74999,
        mrp: 119900,
        discount: 37,
        availability: {
          inStock: false,
          stockCount: 0,
          deliveryDays: '7-10',
          deliveryFee: 0
        },
        images: [
          'https://images.unsplash.com/photo-1605236453806-b25e5d5cce04?w=500&h=500&fit=crop',
          'https://images.unsplash.com/photo-1574944985070-8f3ebc6b79d2?w=500&h=500&fit=crop'
        ],
        thumbnails: [
          { type: 'image', url: 'https://images.unsplash.com/photo-1605236453806-b25e5d5cce04?w=100&h=100&fit=crop' },
          { type: 'image', url: 'https://images.unsplash.com/photo-1574944985070-8f3ebc6b79d2?w=100&h=100&fit=crop' }
        ]
      }
    },
    
    // Available variants for selection
    variants: {
      ram: [
        { id: '4gb', label: '4GB', available: true },
        { id: '6gb', label: '6GB', available: true },
        { id: '8gb', label: '8GB', available: false }
      ],
      storage: [
        { id: '64gb', label: '64GB', available: true },
        { id: '128gb', label: '128GB', available: true },
        { id: '256gb', label: '256GB', available: true },
        { id: '512gb', label: '512GB', available: false }
      ],
      color: [
        { id: 'blue', label: 'Pacific Blue', hex: '#1f4e79', available: true },
        { id: 'black', label: 'Black', hex: '#000000', available: true },
        { id: 'white', label: 'White', hex: '#ffffff', available: false }
      ]
    },
    
    // Default selected variant
    defaultSku: '6gb-128gb-blue',
    
    // Offers and promotions
    offers: [
      {
        type: 'coupon',
        title: 'SAVE500',
        description: 'Get ₹500 off on orders above ₹50,000',
        discount: 500
      },
      {
        type: 'exchange',
        title: 'Exchange Offer',
        description: 'Get up to ₹15,000 off on exchange of your old phone',
        maxDiscount: 15000
      },
      {
        type: 'emi',
        title: 'No Cost EMI',
        description: 'Starting from ₹2,208/month for 24 months',
        monthlyEmi: 2208
      }
    ],
    
    // Key highlights
    highlights: [
      { label: 'Chipset', value: 'A14 Bionic' },
      { label: 'Display', value: '6.1" Super Retina XDR' },
      { label: 'Battery', value: '2815 mAh' },
      { label: 'Camera', value: '12MP Dual Camera' },
      { label: 'OS', value: 'iOS 14' }
    ],
    
    // Condition details
    conditionDetails: {
      grade: 'A',
      description: 'Grade A: negligible wear, 95% battery health, fully functional',
      batteryHealth: 95,
      boxContents: [
        { item: 'iPhone 12', included: true },
        { item: 'Lightning Cable', included: true },
        { item: 'Power Adapter', included: true },
        { item: 'SIM Ejector Tool', included: true },
        { item: 'Original Box', included: false },
        { item: 'EarPods', included: false }
      ]
    },
    
    // Seller information
    seller: {
      name: 'TechHub Store',
      rating: 4.6,
      location: 'Mumbai, Maharashtra',
      distance: '1.2 km',
      warrantyProvider: true,
      verified: true
    },
    
    // Specifications (variant-bound fields will be updated dynamically)
    specifications: {
      'General': {
        'Brand': 'Apple',
        'Model': 'iPhone 12',
        'Color': 'Pacific Blue', // variant-bound
        'Condition': 'Excellent',
        'Storage': '128GB', // variant-bound
        'RAM': '6GB' // variant-bound
      },
      'Display': {
        'Screen Size': '6.1 inches',
        'Resolution': '2532 x 1170 pixels',
        'Technology': 'Super Retina XDR OLED',
        'Refresh Rate': '60Hz',
        'Brightness': '625 nits (typical)'
      },
      'Performance': {
        'Processor': 'A14 Bionic chip',
        'CPU': '6-core CPU with 2 performance and 4 efficiency cores',
        'GPU': '4-core GPU',
        'Neural Engine': '16-core Neural Engine',
        'Operating System': 'iOS 14'
      },
      'Camera': {
        'Rear Camera': '12MP Dual Camera System',
        'Main Camera': '12MP, f/1.6 aperture',
        'Ultra Wide': '12MP, f/2.4 aperture, 120° field of view',
        'Front Camera': '12MP TrueDepth',
        'Video Recording': '4K Dolby Vision HDR recording'
      },
      'Battery & Charging': {
        'Battery Capacity': '2815 mAh',
        'Video Playback': 'Up to 17 hours',
        'Wireless Charging': 'MagSafe and Qi wireless charging',
        'Fast Charging': '20W fast charging'
      },
      'Connectivity': {
        'Network': '5G, 4G LTE',
        'Wi-Fi': 'Wi-Fi 6 (802.11ax)',
        'Bluetooth': 'Bluetooth 5.0',
        'NFC': 'Yes',
        'Lightning': 'Lightning connector'
      },
      'Physical': {
        'Dimensions': '146.7 x 71.5 x 7.4 mm',
        'Weight': '164 grams',
        'Build': 'Aluminum frame with glass back',
        'Water Resistance': 'IP68'
      }
    },
    
    // Warranty and return policy
    warranty: {
      period: '12 months',
      provider: 'Seller warranty',
      coverage: 'Manufacturing defects and hardware issues',
      exclusions: ['Physical damage', 'Water damage', 'Software issues'],
      returnWindow: 7,
      returnPolicy: 'No questions asked return within 7 days'
    },
    
    // Reviews and ratings
    reviews: {
      summary: {
        averageRating: 4.4,
        totalReviews: 2183,
        ratingDistribution: {
          5: 1256,
          4: 654,
          3: 198,
          2: 52,
          1: 23
        }
      },
      filters: {
        variants: ['All Variants', '4GB/64GB', '6GB/128GB', '6GB/256GB'],
        conditions: ['All Conditions', 'Excellent', 'Very Good', 'Good'],
        withPhotos: false,
        sortBy: 'most_helpful' // most_helpful, most_recent, highest_rating, lowest_rating
      },
      list: [
        {
          id: 'rev-001',
          userName: 'Raj K.',
          rating: 5,
          date: '2024-01-15',
          variant: '6GB/128GB',
          condition: 'Excellent',
          title: 'Excellent condition, works like new!',
          content: 'Bought this iPhone 12 and I\'m extremely satisfied. The condition is exactly as described - looks and feels like a brand new phone. Battery life is great, camera quality is superb. Delivery was quick and packaging was secure.',
          pros: ['Excellent condition', 'Fast delivery', 'Great battery life', 'Perfect camera quality'],
          cons: ['None so far'],
          helpful: 45,
          verified: true,
          photos: [
            'https://images.unsplash.com/photo-1592750475338-74b7b21085ab?w=150&h=150&fit=crop',
            'https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=150&h=150&fit=crop'
          ]
        },
        {
          id: 'rev-002',
          userName: 'Priya S.',
          rating: 4,
          date: '2024-01-12',
          variant: '6GB/256GB',
          condition: 'Excellent',
          title: 'Good phone, minor scratches',
          content: 'Overall a good purchase. The phone works perfectly and all features are functional. There are some very minor scratches on the back which are barely visible. For the price, it\'s a great deal.',
          pros: ['Good value for money', 'All features working', 'Fast performance'],
          cons: ['Minor scratches on back'],
          helpful: 32,
          verified: true,
          photos: []
        },
        {
          id: 'rev-003',
          userName: 'Amit M.',
          rating: 5,
          date: '2024-01-10',
          variant: '4GB/64GB',
          condition: 'Very Good',
          title: 'Perfect for my needs',
          content: 'Needed a reliable phone for daily use and this fits perfectly. The 64GB storage is sufficient for my usage. Phone is in very good condition with minimal signs of use. Highly recommended for anyone looking for a budget-friendly iPhone.',
          pros: ['Affordable price', 'Good condition', 'Reliable performance'],
          cons: ['Limited storage for heavy users'],
          helpful: 28,
          verified: true,
          photos: [
            'https://images.unsplash.com/photo-1565849904461-04a58ad377e0?w=150&h=150&fit=crop'
          ]
        },
        {
          id: 'rev-004',
          userName: 'Sneha R.',
          rating: 4,
          date: '2024-01-08',
          variant: '6GB/128GB',
          condition: 'Excellent',
          title: 'Great camera quality',
          content: 'The camera quality is amazing! Photos come out crisp and clear. The phone is in excellent condition as advertised. Only minor complaint is that the battery drains a bit faster than expected, but overall very satisfied.',
          pros: ['Excellent camera', 'Good condition', 'Fast shipping'],
          cons: ['Battery could be better'],
          helpful: 19,
          verified: true,
          photos: []
        },
        {
          id: 'rev-005',
          userName: 'Vikram T.',
          rating: 3,
          date: '2024-01-05',
          variant: '6GB/128GB',
          condition: 'Good',
          title: 'Decent phone but has some issues',
          content: 'Phone works fine for basic usage but I noticed some lag while multitasking. The condition is as described - good but with visible signs of use. Customer service was helpful when I had questions.',
          pros: ['Responsive customer service', 'Honest condition description'],
          cons: ['Some performance lag', 'Visible wear marks'],
          helpful: 12,
          verified: true,
          photos: []
        },
        {
          id: 'rev-006',
          userName: 'Kavya P.',
          rating: 5,
          date: '2024-01-03',
          variant: '6GB/256GB',
          condition: 'Excellent',
          title: 'Exceeded expectations!',
          content: 'This phone exceeded my expectations in every way. The condition is pristine, almost like new. The 256GB storage is perfect for all my apps and photos. The seller was very professional and the phone arrived exactly as described.',
          pros: ['Pristine condition', 'Ample storage', 'Professional seller', 'Fast delivery'],
          cons: [],
          helpful: 67,
          verified: true,
          photos: [
            'https://images.unsplash.com/photo-1574944985070-8f3ebc6b79d2?w=150&h=150&fit=crop',
            'https://images.unsplash.com/photo-1556656793-08538906a9f8?w=150&h=150&fit=crop',
            'https://images.unsplash.com/photo-1607936854279-55e8f4bc0b9a?w=150&h=150&fit=crop'
          ]
        }
      ]
    },
    
    // Q&A Section
    questions: {
      list: [
        {
          id: 'qa-001',
          question: 'What is the battery health of this device?',
          askedBy: 'Anonymous',
          askedDate: '2024-01-14',
          upvotes: 23,
          answer: {
            content: 'The battery health is 95% as mentioned in the product description. All our devices undergo thorough battery testing before listing.',
            answeredBy: 'TechHub Store',
            answeredDate: '2024-01-14',
            verified: true
          }
        },
        {
          id: 'qa-002',
          question: 'Is the original charger included?',
          askedBy: 'Rohit K.',
          askedDate: '2024-01-12',
          upvotes: 18,
          answer: {
            content: 'Yes, we include a Lightning cable and power adapter with every iPhone. However, the original Apple charger may not be included - we provide a compatible charger that works perfectly.',
            answeredBy: 'TechHub Store',
            answeredDate: '2024-01-12',
            verified: true
          }
        },
        {
          id: 'qa-003',
          question: 'Can I return the phone if I\'m not satisfied?',
          askedBy: 'Meera S.',
          askedDate: '2024-01-10',
          upvotes: 15,
          answer: {
            content: 'Absolutely! We offer a 7-day no-questions-asked return policy. The phone should be in the same condition as received for a full refund.',
            answeredBy: 'TechHub Store',
            answeredDate: '2024-01-10',
            verified: true
          }
        },
        {
          id: 'qa-004',
          question: 'Is this phone unlocked to all networks?',
          askedBy: 'Arjun M.',
          askedDate: '2024-01-08',
          upvotes: 12,
          answer: {
            content: 'Yes, this iPhone 12 is factory unlocked and will work with all major carriers in India including Jio, Airtel, Vi, and BSNL.',
            answeredBy: 'TechHub Store',
            answeredDate: '2024-01-08',
            verified: true
          }
        },
        {
          id: 'qa-005',
          question: 'What warranty is provided with this device?',
          askedBy: 'Divya R.',
          askedDate: '2024-01-06',
          upvotes: 9,
          answer: {
            content: 'We provide a 12-month seller warranty covering manufacturing defects and hardware issues. Physical damage and water damage are not covered.',
            answeredBy: 'TechHub Store',
            answeredDate: '2024-01-06',
            verified: true
          }
        },
        {
          id: 'qa-006',
          question: 'How long does delivery take?',
          askedBy: 'Karan P.',
          askedDate: '2024-01-04',
          upvotes: 7,
          answer: {
            content: 'Delivery typically takes 2-3 business days for most locations. We use secure packaging to ensure your device arrives safely.',
            answeredBy: 'TechHub Store',
            answeredDate: '2024-01-04',
            verified: true
          }
        }
      ]
    },
    
    // Similar products
    similarProducts: [
      {
        id: 'mob-002',
        title: 'iPhone 11',
        price: 39999,
        mrp: 64900,
        rating: 4.3,
        condition: 'Excellent',
        image: 'https://images.unsplash.com/photo-1574944985070-8f3ebc6b79d2?w=200&h=200&fit=crop',
        seller: { distance: '0.8 km' }
      },
      {
        id: 'mob-003',
        title: 'iPhone 13',
        price: 69999,
        mrp: 99900,
        rating: 4.6,
        condition: 'Excellent',
        image: 'https://images.unsplash.com/photo-1556656793-08538906a9f8?w=200&h=200&fit=crop',
        seller: { distance: '1.5 km' }
      },
      {
        id: 'mob-004',
        title: 'iPhone 12 Mini',
        price: 42999,
        mrp: 69900,
        rating: 4.2,
        condition: 'Very Good',
        image: 'https://images.unsplash.com/photo-1607936854279-55e8f4bc0b9a?w=200&h=200&fit=crop',
        seller: { distance: '2.1 km' }
      }
    ]
  }
};

// Helper functions
export const getProductDetails = (productId) => {
  return productDetailsData[productId] || null;
};

export const getSkuDetails = (productId, skuId) => {
  const product = getProductDetails(productId);
  return product?.skus[skuId] || null;
};

export const getAvailableSkus = (productId, filters = {}) => {
  const product = getProductDetails(productId);
  if (!product) return [];
  
  return Object.values(product.skus).filter(sku => {
    if (filters.ram && sku.ram !== filters.ram) return false;
    if (filters.storage && sku.storage !== filters.storage) return false;
    if (filters.color && sku.color !== filters.color) return false;
    if (filters.inStockOnly && !sku.availability.inStock) return false;
    return true;
  });
};

export const generateSkuId = (ram, storage, color) => {
  const ramId = ram.toLowerCase().replace('gb', 'gb');
  const storageId = storage.toLowerCase().replace('gb', 'gb');
  const colorId = color.toLowerCase().replace(/\s+/g, '-');
  return `${ramId}-${storageId}-${colorId}`;
};

export default productDetailsData;