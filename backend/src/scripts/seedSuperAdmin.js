import dotenv from 'dotenv';
import mongoose from 'mongoose';

import connectDB from '../config/dbConfig.js';
import { User } from '../models/user.model.js';

dotenv.config();

const seedSuperAdmin = async () => {
  try {
    await connectDB();

    const superAdminData = {
      name: 'Super Admin',
      email: 'admin@cashmitra.com',
      password: 'Admin@123',
      phone: '+919999999999',
      role: 'admin',
      isVerified: true,
      isActive: true,
    };

    const existingAdmin = await User.findOne({ email: superAdminData.email });

    if (existingAdmin) {
      console.log('⚠️  Super admin already exists!');
      console.log('Email:', existingAdmin.email);
      console.log('Role:', existingAdmin.role);
      process.exit(0);
    }

    const superAdmin = await User.create(superAdminData);

    console.log('✅ Super admin created successfully!');
    console.log('==========================================');
    console.log('Email:', superAdmin.email);
    console.log('Password:', superAdminData.password);
    console.log('Role:', superAdmin.role);
    console.log('==========================================');
    console.log('⚠️  Please change the password after first login!');

    process.exit(0);
  } catch (error) {
    console.error('❌ Error seeding super admin:', error.message);
    process.exit(1);
  }
};

seedSuperAdmin();
