/**
 * Agent Seeder
 * Creates test agent user for Agent App testing
 */

const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, 'backend', '.env') });

// Models
const User = require('./backend/src/models/user.model');
const Agent = require('./backend/src/models/agent.model');

const agentData = {
  user: {
    name: 'Test Agent',
    email: 'agent@cashify.com',
    password: 'agent123',
    phone: '+919876543210',
    role: 'agent',
    isActive: true,
    isVerified: true
  },
  agent: {
    employeeId: 'EMP001',
    coverageAreas: ['Mumbai', 'Thane', 'Navi Mumbai'],
    documents: {
      aadhar: {
        number: '123456789012',
        verified: true
      },
      pan: {
        number: 'ABCDE1234F',
        verified: true
      },
      drivingLicense: {
        number: 'MH0120230001234',
        verified: true
      }
    },
    bankDetails: {
      accountNumber: '1234567890',
      ifscCode: 'HDFC0001234',
      accountHolderName: 'Test Agent',
      bankName: 'HDFC Bank'
    }
  }
};

async function seedAgent() {
  try {
    console.log('🔄 Connecting to MongoDB...');
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/cashify');
    console.log('✅ Connected to MongoDB\n');

    // Check if agent already exists
    const existingUser = await User.findOne({ email: agentData.user.email });
    
    if (existingUser) {
      console.log('⚠️  Agent user already exists!');
      console.log(`   Email: ${existingUser.email}`);
      console.log(`   Role: ${existingUser.role}`);
      
      // Check if agent profile exists
      const existingAgent = await Agent.findOne({ user: existingUser._id });
      
      if (existingAgent) {
        console.log(`   Agent Code: ${existingAgent.agentCode}`);
        console.log('\n✅ Agent is ready for testing!\n');
      } else {
        console.log('\n⚠️  User exists but Agent profile missing. Creating Agent profile...');
        
        const newAgent = new Agent({
          user: existingUser._id,
          employeeId: agentData.agent.employeeId,
          coverageAreas: agentData.agent.coverageAreas,
          documents: agentData.agent.documents,
          bankDetails: agentData.agent.bankDetails
        });
        
        await newAgent.save();
        console.log(`✅ Agent profile created!`);
        console.log(`   Agent Code: ${newAgent.agentCode}\n`);
      }
      
      await mongoose.disconnect();
      return;
    }

    console.log('📝 Creating new agent user...');
    
    // Hash password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(agentData.user.password, salt);
    
    // Create user
    const user = new User({
      ...agentData.user,
      password: hashedPassword
    });
    
    await user.save();
    console.log(`✅ User created: ${user.email}`);
    
    // Create agent profile
    console.log('📝 Creating agent profile...');
    
    const agent = new Agent({
      user: user._id,
      employeeId: agentData.agent.employeeId,
      coverageAreas: agentData.agent.coverageAreas,
      documents: agentData.agent.documents,
      bankDetails: agentData.agent.bankDetails
    });
    
    await agent.save();
    
    console.log(`✅ Agent profile created!`);
    console.log('\n' + '='.repeat(60));
    console.log('AGENT DETAILS');
    console.log('='.repeat(60));
    console.log(`Name: ${user.name}`);
    console.log(`Email: ${user.email}`);
    console.log(`Password: ${agentData.user.password}`);
    console.log(`Phone: ${user.phone}`);
    console.log(`Role: ${user.role}`);
    console.log(`Agent Code: ${agent.agentCode}`);
    console.log(`Employee ID: ${agent.employeeId}`);
    console.log(`Coverage Areas: ${agent.coverageAreas.join(', ')}`);
    console.log('='.repeat(60));
    console.log('\n✅ Agent seeder completed successfully!');
    console.log('🚀 You can now run the agent app tests!\n');
    
    await mongoose.disconnect();
    console.log('✅ Disconnected from MongoDB\n');
    
  } catch (error) {
    console.error('\n❌ Error seeding agent:');
    console.error(error);
    process.exit(1);
  }
}

// Run seeder
seedAgent();
