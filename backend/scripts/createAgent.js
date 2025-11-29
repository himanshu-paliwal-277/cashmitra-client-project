/**
 * Script to create an Agent/Driver user for testing
 * Run this with: node backend/scripts/createAgent.js
 */

const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
require('dotenv').config();

// User Model
const userSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true, select: false },
  phone: String,
  role: {
    type: String,
    enum: ['user', 'partner', 'admin', 'vendor', 'driver'],
    default: 'user'
  },
  isVerified: { type: Boolean, default: false },
  address: {
    street: String,
    city: String,
    state: String,
    pincode: String,
    country: String
  },
  profileImage: String
}, {
  timestamps: true
});

// Hash password before saving
userSchema.pre('save', async function(next) {
  if (!this.isModified('password')) return next();
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

userSchema.methods.matchPassword = async function(enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

const User = mongoose.model('User', userSchema);

// Connect to MongoDB
const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/cashify');
    console.log('✅ MongoDB Connected');
  } catch (error) {
    console.error('❌ MongoDB Connection Error:', error.message);
    process.exit(1);
  }
};

// Create Agent User
const createAgent = async () => {
  try {
    await connectDB();

    // Check if agent already exists
    const existingAgent = await User.findOne({ email: 'agent@cashify.com' });
    
    if (existingAgent) {
      console.log('⚠️  Agent already exists!');
      console.log('📧 Email:', existingAgent.email);
      console.log('👤 Name:', existingAgent.name);
      console.log('🔑 Role:', existingAgent.role);
      console.log('\n🔐 Use password: agent123');
      
      // Update password in case it was changed
      existingAgent.password = 'agent123';
      await existingAgent.save();
      console.log('✅ Password reset to: agent123');
    } else {
      // Create new agent
      const agent = await User.create({
        name: 'Test Agent',
        email: 'agent@cashify.com',
        password: 'agent123',
        phone: '+91 9876543210',
        role: 'driver',
        isVerified: true,
        address: {
          city: 'Mumbai',
          state: 'Maharashtra',
          country: 'India'
        }
      });

      console.log('✅ Agent Created Successfully!');
      console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
      console.log('📧 Email:', agent.email);
      console.log('🔑 Password: agent123');
      console.log('👤 Name:', agent.name);
      console.log('📱 Phone:', agent.phone);
      console.log('🎭 Role:', agent.role);
      console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    }

    console.log('\n🚀 You can now login with:');
    console.log('   Email: agent@cashify.com');
    console.log('   Password: agent123');
    console.log('\n🌐 Login URL: http://localhost:3000/agent/login');

    process.exit(0);
  } catch (error) {
    console.error('❌ Error creating agent:', error.message);
    process.exit(1);
  }
};

// Run the script
createAgent();
