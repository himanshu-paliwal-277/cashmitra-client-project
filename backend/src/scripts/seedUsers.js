import dotenv from 'dotenv'; 

import connectDB from '../config/dbConfig.js';
import { User } from '../models/user.model.js';

dotenv.config();

const seedUser = async () => {
  try {
    await connectDB();

    const userData = {
      name: 'John Doe',
      email: 'user@cashmitra.com',
      password: 'User@123',
      phone: '+919876543210',
      dateOfBirth: new Date('1990-05-15'),
      address: {
        street: '123 Main Street',
        city: 'Mumbai',
        state: 'Maharashtra',
        pincode: '400001',
        country: 'India',
      },
      role: 'user',
      isVerified: true,
      isActive: true,
    };

    const existingUser = await User.findOne({ email: userData.email });

    if (existingUser) {
      console.log('⚠️  User already exists!');
      console.log('Email:', existingUser.email);
      console.log('Role:', existingUser.role);
      process.exit(0);
    }

    const user = await User.create(userData);

    console.log('✅ User created successfully!');
    console.log('==========================================');
    console.log(`Name: ${user.name}`);
    console.log(`Email: ${user.email}`);
    console.log(`Role: ${user.role}`);
    console.log(`Phone: ${user.phone}`);
    console.log('==========================================');
    console.log('Default Password: User@123');
    console.log('⚠️  Please ask user to change password after first login!');

    process.exit(0);
  } catch (error) {
    console.error('❌ Error seeding user:', error.message);
    process.exit(1);
  }
};

// Run the seeding function
seedUser();
