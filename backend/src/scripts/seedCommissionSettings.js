import dotenv from 'dotenv';
import mongoose from 'mongoose';

import { CommissionSettings } from '../models/commissionSettings.model.js';
import { User } from '../models/user.model.js';

dotenv.config();

const seedCommissionSettings = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to MongoDB');

    // Check if commission settings already exist
    const existingSettings = await CommissionSettings.findOne({
      isActive: true,
    });
    if (existingSettings) {
      console.log('Commission settings already exist');
      return;
    }

    // Find admin user to set as updatedBy
    const adminUser = await User.findOne({ role: 'admin' });
    if (!adminUser) {
      console.error('No admin user found. Please create an admin user first.');
      return;
    }

    // Create default commission settings
    const defaultSettings = new CommissionSettings({
      defaultRates: {
        buy: {
          mobile: 5,
          tablet: 4,
          laptop: 3,
          accessories: 2,
        },
        sell: {
          mobile: 3,
          tablet: 2.5,
          laptop: 2,
          accessories: 1.5,
        },
      },
      partnerOverrides: [],
      isActive: true,
      updatedBy: adminUser._id,
    });

    await defaultSettings.save();

    console.log('✅ Default commission settings created successfully');
    console.log('Default rates:');
    console.log('Buy orders:', defaultSettings.defaultRates.buy);
    console.log('Sell orders:', defaultSettings.defaultRates.sell);
  } catch (error) {
    console.error('Error seeding commission settings:', error);
  } finally {
    await mongoose.disconnect();
    console.log('Disconnected from MongoDB');
  }
};

// Run the seed function
seedCommissionSettings();

export default seedCommissionSettings;
