import dotenv from 'dotenv';

import connectDB from '../config/dbConfig.js';
import { Partner } from '../models/partner.model.js';
import { User } from '../models/user.model.js';
import { Wallet } from '../models/wallet.model.js';

dotenv.config();

const seedPartner = async () => {
  try {
    await connectDB();

    const partnerUserData = {
      name: 'Tech Store Owner',
      email: 'partner@cashmitra.com',
      password: 'Partner@123',
      phone: '+919876543220',
      role: 'partner',
      isVerified: true,
      isActive: true,
    };

    const partnerData = {
      shopName: 'Tech Hub Electronics',
      shopAddress: {
        street: '456 Electronics Market',
        city: 'Mumbai',
        state: 'Maharashtra',
        pincode: '400002',
        country: 'India',
        coordinates: {
          latitude: 19.076,
          longitude: 72.8777,
        },
      },
      gstNumber: '27ABCDE1234F1Z5',
      shopPhone: '+912212345678',
      shopEmail: 'shop@techhub.com',
      shopLogo: '',
      shopImages: [],
      documents: {
        gstCertificate: '',
        shopLicense: '',
        ownerIdProof: '',
        additionalDocuments: [],
      },
      isVerified: true,
      verificationStatus: 'approved',
      verificationNotes: 'Verified by admin during seeding',
      rating: 4.5,
      reviews: [],
      bankDetails: {
        accountHolderName: 'Tech Store Owner',
        accountNumber: '1234567890',
        ifscCode: 'HDFC0001234',
        bankName: 'HDFC Bank',
        branch: 'Mumbai Main Branch',
      },
      upiId: 'partner@paytm',
      service_radius: 10000, // 10km radius
    };

    const existingUser = await User.findOne({ email: partnerUserData.email });

    if (existingUser) {
      console.log('⚠️  Partner user already exists!');
      console.log('Email:', existingUser.email);
      console.log('Role:', existingUser.role);

      const existingPartner = await Partner.findOne({ user: existingUser._id });
      if (existingPartner) {
        console.log('⚠️  Partner profile already exists!');
        console.log('Shop Name:', existingPartner.shopName);
        process.exit(0);
      }
    }

    let partnerUser;

    if (existingUser) {
      partnerUser = existingUser;
    } else {
      partnerUser = await User.create(partnerUserData);
      console.log('✅ Partner user created successfully!');
    }

    partnerData.user = partnerUser._id;
    const partner = await Partner.create(partnerData);

    const wallet = await Wallet.create({
      partner: partner._id,
      balance: 0,
      transactions: [],
      payoutSettings: {
        minimumPayoutAmount: 1000,
        autoPayoutEnabled: false,
        payoutSchedule: 'manual',
        bankDetails: partnerData.bankDetails,
        upiId: partnerData.upiId,
      },
    });

    console.log('✅ Partner created successfully!');
    console.log('==========================================');
    console.log(`Partner Name: ${partnerUser.name}`);
    console.log(`Email: ${partnerUser.email}`);
    console.log(`Role: ${partnerUser.role}`);
    console.log(`Phone: ${partnerUser.phone}`);
    console.log(`Shop Name: ${partner.shopName}`);
    console.log(`GST Number: ${partner.gstNumber}`);
    console.log(`Verification Status: ${partner.verificationStatus}`);
    console.log(`Wallet Balance: ₹${wallet.balance}`);
    console.log('==========================================');
    console.log('Default Password: Partner@123');
    console.log('⚠️  Please ask partner to change password after first login!');

    process.exit(0);
  } catch (error) {
    console.error('❌ Error seeding partner:', error.message);
    process.exit(1);
  }
};

seedPartner();
