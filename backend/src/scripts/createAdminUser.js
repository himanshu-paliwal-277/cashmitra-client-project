const mongoose = require('mongoose');
const dotenv = require('dotenv');
const User = require('../models/user.model');

// Load environment variables
dotenv.config();

// MongoDB connection
const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('MongoDB connected successfully');
    return true;
  } catch (error) {
    console.error('MongoDB connection error:', error.message);
    return false;
  }
};

// Create admin user
const createAdminUser = async () => {
  try {
    // Check if admin user already exists
    const adminExists = await User.findOne({ role: 'admin' });
    
    if (adminExists) {
      console.log('Admin user already exists');
      return;
    }

    // Create new admin user
    const adminUser = await User.create({
      name: 'Admin User',
      email: 'admin@cashify.com',
      password: 'Admin@123',  // This should be changed after first login
      phone: '9876543210',
      role: 'admin',
      isVerified: true
    });

    console.log('Admin user created successfully:', adminUser.email);
  } catch (error) {
    console.error('Error creating admin user:', error.message);
  } finally {
    // Disconnect from MongoDB
    mongoose.disconnect();
    console.log('MongoDB disconnected');
  }
};

// Run the script
const run = async () => {
  const connected = await connectDB();
  if (connected) {
    await createAdminUser();
  }
};

run();