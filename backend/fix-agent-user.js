const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
require('dotenv').config();
const User = require('./src/models/user.model');

async function fixAgent() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to MongoDB');

    const user = await User.findOne({ email: 'agent@cashify.com' });

    if (!user) {
      console.log('User not found!');
      await mongoose.disconnect();
      return;
    }

    console.log('\nBefore:');
    console.log('Email:', user.email);
    console.log('Role:', user.role);
    console.log('Active:', user.isActive);
    console.log('Verified:', user.isVerified);

    // Hash password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash('agent123', salt);

    user.role = 'agent';
    user.isActive = true;
    user.isVerified = true;
    user.password = hashedPassword;
    await user.save();

    console.log('\n✅ Updated!');
    console.log('Role:', user.role);
    console.log('Active:', user.isActive);
    console.log('Verified:', user.isVerified);
    console.log('Password reset to: agent123');

    await mongoose.disconnect();
    console.log('\n✅ Done!');
  } catch (error) {
    console.error('Error:', error);
    process.exit(1);
  }
}

fixAgent();
