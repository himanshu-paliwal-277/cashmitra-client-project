const mongoose = require('mongoose');
const dotenv = require('dotenv');
const User = require('../models/user.model');

dotenv.config();

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

const createAdminUser = async () => {
  try {
    const adminExists = await User.findOne({ role: 'admin' });

    if (adminExists) {
      console.log('Admin user already exists');
      return;
    }

    const adminUser = await User.create({
      name: 'Admin User',
      email: 'admin@cashify.com',
      password: 'Admin@123',
      phone: '9876543210',
      role: 'admin',
      isVerified: true,
    });

    console.log('Admin user created successfully:', adminUser.email);
  } catch (error) {
    console.error('Error creating admin user:', error.message);
  } finally {
    mongoose.disconnect();
    console.log('MongoDB disconnected');
  }
};

const run = async () => {
  const connected = await connectDB();
  if (connected) {
    await createAdminUser();
  }
};

run();
