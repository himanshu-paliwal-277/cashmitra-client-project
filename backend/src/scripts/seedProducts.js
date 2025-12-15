require('dotenv').config();
const mongoose = require('mongoose');
const Product = require('../models/product.model');
const User = require('../models/user.model');

const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to MongoDB');
  } catch (error) {
    console.error('MongoDB connection error:', error);
    process.exit(1);
  }
};

const seedProducts = async () => {
  try {
    await connectDB();

    
    const existingProducts = await Product.find();
    console.log(`\nExisting products (${existingProducts.length}):`);
    existingProducts.forEach((product) => {
      console.log(`- ${product.brand} ${product.model} (${product.category})`);
    });

    
    const adminUser = await User.findOne({ role: 'admin' });
    if (!adminUser) {
      console.error('No admin user found. Please create an admin user first.');
      process.exit(1);
    }

    
    const sampleProducts = [
      {
        category: 'mobile',
        brand: 'Apple',
        series: 'iPhone',
        model: 'iPhone 14 Pro',
        variant: {
          ram: '6GB',
          storage: '128GB',
          processor: 'A16 Bionic',
          screenSize: '6.1 inch',
          color: 'Deep Purple',
        },
        basePrice: 85000,
        depreciation: {
          ratePerMonth: 2.5,
          maxDepreciation: 75,
        },
        images: [
          'https://images.unsplash.com/photo-1592750475338-74b7b21085ab?w=500',
          'https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=500',
        ],
        specifications: new Map([
          ['Display', '6.1-inch Super Retina XDR display'],
          ['Camera', '48MP Main camera'],
          ['Battery', 'Up to 23 hours video playback'],
          ['Operating System', 'iOS 16'],
          ['Connectivity', '5G, Wi-Fi 6, Bluetooth 5.3'],
          ['Water Resistance', 'IP68'],
        ]),
        createdBy: adminUser._id,
      },
      {
        category: 'laptop',
        brand: 'Dell',
        series: 'XPS',
        model: 'XPS 13',
        variant: {
          ram: '16GB',
          storage: '512GB SSD',
          processor: 'Intel Core i7-1260P',
          screenSize: '13.4 inch',
          color: 'Platinum Silver',
        },
        basePrice: 120000,
        depreciation: {
          ratePerMonth: 3,
          maxDepreciation: 80,
        },
        images: [
          'https://images.unsplash.com/photo-1496181133206-80ce9b88a853?w=500',
          'https://images.unsplash.com/photo-1541807084-5c52b6b3adef?w=500',
        ],
        specifications: new Map([
          ['Display', '13.4-inch FHD+ InfinityEdge display'],
          ['Processor', 'Intel Core i7-1260P'],
          ['Graphics', 'Intel Iris Xe Graphics'],
          ['Operating System', 'Windows 11 Home'],
          ['Ports', '2x Thunderbolt 4, 1x microSD card reader'],
          ['Weight', '1.27 kg'],
        ]),
        createdBy: adminUser._id,
      },
      {
        category: 'tablet',
        brand: 'Samsung',
        series: 'Galaxy Tab',
        model: 'Galaxy Tab S8',
        variant: {
          ram: '8GB',
          storage: '128GB',
          processor: 'Snapdragon 8 Gen 1',
          screenSize: '11 inch',
          color: 'Graphite',
        },
        basePrice: 55000,
        depreciation: {
          ratePerMonth: 2,
          maxDepreciation: 70,
        },
        images: [
          'https://images.unsplash.com/photo-1544244015-0df4b3ffc6b0?w=500',
          'https://images.unsplash.com/photo-1561154464-82e9adf32764?w=500',
        ],
        specifications: new Map([
          ['Display', '11-inch LTPS TFT display'],
          ['S Pen', 'Included'],
          ['Camera', '13MP rear, 12MP front'],
          ['Battery', '8000mAh'],
          ['Operating System', 'Android 12'],
          ['Connectivity', 'Wi-Fi 6E, Bluetooth 5.2'],
        ]),
        createdBy: adminUser._id,
      },
    ];

    
    if (existingProducts.length === 0) {
      console.log('\nCreating sample products...');
      const createdProducts = await Product.insertMany(sampleProducts);
      console.log(`\nSuccessfully created ${createdProducts.length} products:`);
      createdProducts.forEach((product) => {
        console.log(
          `- ${product.brand} ${product.model} (₹${product.basePrice})`
        );
      });
    } else {
      console.log('\nProducts already exist, skipping seed.');
    }

    const totalProducts = await Product.countDocuments();
    console.log(`\nTotal products in database: ${totalProducts}`);
  } catch (error) {
    console.error('Error seeding products:', error);
  } finally {
    await mongoose.connection.close();
    console.log('Database connection closed');
  }
};

seedProducts();
