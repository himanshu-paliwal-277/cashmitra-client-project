// Comprehensive dummy product data for the e-commerce website

export const productCategories = {
  mobile: 'Mobile Phones',
  tablet: 'Tablets',
  laptop: 'Laptops',
};

export const brands = {
  mobile: ['Apple', 'Samsung', 'OnePlus', 'Google', 'Xiaomi', 'Oppo', 'Vivo'],
  tablet: ['Apple', 'Samsung', 'Microsoft', 'Lenovo', 'Huawei'],
  laptop: ['Apple', 'Dell', 'HP', 'Lenovo', 'Asus', 'Microsoft', 'Acer'],
};

export const conditions = [
  { id: 'excellent', label: 'Excellent', description: 'Like new, no visible wear' },
  { id: 'very-good', label: 'Very Good', description: 'Minor signs of use' },
  { id: 'good', label: 'Good', description: 'Noticeable wear but fully functional' },
  { id: 'fair', label: 'Fair', description: 'Heavy wear but works properly' },
];

// Mobile Phones Data
export const mobileProducts = [
  {
    id: 'mob-001',
    title: 'iPhone 15 Pro Max',
    brand: 'Apple',
    model: 'iPhone 15 Pro Max',
    category: 'mobile',
    specs: '256GB, Natural Titanium, Excellent Condition',
    price: 89999,
    originalPrice: 159900,
    discount: 44,
    rating: 4.9,
    reviews: 234,
    image: '/api/placeholder/280/200',
    images: [
      '/api/placeholder/400/400',
      '/api/placeholder/400/400',
      '/api/placeholder/400/400',
      '/api/placeholder/400/400',
    ],
    badge: 'Premium',
    condition: 'excellent',
    inStock: true,
    stockCount: 12,
    features: [
      { icon: 'Shield', title: '12 Month Warranty', description: 'Comprehensive coverage' },
      { icon: 'Truck', title: 'Free Delivery', description: 'Within 2-3 business days' },
      { icon: 'RotateCcw', title: '7 Day Return', description: 'No questions asked' },
      { icon: 'Award', title: 'Quality Certified', description: '32-point inspection' },
    ],
    specifications: {
      General: {
        Brand: 'Apple',
        Model: 'iPhone 15 Pro Max',
        Color: 'Natural Titanium',
        Condition: 'Excellent',
        Storage: '256GB',
        RAM: '8GB',
      },
      Display: {
        'Screen Size': '6.7 inches',
        Resolution: '2796 x 1290 pixels',
        Technology: 'Super Retina XDR OLED',
        'Refresh Rate': '120Hz ProMotion',
      },
      Performance: {
        Processor: 'A17 Pro chip',
        'Operating System': 'iOS 17',
      },
      Camera: {
        'Rear Camera': '48MP Main + 12MP Ultra Wide + 12MP Telephoto',
        'Front Camera': '12MP TrueDepth',
        'Video Recording': '4K Dolby Vision HDR',
      },
    },
  },
  {
    id: 'mob-002',
    title: 'Samsung Galaxy S24 Ultra',
    brand: 'Samsung',
    model: 'Galaxy S24 Ultra',
    category: 'mobile',
    specs: '512GB, Titanium Black, Very Good Condition',
    price: 79999,
    originalPrice: 129999,
    discount: 38,
    rating: 4.8,
    reviews: 189,
    image: '/api/placeholder/280/200',
    images: [
      '/api/placeholder/400/400',
      '/api/placeholder/400/400',
      '/api/placeholder/400/400',
      '/api/placeholder/400/400',
    ],
    badge: 'Certified',
    condition: 'very-good',
    inStock: true,
    stockCount: 8,
    features: [
      { icon: 'Shield', title: '12 Month Warranty', description: 'Comprehensive coverage' },
      { icon: 'Truck', title: 'Free Delivery', description: 'Within 2-3 business days' },
      { icon: 'RotateCcw', title: '7 Day Return', description: 'No questions asked' },
      { icon: 'Award', title: 'Quality Certified', description: '32-point inspection' },
    ],
    specifications: {
      General: {
        Brand: 'Samsung',
        Model: 'Galaxy S24 Ultra',
        Color: 'Titanium Black',
        Condition: 'Very Good',
        Storage: '512GB',
        RAM: '12GB',
      },
      Display: {
        'Screen Size': '6.8 inches',
        Resolution: '3120 x 1440 pixels',
        Technology: 'Dynamic AMOLED 2X',
        'Refresh Rate': '120Hz',
      },
      Performance: {
        Processor: 'Snapdragon 8 Gen 3',
        'Operating System': 'Android 14',
      },
      Camera: {
        'Rear Camera': '200MP Main + 50MP Periscope + 10MP Telephoto + 12MP Ultra Wide',
        'Front Camera': '12MP',
        'Video Recording': '8K at 30fps',
      },
    },
  },
  {
    id: 'mob-003',
    title: 'iPhone 14 Pro',
    brand: 'Apple',
    model: 'iPhone 14 Pro',
    category: 'mobile',
    specs: '128GB, Deep Purple, Excellent Condition',
    price: 69999,
    originalPrice: 129900,
    discount: 46,
    rating: 4.7,
    reviews: 156,
    image: '/api/placeholder/280/200',
    images: [
      '/api/placeholder/400/400',
      '/api/placeholder/400/400',
      '/api/placeholder/400/400',
      '/api/placeholder/400/400',
    ],
    badge: 'Certified',
    condition: 'excellent',
    inStock: true,
    stockCount: 15,
    specifications: {
      General: {
        Brand: 'Apple',
        Model: 'iPhone 14 Pro',
        Color: 'Deep Purple',
        Condition: 'Excellent',
        Storage: '128GB',
        RAM: '6GB',
      },
      Display: {
        'Screen Size': '6.1 inches',
        Resolution: '2556 x 1179 pixels',
        Technology: 'Super Retina XDR OLED',
        'Refresh Rate': '120Hz ProMotion',
      },
      Performance: {
        Processor: 'A16 Bionic chip',
        'Operating System': 'iOS 16',
      },
      Camera: {
        'Rear Camera': '48MP Main + 12MP Ultra Wide + 12MP Telephoto',
        'Front Camera': '12MP TrueDepth',
        'Video Recording': '4K Dolby Vision HDR',
      },
    },
  },
  {
    id: 'mob-004',
    title: 'OnePlus 12',
    brand: 'OnePlus',
    model: 'OnePlus 12',
    category: 'mobile',
    specs: '256GB, Silky Black, Very Good Condition',
    price: 54999,
    originalPrice: 64999,
    discount: 15,
    rating: 4.6,
    reviews: 98,
    image: 'https://dlcdnwebimgs.asus.com/gain/A88A3B0D-2E2C-4D8E-9C8A-F5F2F5F5F5F5/w800/h600',
    images: [
      'https://dlcdnwebimgs.asus.com/gain/A88A3B0D-2E2C-4D8E-9C8A-F5F2F5F5F5F5/w800/h600',
      'https://dlcdnwebimgs.asus.com/gain/B99B4C1E-3F3D-5E9F-AD9B-G6G3G6G6G6G6/w800/h600',
      'https://dlcdnwebimgs.asus.com/gain/C00C5D2F-4G4E-6F0G-BE0C-H7H4H7H7H7H7/w800/h600',
    ],
    badge: 'Certified',
    condition: 'very-good',
    inStock: true,
    stockCount: 6,
    specifications: {
      General: {
        Brand: 'OnePlus',
        Model: 'OnePlus 12',
        Color: 'Silky Black',
        Condition: 'Very Good',
        Storage: '256GB',
        RAM: '12GB',
      },
      Display: {
        'Screen Size': '6.82 inches',
        Resolution: '3168 x 1440 pixels',
        Technology: 'LTPO AMOLED',
        'Refresh Rate': '120Hz',
      },
      Performance: {
        Processor: 'Snapdragon 8 Gen 3',
        'Operating System': 'OxygenOS 14',
      },
      Camera: {
        'Rear Camera': '50MP Main + 64MP Periscope + 48MP Ultra Wide',
        'Front Camera': '32MP',
        'Video Recording': '8K at 24fps',
      },
    },
  },
  {
    id: 'mob-005',
    title: 'Google Pixel 8 Pro',
    brand: 'Google',
    model: 'Pixel 8 Pro',
    category: 'mobile',
    specs: '128GB, Obsidian, Good Condition',
    price: 49999,
    originalPrice: 106999,
    discount: 53,
    rating: 4.5,
    reviews: 87,
    image: '/api/placeholder/280/200',
    images: ['/api/placeholder/400/400', '/api/placeholder/400/400', '/api/placeholder/400/400'],
    badge: 'Certified',
    condition: 'good',
    inStock: true,
    stockCount: 4,
    specifications: {
      General: {
        Brand: 'Google',
        Model: 'Pixel 8 Pro',
        Color: 'Obsidian',
        Condition: 'Good',
        Storage: '128GB',
        RAM: '12GB',
      },
      Display: {
        'Screen Size': '6.7 inches',
        Resolution: '2992 x 1344 pixels',
        Technology: 'LTPO OLED',
        'Refresh Rate': '120Hz',
      },
      Performance: {
        Processor: 'Google Tensor G3',
        'Operating System': 'Android 14',
      },
      Camera: {
        'Rear Camera': '50MP Main + 48MP Ultra Wide + 48MP Telephoto',
        'Front Camera': '10.5MP',
        'Video Recording': '4K at 60fps',
      },
    },
  },
  {
    id: 'mob-006',
    title: 'Xiaomi 14 Ultra',
    brand: 'Xiaomi',
    model: 'Xiaomi 14 Ultra',
    category: 'mobile',
    specs: '512GB, Black, Excellent Condition',
    price: 72999,
    originalPrice: 99999,
    discount: 27,
    rating: 4.4,
    reviews: 76,
    image: '/api/placeholder/280/200',
    images: ['/api/placeholder/400/400', '/api/placeholder/400/400', '/api/placeholder/400/400'],
    badge: 'Certified',
    condition: 'excellent',
    inStock: true,
    stockCount: 3,
    specifications: {
      General: {
        Brand: 'Xiaomi',
        Model: 'Xiaomi 14 Ultra',
        Color: 'Black',
        Condition: 'Excellent',
        Storage: '512GB',
        RAM: '16GB',
      },
      Display: {
        'Screen Size': '6.73 inches',
        Resolution: '3200 x 1440 pixels',
        Technology: 'LTPO AMOLED',
        'Refresh Rate': '120Hz',
      },
      Performance: {
        Processor: 'Snapdragon 8 Gen 3',
        'Operating System': 'HyperOS',
      },
      Camera: {
        'Rear Camera': '50MP Main + 50MP Ultra Wide + 50MP Periscope + 50MP Telephoto',
        'Front Camera': '32MP',
        'Video Recording': '8K at 24fps',
      },
    },
  },
];

// Tablet Products Data
export const tabletProducts = [
  {
    id: 'tab-001',
    title: 'iPad Pro 12.9-inch (6th Gen)',
    brand: 'Apple',
    model: 'iPad Pro 12.9',
    category: 'tablet',
    specs: '256GB, Space Gray, Wi-Fi + Cellular, Excellent Condition',
    price: 79999,
    originalPrice: 112900,
    discount: 29,
    rating: 4.9,
    reviews: 145,
    image: '/api/placeholder/280/200',
    images: [
      '/api/placeholder/400/400',
      '/api/placeholder/400/400',
      '/api/placeholder/400/400',
      '/api/placeholder/400/400',
    ],
    badge: 'Premium',
    condition: 'excellent',
    inStock: true,
    stockCount: 8,
    features: [
      { icon: 'Shield', title: '12 Month Warranty', description: 'Comprehensive coverage' },
      { icon: 'Truck', title: 'Free Delivery', description: 'Within 2-3 business days' },
      { icon: 'RotateCcw', title: '7 Day Return', description: 'No questions asked' },
      { icon: 'Award', title: 'Quality Certified', description: '32-point inspection' },
    ],
    specifications: {
      General: {
        Brand: 'Apple',
        Model: 'iPad Pro 12.9-inch (6th Gen)',
        Color: 'Space Gray',
        Condition: 'Excellent',
        Storage: '256GB',
        RAM: '8GB',
        Connectivity: 'Wi-Fi + Cellular',
      },
      Display: {
        'Screen Size': '12.9 inches',
        Resolution: '2732 x 2048 pixels',
        Technology: 'Liquid Retina XDR mini-LED',
        'Refresh Rate': '120Hz ProMotion',
      },
      Performance: {
        Processor: 'Apple M2 chip',
        'Operating System': 'iPadOS 17',
      },
      Camera: {
        'Rear Camera': '12MP Wide + 10MP Ultra Wide',
        'Front Camera': '12MP TrueDepth',
        'Video Recording': '4K ProRes',
      },
    },
  },
  {
    id: 'tab-002',
    title: 'Samsung Galaxy Tab S9 Ultra',
    brand: 'Samsung',
    model: 'Galaxy Tab S9 Ultra',
    category: 'tablet',
    specs: '512GB, Graphite, Wi-Fi, Very Good Condition',
    price: 69999,
    originalPrice: 103999,
    discount: 33,
    rating: 4.7,
    reviews: 98,
    image: '/api/placeholder/280/200',
    images: ['/api/placeholder/400/400', '/api/placeholder/400/400', '/api/placeholder/400/400'],
    badge: 'Certified',
    condition: 'very-good',
    inStock: true,
    stockCount: 5,
    specifications: {
      General: {
        Brand: 'Samsung',
        Model: 'Galaxy Tab S9 Ultra',
        Color: 'Graphite',
        Condition: 'Very Good',
        Storage: '512GB',
        RAM: '12GB',
        Connectivity: 'Wi-Fi',
      },
      Display: {
        'Screen Size': '14.6 inches',
        Resolution: '2960 x 1848 pixels',
        Technology: 'Dynamic AMOLED 2X',
        'Refresh Rate': '120Hz',
      },
      Performance: {
        Processor: 'Snapdragon 8 Gen 2',
        'Operating System': 'Android 13',
      },
      Camera: {
        'Rear Camera': '13MP Main + 6MP Ultra Wide',
        'Front Camera': '12MP + 12MP Ultra Wide',
        'Video Recording': '4K at 30fps',
      },
    },
  },
  {
    id: 'tab-003',
    title: 'iPad Air (5th Gen)',
    brand: 'Apple',
    model: 'iPad Air 5',
    category: 'tablet',
    specs: '64GB, Blue, Wi-Fi, Good Condition',
    price: 39999,
    originalPrice: 54900,
    discount: 27,
    rating: 4.6,
    reviews: 123,
    image: '/api/placeholder/280/200',
    images: ['/api/placeholder/400/400', '/api/placeholder/400/400', '/api/placeholder/400/400'],
    badge: 'Certified',
    condition: 'good',
    inStock: true,
    stockCount: 12,
    specifications: {
      General: {
        Brand: 'Apple',
        Model: 'iPad Air (5th Gen)',
        Color: 'Blue',
        Condition: 'Good',
        Storage: '64GB',
        RAM: '8GB',
        Connectivity: 'Wi-Fi',
      },
      Display: {
        'Screen Size': '10.9 inches',
        Resolution: '2360 x 1640 pixels',
        Technology: 'Liquid Retina IPS LCD',
        'Refresh Rate': '60Hz',
      },
      Performance: {
        Processor: 'Apple M1 chip',
        'Operating System': 'iPadOS 17',
      },
      Camera: {
        'Rear Camera': '12MP Wide',
        'Front Camera': '12MP Ultra Wide',
        'Video Recording': '4K at 60fps',
      },
    },
  },
  {
    id: 'tab-004',
    title: 'Microsoft Surface Pro 9',
    brand: 'Microsoft',
    model: 'Surface Pro 9',
    category: 'tablet',
    specs: '256GB, Platinum, Wi-Fi, Excellent Condition',
    price: 84999,
    originalPrice: 109999,
    discount: 23,
    rating: 4.5,
    reviews: 67,
    image: '/api/placeholder/280/200',
    images: ['/api/placeholder/400/400', '/api/placeholder/400/400', '/api/placeholder/400/400'],
    badge: 'Certified',
    condition: 'excellent',
    inStock: true,
    stockCount: 4,
    specifications: {
      General: {
        Brand: 'Microsoft',
        Model: 'Surface Pro 9',
        Color: 'Platinum',
        Condition: 'Excellent',
        Storage: '256GB SSD',
        RAM: '8GB',
        Connectivity: 'Wi-Fi',
      },
      Display: {
        'Screen Size': '13 inches',
        Resolution: '2880 x 1920 pixels',
        Technology: 'PixelSense Flow',
        'Refresh Rate': '120Hz',
      },
      Performance: {
        Processor: 'Intel Core i5-1235U',
        'Operating System': 'Windows 11',
      },
      Camera: {
        'Rear Camera': '10MP',
        'Front Camera': '5MP',
        'Video Recording': '4K at 30fps',
      },
    },
  },
  {
    id: 'tab-005',
    title: 'Samsung Galaxy Tab S8',
    brand: 'Samsung',
    model: 'Galaxy Tab S8',
    category: 'tablet',
    specs: '128GB, Pink Gold, Wi-Fi, Very Good Condition',
    price: 34999,
    originalPrice: 57999,
    discount: 40,
    rating: 4.4,
    reviews: 89,
    image: '/api/placeholder/280/200',
    images: ['/api/placeholder/400/400', '/api/placeholder/400/400', '/api/placeholder/400/400'],
    badge: 'Certified',
    condition: 'very-good',
    inStock: true,
    stockCount: 7,
    specifications: {
      General: {
        Brand: 'Samsung',
        Model: 'Galaxy Tab S8',
        Color: 'Pink Gold',
        Condition: 'Very Good',
        Storage: '128GB',
        RAM: '8GB',
        Connectivity: 'Wi-Fi',
      },
      Display: {
        'Screen Size': '11 inches',
        Resolution: '2560 x 1600 pixels',
        Technology: 'LTPS TFT LCD',
        'Refresh Rate': '120Hz',
      },
      Performance: {
        Processor: 'Snapdragon 8 Gen 1',
        'Operating System': 'Android 12',
      },
      Camera: {
        'Rear Camera': '13MP Main + 6MP Ultra Wide',
        'Front Camera': '12MP',
        'Video Recording': '4K at 30fps',
      },
    },
  },
  {
    id: 'tab-006',
    title: 'Lenovo Tab P12 Pro',
    brand: 'Lenovo',
    model: 'Tab P12 Pro',
    category: 'tablet',
    specs: '256GB, Storm Grey, Wi-Fi, Good Condition',
    price: 42999,
    originalPrice: 57999,
    discount: 26,
    rating: 4.3,
    reviews: 54,
    image: '/api/placeholder/280/200',
    images: ['/api/placeholder/400/400', '/api/placeholder/400/400', '/api/placeholder/400/400'],
    badge: 'Certified',
    condition: 'good',
    inStock: true,
    stockCount: 3,
    specifications: {
      General: {
        Brand: 'Lenovo',
        Model: 'Tab P12 Pro',
        Color: 'Storm Grey',
        Condition: 'Good',
        Storage: '256GB',
        RAM: '8GB',
        Connectivity: 'Wi-Fi',
      },
      Display: {
        'Screen Size': '12.6 inches',
        Resolution: '2560 x 1600 pixels',
        Technology: 'OLED',
        'Refresh Rate': '120Hz',
      },
      Performance: {
        Processor: 'MediaTek Dimensity 9000',
        'Operating System': 'Android 12',
      },
      Camera: {
        'Rear Camera': '13MP Main + 5MP Ultra Wide',
        'Front Camera': '8MP + 8MP IR',
        'Video Recording': '4K at 30fps',
      },
    },
  },
];

// Laptop Products Data
export const laptopProducts = [
  {
    id: 'lap-001',
    title: 'MacBook Pro 16-inch M3 Max',
    brand: 'Apple',
    model: 'MacBook Pro 16',
    category: 'laptop',
    specs: '1TB SSD, 36GB RAM, Space Black, Excellent Condition',
    price: 289999,
    originalPrice: 399900,
    discount: 27,
    rating: 4.9,
    reviews: 87,
    image:
      'https://store.storeimages.cdn-apple.com/4982/as-images.apple.com/is/mbp16-spaceblack-select-202310?wid=904&hei=840&fmt=jpeg&qlt=90&.v=1697311054290',
    images: [
      'https://store.storeimages.cdn-apple.com/4982/as-images.apple.com/is/mbp16-spaceblack-select-202310?wid=904&hei=840&fmt=jpeg&qlt=90&.v=1697311054290',
      'https://store.storeimages.cdn-apple.com/4982/as-images.apple.com/is/mbp16-spaceblack-gallery1-202310?wid=2000&hei=1536&fmt=jpeg&qlt=95&.v=1697311054290',
      'https://store.storeimages.cdn-apple.com/4982/as-images.apple.com/is/mbp16-spaceblack-gallery2-202310?wid=2000&hei=1536&fmt=jpeg&qlt=95&.v=1697311054290',
      'https://store.storeimages.cdn-apple.com/4982/as-images.apple.com/is/mbp16-spaceblack-gallery3-202310?wid=2000&hei=1536&fmt=jpeg&qlt=95&.v=1697311054290',
    ],
    badge: 'Premium',
    condition: 'excellent',
    inStock: true,
    stockCount: 3,
    features: [
      { icon: 'Shield', title: '12 Month Warranty', description: 'Comprehensive coverage' },
      { icon: 'Truck', title: 'Free Delivery', description: 'Within 2-3 business days' },
      { icon: 'RotateCcw', title: '7 Day Return', description: 'No questions asked' },
      { icon: 'Award', title: 'Quality Certified', description: '32-point inspection' },
    ],
    specifications: {
      General: {
        Brand: 'Apple',
        Model: 'MacBook Pro 16-inch',
        Color: 'Space Black',
        Condition: 'Excellent',
        Year: '2023',
      },
      Performance: {
        Processor: 'Apple M3 Max chip',
        RAM: '36GB Unified Memory',
        Storage: '1TB SSD',
        'Operating System': 'macOS Sonoma',
      },
      Display: {
        'Screen Size': '16.2 inches',
        Resolution: '3456 x 2234 pixels',
        Technology: 'Liquid Retina XDR',
        'Refresh Rate': '120Hz ProMotion',
      },
      Connectivity: {
        Ports: '3x Thunderbolt 4, HDMI, SDXC, MagSafe 3',
        Wireless: 'Wi-Fi 6E, Bluetooth 5.3',
      },
      Battery: {
        'Battery Life': 'Up to 22 hours',
        Charging: 'MagSafe 3',
      },
    },
  },
  {
    id: 'lap-002',
    title: 'Dell XPS 15 9530',
    brand: 'Dell',
    model: 'XPS 15 9530',
    category: 'laptop',
    specs: '512GB SSD, 16GB RAM, Platinum Silver, Very Good Condition',
    price: 149999,
    originalPrice: 199999,
    discount: 25,
    rating: 4.7,
    reviews: 124,
    image:
      'https://i.dell.com/is/image/DellContent/content/dam/ss2/product-images/dell-client-products/notebooks/xps-notebooks/xps-15-9530/media-gallery/notebook-xps-15-9530-nt-silver-gallery-1.psd?fmt=pjpg&pscan=auto&scl=1&wid=3491&hei=2681&qlt=100,1&resMode=sharp2&size=3491,2681&chrss=full&imwidth=5000',
    images: [
      'https://i.dell.com/is/image/DellContent/content/dam/ss2/product-images/dell-client-products/notebooks/xps-notebooks/xps-15-9530/media-gallery/notebook-xps-15-9530-nt-silver-gallery-1.psd?fmt=pjpg&pscan=auto&scl=1&wid=3491&hei=2681&qlt=100,1&resMode=sharp2&size=3491,2681&chrss=full&imwidth=5000',
      'https://i.dell.com/is/image/DellContent/content/dam/ss2/product-images/dell-client-products/notebooks/xps-notebooks/xps-15-9530/media-gallery/notebook-xps-15-9530-nt-silver-gallery-2.psd?fmt=pjpg&pscan=auto&scl=1&wid=3491&hei=2681&qlt=100,1&resMode=sharp2&size=3491,2681&chrss=full&imwidth=5000',
      'https://i.dell.com/is/image/DellContent/content/dam/ss2/product-images/dell-client-products/notebooks/xps-notebooks/xps-15-9530/media-gallery/notebook-xps-15-9530-nt-silver-gallery-3.psd?fmt=pjpg&pscan=auto&scl=1&wid=3491&hei=2681&qlt=100,1&resMode=sharp2&size=3491,2681&chrss=full&imwidth=5000',
    ],
    badge: 'Certified',
    condition: 'very-good',
    inStock: true,
    stockCount: 6,
    specifications: {
      General: {
        Brand: 'Dell',
        Model: 'XPS 15 9530',
        Color: 'Platinum Silver',
        Condition: 'Very Good',
        Year: '2023',
      },
      Performance: {
        Processor: 'Intel Core i7-13700H',
        RAM: '16GB DDR5',
        Storage: '512GB NVMe SSD',
        Graphics: 'NVIDIA GeForce RTX 4060',
        'Operating System': 'Windows 11 Pro',
      },
      Display: {
        'Screen Size': '15.6 inches',
        Resolution: '3840 x 2400 pixels',
        Technology: 'OLED InfinityEdge',
        'Refresh Rate': '60Hz',
      },
      Connectivity: {
        Ports: '2x Thunderbolt 4, USB-C, SD card reader',
        Wireless: 'Wi-Fi 6E, Bluetooth 5.2',
      },
      Battery: {
        'Battery Life': 'Up to 13 hours',
        Charging: '130W USB-C',
      },
    },
  },
  {
    id: 'lap-003',
    title: 'MacBook Air M2',
    brand: 'Apple',
    model: 'MacBook Air M2',
    category: 'laptop',
    specs: '256GB SSD, 8GB RAM, Midnight, Excellent Condition',
    price: 89999,
    originalPrice: 119900,
    discount: 25,
    rating: 4.8,
    reviews: 203,
    image:
      'https://store.storeimages.cdn-apple.com/4982/as-images.apple.com/is/mba13-midnight-select-202402?wid=904&hei=840&fmt=jpeg&qlt=90&.v=1708367688034',
    images: [
      'https://store.storeimages.cdn-apple.com/4982/as-images.apple.com/is/mba13-midnight-select-202402?wid=904&hei=840&fmt=jpeg&qlt=90&.v=1708367688034',
      'https://store.storeimages.cdn-apple.com/4982/as-images.apple.com/is/mba13-midnight-gallery1-202402?wid=2000&hei=1536&fmt=jpeg&qlt=95&.v=1708367688034',
      'https://store.storeimages.cdn-apple.com/4982/as-images.apple.com/is/mba13-midnight-gallery2-202402?wid=2000&hei=1536&fmt=jpeg&qlt=95&.v=1708367688034',
    ],
    badge: 'Certified',
    condition: 'excellent',
    inStock: true,
    stockCount: 15,
    specifications: {
      General: {
        Brand: 'Apple',
        Model: 'MacBook Air',
        Color: 'Midnight',
        Condition: 'Excellent',
        Year: '2022',
      },
      Performance: {
        Processor: 'Apple M2 chip',
        RAM: '8GB Unified Memory',
        Storage: '256GB SSD',
        'Operating System': 'macOS Sonoma',
      },
      Display: {
        'Screen Size': '13.6 inches',
        Resolution: '2560 x 1664 pixels',
        Technology: 'Liquid Retina',
        'Refresh Rate': '60Hz',
      },
      Connectivity: {
        Ports: '2x Thunderbolt, MagSafe 3, 3.5mm headphone',
        Wireless: 'Wi-Fi 6, Bluetooth 5.0',
      },
      Battery: {
        'Battery Life': 'Up to 18 hours',
        Charging: 'MagSafe 3',
      },
    },
  },
  {
    id: 'lap-004',
    title: 'HP Spectre x360 16',
    brand: 'HP',
    model: 'Spectre x360 16',
    category: 'laptop',
    specs: '1TB SSD, 32GB RAM, Nightfall Black, Good Condition',
    price: 134999,
    originalPrice: 179999,
    discount: 25,
    rating: 4.6,
    reviews: 89,
    image: 'https://ssl-product-images.www8-hp.com/digmedialib/prodimg/lowres/c08487853.png',
    images: [
      'https://ssl-product-images.www8-hp.com/digmedialib/prodimg/lowres/c08487853.png',
      'https://ssl-product-images.www8-hp.com/digmedialib/prodimg/lowres/c08487854.png',
      'https://ssl-product-images.www8-hp.com/digmedialib/prodimg/lowres/c08487855.png',
    ],
    badge: 'Certified',
    condition: 'good',
    inStock: true,
    stockCount: 4,
    specifications: {
      General: {
        Brand: 'HP',
        Model: 'Spectre x360 16',
        Color: 'Nightfall Black',
        Condition: 'Good',
        Year: '2023',
      },
      Performance: {
        Processor: 'Intel Core i7-13700H',
        RAM: '32GB LPDDR5',
        Storage: '1TB PCIe NVMe SSD',
        Graphics: 'Intel Iris Xe',
        'Operating System': 'Windows 11 Home',
      },
      Display: {
        'Screen Size': '16 inches',
        Resolution: '3072 x 1920 pixels',
        Technology: 'OLED Touch',
        'Refresh Rate': '120Hz',
      },
      Connectivity: {
        Ports: '2x Thunderbolt 4, USB-A, HDMI 2.1, microSD',
        Wireless: 'Wi-Fi 6E, Bluetooth 5.3',
      },
      Battery: {
        'Battery Life': 'Up to 17 hours',
        Charging: '90W USB-C',
      },
    },
  },
  {
    id: 'lap-005',
    title: 'Lenovo ThinkPad X1 Carbon Gen 11',
    brand: 'Lenovo',
    model: 'ThinkPad X1 Carbon',
    category: 'laptop',
    specs: '512GB SSD, 16GB RAM, Black, Very Good Condition',
    price: 119999,
    originalPrice: 159999,
    discount: 25,
    rating: 4.5,
    reviews: 76,
    image:
      'https://p3-ofp.static.pub/ShareResource/na/subseries/hero/lenovo-thinkpad-x1-carbon-gen-11-14-intel-hero.png',
    images: [
      'https://p3-ofp.static.pub/ShareResource/na/subseries/hero/lenovo-thinkpad-x1-carbon-gen-11-14-intel-hero.png',
      'https://p2-ofp.static.pub/ShareResource/na/subseries/gallery/lenovo-thinkpad-x1-carbon-gen-11-14-intel-gallery-1.png',
      'https://p1-ofp.static.pub/ShareResource/na/subseries/gallery/lenovo-thinkpad-x1-carbon-gen-11-14-intel-gallery-2.png',
    ],
    badge: 'Certified',
    condition: 'very-good',
    inStock: true,
    stockCount: 8,
    specifications: {
      General: {
        Brand: 'Lenovo',
        Model: 'ThinkPad X1 Carbon Gen 11',
        Color: 'Black',
        Condition: 'Very Good',
        Year: '2023',
      },
      Performance: {
        Processor: 'Intel Core i7-1365U',
        RAM: '16GB LPDDR5',
        Storage: '512GB PCIe SSD',
        Graphics: 'Intel Iris Xe',
        'Operating System': 'Windows 11 Pro',
      },
      Display: {
        'Screen Size': '14 inches',
        Resolution: '2880 x 1800 pixels',
        Technology: 'OLED Touch',
        'Refresh Rate': '90Hz',
      },
      Connectivity: {
        Ports: '2x Thunderbolt 4, 2x USB-A, HDMI, Audio',
        Wireless: 'Wi-Fi 6E, Bluetooth 5.1',
      },
      Battery: {
        'Battery Life': 'Up to 29 hours',
        Charging: '65W USB-C',
      },
    },
  },
  {
    id: 'lap-006',
    title: 'ASUS ROG Zephyrus G16',
    brand: 'Asus',
    model: 'ROG Zephyrus G16',
    category: 'laptop',
    specs: '1TB SSD, 32GB RAM, Eclipse Gray, Excellent Condition',
    price: 199999,
    originalPrice: 249999,
    discount: 20,
    rating: 4.7,
    reviews: 65,
    image: '/api/placeholder/280/200',
    images: ['/api/placeholder/400/400', '/api/placeholder/400/400', '/api/placeholder/400/400'],
    badge: 'Gaming',
    condition: 'excellent',
    inStock: true,
    stockCount: 2,
    specifications: {
      General: {
        Brand: 'ASUS',
        Model: 'ROG Zephyrus G16',
        Color: 'Eclipse Gray',
        Condition: 'Excellent',
        Year: '2024',
      },
      Performance: {
        Processor: 'Intel Core i9-13900H',
        RAM: '32GB DDR5',
        Storage: '1TB PCIe 4.0 SSD',
        Graphics: 'NVIDIA GeForce RTX 4070',
        'Operating System': 'Windows 11 Home',
      },
      Display: {
        'Screen Size': '16 inches',
        Resolution: '2560 x 1600 pixels',
        Technology: 'Mini LED',
        'Refresh Rate': '240Hz',
      },
      Connectivity: {
        Ports: '2x USB-C, 2x USB-A, HDMI 2.1, Audio',
        Wireless: 'Wi-Fi 6E, Bluetooth 5.3',
      },
      Battery: {
        'Battery Life': 'Up to 10 hours',
        Charging: '240W USB-C',
      },
    },
  },
  {
    id: 'lap-007',
    title: 'Microsoft Surface Laptop Studio 2',
    brand: 'Microsoft',
    model: 'Surface Laptop Studio 2',
    category: 'laptop',
    specs: '1TB SSD, 32GB RAM, Platinum, Excellent Condition',
    price: 249999,
    originalPrice: 329999,
    discount: 24,
    rating: 4.8,
    reviews: 142,
    image:
      'https://images.unsplash.com/photo-1496181133206-80ce9b88a853?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1000&q=80',
    images: [
      'https://images.unsplash.com/photo-1496181133206-80ce9b88a853?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1541807084-5c52b6b3adef?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1593642702821-c8da6771f0c6?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1517336714731-489689fd1ca8?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=800&q=80',
    ],
    badge: 'Premium',
    condition: 'excellent',
    inStock: true,
    stockCount: 5,
    features: [
      { icon: 'Shield', title: '12 Month Warranty', description: 'Comprehensive coverage' },
      { icon: 'Truck', title: 'Free Delivery', description: 'Within 2-3 business days' },
      { icon: 'RotateCcw', title: '7 Day Return', description: 'No questions asked' },
      { icon: 'Award', title: 'Quality Certified', description: '32-point inspection' },
    ],
    specifications: {
      General: {
        Brand: 'Microsoft',
        Model: 'Surface Laptop Studio 2',
        Color: 'Platinum',
        Condition: 'Excellent',
        Year: '2023',
      },
      Performance: {
        Processor: 'Intel Core i7-13700H',
        RAM: '32GB LPDDR5x',
        Storage: '1TB PCIe 4.0 SSD',
        Graphics: 'NVIDIA GeForce RTX 4060',
        'Operating System': 'Windows 11 Pro',
      },
      Display: {
        'Screen Size': '14.4 inches',
        Resolution: '2400 x 1600 pixels',
        Technology: 'PixelSense Flow Touch',
        'Refresh Rate': '120Hz',
      },
      Connectivity: {
        Ports: '2x USB-C, 1x USB-A, Surface Connect, 3.5mm',
        Wireless: 'Wi-Fi 6E, Bluetooth 5.3',
      },
      Battery: {
        'Battery Life': 'Up to 19 hours',
        Charging: 'Surface Connect or USB-C',
      },
    },
  },
];

// Combined products array
export const allProducts = [...mobileProducts, ...tabletProducts, ...laptopProducts];

// Helper functions
export const getProductsByCategory = (category: any) => {
  switch (category) {
    case 'mobile':
      return mobileProducts;
    case 'tablet':
      return tabletProducts;
    case 'laptop':
      return laptopProducts;
    default:
      return allProducts;
  }
};

export const getProductById = (id: any) => {
  return allProducts.find(product => product.id === id);
};

export const getProductsByBrand = (brand: any, category = null) => {
  let products = category ? getProductsByCategory(category) : allProducts;
  return products.filter(product => product.brand.toLowerCase() === brand.toLowerCase());
};

export const searchProducts = (query: any, category = null) => {
  let products = category ? getProductsByCategory(category) : allProducts;
  const searchTerm = query.toLowerCase();

  return products.filter(
    product =>
      product.title.toLowerCase().includes(searchTerm) ||
      product.brand.toLowerCase().includes(searchTerm) ||
      product.specs.toLowerCase().includes(searchTerm)
  );
};

export const filterProducts = (products: any, filters: any) => {
  return products.filter((product: any) => {
    // Price range filter
    if (filters.priceRange && filters.priceRange !== 'all') {
      const [min, max] = filters.priceRange.split('-').map(Number);
      if (max && (product.price < min || product.price > max)) return false;
      if (!max && product.price < min) return false;
    }

    // Condition filter
    if (filters.condition && filters.condition !== 'all') {
      if (product.condition !== filters.condition) return false;
    }

    // Brand filter
    if (filters.brand && filters.brand !== 'all') {
      if (product.brand.toLowerCase() !== filters.brand.toLowerCase()) return false;
    }

    // In stock filter
    if (filters.inStock) {
      if (!product.inStock) return false;
    }

    return true;
  });
};

export const sortProducts = (products: any, sortBy: any) => {
  const sorted = [...products];

  switch (sortBy) {
    case 'price-low':
      return sorted.sort((a, b) => a.price - b.price);
    case 'price-high':
      return sorted.sort((a, b) => b.price - a.price);
    case 'rating':
      return sorted.sort((a, b) => b.rating - a.rating);
    case 'discount':
      return sorted.sort((a, b) => b.discount - a.discount);
    case 'newest':
      return sorted.sort(
        {/* @ts-expect-error */}
        (a, b) => new Date(b.createdAt || '2024-01-01') - new Date(a.createdAt || '2024-01-01')
      );
    case 'popularity':
    default:
      return sorted.sort((a, b) => b.reviews - a.reviews);
  }
};

// Mock user data
export const mockUsers = [
  {
    id: 'user-001',
    name: 'Rahul Sharma',
    email: 'rahul.sharma@email.com',
    phone: '+91 98765 43210',
    address: {
      street: '123 MG Road',
      city: 'Bangalore',
      state: 'Karnataka',
      pincode: '560001',
      country: 'India',
    },
    joinedDate: '2023-06-15',
    totalOrders: 12,
    totalSpent: 245000,
    loyaltyPoints: 2450,
  },
  {
    id: 'user-002',
    name: 'Priya Patel',
    email: 'priya.patel@email.com',
    phone: '+91 87654 32109',
    address: {
      street: '456 SG Highway',
      city: 'Ahmedabad',
      state: 'Gujarat',
      pincode: '380015',
      country: 'India',
    },
    joinedDate: '2023-08-22',
    totalOrders: 8,
    totalSpent: 156000,
    loyaltyPoints: 1560,
  },
];

// Mock order data
export const mockOrders = [
  {
    id: 'ORD-2024-001',
    userId: 'user-001',
    date: '2024-01-15',
    status: 'delivered',
    total: 89999,
    items: [
      {
        productId: 'mob-001',
        quantity: 1,
        price: 89999,
      },
    ],
    shippingAddress: {
      name: 'Rahul Sharma',
      street: '123 MG Road',
      city: 'Bangalore',
      state: 'Karnataka',
      pincode: '560001',
    },
    deliveryDate: '2024-01-18',
    trackingNumber: 'TRK123456789',
  },
  {
    id: 'ORD-2024-002',
    userId: 'user-002',
    date: '2024-01-20',
    status: 'shipped',
    total: 79999,
    items: [
      {
        productId: 'tab-001',
        quantity: 1,
        price: 79999,
      },
    ],
    shippingAddress: {
      name: 'Priya Patel',
      street: '456 SG Highway',
      city: 'Ahmedabad',
      state: 'Gujarat',
      pincode: '380015',
    },
    estimatedDelivery: '2024-01-25',
    trackingNumber: 'TRK987654321',
  },
];

// Support/Help content
export const helpContent = {
  faqs: [
    {
      id: 'faq-001',
      question: 'How do I sell my device?',
      answer:
        "Simply select your device category, choose your brand and model, answer a few questions about its condition, and get an instant quote. If you accept, we'll arrange free pickup from your location.",
      category: 'selling',
    },
    {
      id: 'faq-002',
      question: 'What is the return policy?',
      answer:
        "We offer a 7-day return policy for all purchases. If you're not satisfied with your device, you can return it within 7 days for a full refund.",
      category: 'buying',
    },
    {
      id: 'faq-003',
      question: 'How is the device condition determined?',
      answer:
        'Our experts perform a comprehensive 32-point inspection covering physical condition, functionality, battery health, and performance to ensure accurate grading.',
      category: 'quality',
    },
    {
      id: 'faq-004',
      question: 'What payment methods do you accept?',
      answer:
        'We accept all major credit/debit cards, UPI, net banking, and digital wallets. For selling, we offer instant bank transfer or cash on pickup.',
      category: 'payment',
    },
    {
      id: 'faq-005',
      question: 'Is my data safe when I sell my device?',
      answer:
        'Yes, we ensure complete data security. Our certified technicians perform secure data wiping using industry-standard methods to protect your privacy.',
      category: 'security',
    },
    {
      id: 'faq-006',
      question: 'Do you provide warranty on refurbished devices?',
      answer:
        'Yes, all our certified refurbished devices come with a 12-month warranty covering hardware defects and functionality issues.',
      category: 'warranty',
    },
  ],
  contactInfo: {
    phone: '+91 1800-123-4567',
    email: 'support@cashify.com',
    hours: 'Mon-Sat: 9 AM - 8 PM, Sun: 10 AM - 6 PM',
    address: 'Cashify Technologies Pvt Ltd, Sector 44, Gurugram, Haryana 122003',
  },
};
