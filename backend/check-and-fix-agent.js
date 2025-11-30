const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
require('dotenv').config();
const User = require('./src/models/user.model');
const Agent = require('./src/models/agent.model');

async function checkAndFixAgent() {
  try {
    console.log('🔄 Connecting to MongoDB...');
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Connected to MongoDB\n');
    
    // Find user
    console.log('🔍 Looking for user: agent@cashify.com');
    const user = await User.findOne({ email: 'agent@cashify.com' });
    
    if (!user) {
      console.log('❌ User not found!');
      await mongoose.disconnect();
      return;
    }
    
    console.log('\n📋 CURRENT USER STATE:');
    console.log('   Email:', user.email);
    console.log('   Name:', user.name);
    console.log('   Role:', user.role);
    console.log('   Active:', user.isActive);
    console.log('   Verified:', user.isVerified);
    console.log('   Last Login:', user.lastLogin);
    
    // Find agent profile
    const agent = await Agent.findOne({ user: user._id });
    
    if (agent) {
      console.log('\n📋 AGENT PROFILE:');
      console.log('   Agent Code:', agent.agentCode);
      console.log('   Employee ID:', agent.employeeId);
      console.log('   Active:', agent.isActive);
      console.log('   Coverage Areas:', agent.coverageAreas.join(', '));
    } else {
      console.log('\n⚠️  No agent profile found!');
    }
    
    // Fix if needed
    let needsFix = false;
    
    if (user.role !== 'agent') {
      console.log('\n⚠️  User role is not "agent"');
      needsFix = true;
    }
    
    if (!user.isActive) {
      console.log('\n⚠️  User is not active');
      needsFix = true;
    }
    
    if (!user.isVerified) {
      console.log('\n⚠️  User is not verified');
      needsFix = true;
    }
    
    if (!agent) {
      console.log('\n⚠️  Agent profile missing');
      needsFix = true;
    }
    
    if (needsFix) {
      console.log('\n🔧 FIXING ISSUES...\n');
      
      // Update user
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash('agent123', salt);
      
      user.role = 'agent';
      user.isActive = true;
      user.isVerified = true;
      user.password = hashedPassword;
      await user.save();
      console.log('✅ User updated');
      
      // Create agent profile if missing
      if (!agent) {
        const agentCode = await Agent.generateAgentCode();
        
        const newAgent = new Agent({
          user: user._id,
          agentCode: agentCode,
          employeeId: 'EMP001',
          coverageAreas: ['Mumbai', 'Thane', 'Navi Mumbai'],
          documents: {
            aadharCard: '123456789012',
            panCard: 'ABCDE1234F',
            drivingLicense: 'MH0120230001234'
          },
          bankDetails: {
            accountNumber: '1234567890',
            ifscCode: 'HDFC0001234',
            accountHolderName: 'Test Agent',
            bankName: 'HDFC Bank'
          }
        });
        
        await newAgent.save();
        console.log('✅ Agent profile created');
        console.log('   Agent Code:', newAgent.agentCode);
      }
      
      console.log('\n✅ ALL FIXES APPLIED!');
    } else {
      console.log('\n✅ Everything looks good!');
    }
    
    console.log('\n' + '='.repeat(60));
    console.log('AGENT LOGIN CREDENTIALS');
    console.log('='.repeat(60));
    console.log('Email:    agent@cashify.com');
    console.log('Password: agent123');
    console.log('='.repeat(60));
    
    await mongoose.disconnect();
    console.log('\n✅ Disconnected from MongoDB');
    
  } catch (error) {
    console.error('\n❌ Error:', error.message);
    console.error(error);
    process.exit(1);
  }
}

checkAndFixAgent();
