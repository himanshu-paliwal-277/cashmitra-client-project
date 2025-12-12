const mongoose = require('mongoose');
const Category = require('../src/models/category.model');
const User = require('../src/models/user.model');
require('dotenv').config();

const seedCategories = async () => {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to MongoDB');

    // Find admin user to set as creator
    const adminUser = await User.findOne({ role: 'admin' });
    if (!adminUser) {
      console.error('Admin user not found. Please create admin user first.');
      process.exit(1);
    }

    // Check if categories already exist
    const existingCategories = await Category.find();
    if (existingCategories.length > 0) {
      console.log('Categories already exist. Skipping seeding.');
      console.log(
        'Existing categories:',
        existingCategories.map((cat) => cat.name)
      );
      process.exit(0);
    }

    // Define initial categories
    const categories = [
      {
        name: 'Mobile Phones',
        slug: 'mobile-phones',
        description: 'Smartphones and mobile devices from all major brands',
        icon: 'Smartphone',
        sortOrder: 1,
        metadata: {
          seoTitle: 'Sell Mobile Phones - Get Best Price for Your Smartphone',
          seoDescription:
            'Sell your mobile phone and get instant cash. We accept all brands including iPhone, Samsung, OnePlus, Xiaomi and more.',
          keywords: [
            'mobile',
            'smartphone',
            'phone',
            'sell phone',
            'cash for phone',
          ],
        },
        specifications: new Map([
          [
            'brand',
            'Apple,Samsung,OnePlus,Xiaomi,Oppo,Vivo,Realme,Google,Nothing,Other',
          ],
          ['model', 'required'],
          ['storage', '32GB,64GB,128GB,256GB,512GB,1TB'],
          ['color', 'required'],
          ['condition', 'Excellent,Good,Fair,Poor'],
          ['screenSize', 'optional'],
          ['ram', '2GB,3GB,4GB,6GB,8GB,12GB,16GB'],
        ]),
        createdBy: adminUser._id,
      },
      {
        name: 'Tablets',
        slug: 'tablets',
        description: 'iPads, Android tablets and other tablet devices',
        icon: 'Tablet',
        sortOrder: 2,
        metadata: {
          seoTitle: 'Sell Tablets - Best Price for iPad and Android Tablets',
          seoDescription:
            'Sell your tablet and get instant cash. We accept iPad, Samsung Galaxy Tab, Lenovo and other tablet brands.',
          keywords: [
            'tablet',
            'ipad',
            'android tablet',
            'sell tablet',
            'cash for tablet',
          ],
        },
        specifications: new Map([
          ['brand', 'Apple,Samsung,Lenovo,Huawei,Microsoft,Amazon,Other'],
          ['model', 'required'],
          ['storage', '32GB,64GB,128GB,256GB,512GB,1TB'],
          ['color', 'required'],
          ['condition', 'Excellent,Good,Fair,Poor'],
          ['screenSize', '7-8 inch,9-10 inch,11-12 inch,13+ inch'],
          ['connectivity', 'WiFi Only,WiFi + Cellular'],
        ]),
        createdBy: adminUser._id,
      },
      {
        name: 'Laptops',
        slug: 'laptops',
        description: 'Laptops, MacBooks and notebook computers from all brands',
        icon: 'Laptop',
        sortOrder: 3,
        metadata: {
          seoTitle: 'Sell Laptops - Get Best Price for Your Laptop or MacBook',
          seoDescription:
            'Sell your laptop and get instant cash. We accept MacBook, Dell, HP, Lenovo and all other laptop brands.',
          keywords: [
            'laptop',
            'macbook',
            'notebook',
            'sell laptop',
            'cash for laptop',
          ],
        },
        specifications: new Map([
          ['brand', 'Apple,Dell,HP,Lenovo,Asus,Acer,MSI,Razer,Microsoft,Other'],
          ['model', 'required'],
          [
            'processor',
            'Intel Core i3,Intel Core i5,Intel Core i7,Intel Core i9,AMD Ryzen 3,AMD Ryzen 5,AMD Ryzen 7,AMD Ryzen 9,Apple M1,Apple M2,Apple M3,Other',
          ],
          ['ram', '4GB,8GB,16GB,32GB,64GB'],
          [
            'storage',
            '128GB SSD,256GB SSD,512GB SSD,1TB SSD,2TB SSD,500GB HDD,1TB HDD,2TB HDD',
          ],
          ['screenSize', '11-12 inch,13-14 inch,15-16 inch,17+ inch'],
          ['condition', 'Excellent,Good,Fair,Poor'],
          ['color', 'required'],
        ]),
        createdBy: adminUser._id,
      },
    ];

    // Create categories
    const createdCategories = await Category.insertMany(categories);

    console.log('Categories seeded successfully!');
    console.log('Created categories:');
    createdCategories.forEach((cat) => {
      console.log(`- ${cat.name} (${cat.slug})`);
    });

    process.exit(0);
  } catch (error) {
    console.error('Error seeding categories:', error);
    process.exit(1);
  }
};

seedCategories();
