const { MongoClient } = require('mongodb');
const bcrypt = require('bcryptjs');
require('dotenv').config();

async function directUpdate() {
  const uri = process.env.MONGODB_URI;
  const client = new MongoClient(uri);
  
  try {
    console.log('🔄 Connecting to MongoDB Atlas...');
    await client.connect();
    console.log('✅ Connected!\n');
    
    const db = client.db();
    const usersCollection = db.collection('users');
    const agentsCollection = db.collection('agents');
    
    // Find user
    console.log('🔍 Finding user...');
    const user = await usersCollection.findOne({ email: 'agent@cashify.com' });
    
    if (!user) {
      console.log('❌ User not found!');
      return;
    }
    
    console.log('\n📋 CURRENT STATE:');
    console.log(JSON.stringify({
      email: user.email,
      role: user.role,
      isActive: user.isActive,
      isVerified: user.isVerified
    }, null, 2));
    
    // Hash password
    console.log('\n🔐 Hashing password...');
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash('agent123', salt);
    
    // Update user
    console.log('🔧 Updating user...');
    const result = await usersCollection.updateOne(
      { email: 'agent@cashify.com' },
      {
        $set: {
          role: 'agent',
          isActive: true,
          isVerified: true,
          password: hashedPassword
        }
      }
    );
    
    console.log(`✅ User updated! (${result.modifiedCount} document(s) modified)`);
    
    // Check if agent profile exists
    console.log('\n🔍 Checking agent profile...');
    const agent = await agentsCollection.findOne({ user: user._id });
    
    if (agent) {
      console.log('✅ Agent profile exists');
      console.log('   Agent Code:', agent.agentCode);
    } else {
      console.log('⚠️  Agent profile not found - please run seed-agent.js');
    }
    
    // Verify changes
    console.log('\n🔍 Verifying changes...');
    const updatedUser = await usersCollection.findOne({ email: 'agent@cashify.com' });
    console.log('\n📋 NEW STATE:');
    console.log(JSON.stringify({
      email: updatedUser.email,
      role: updatedUser.role,
      isActive: updatedUser.isActive,
      isVerified: updatedUser.isVerified
    }, null, 2));
    
    console.log('\n' + '='.repeat(60));
    console.log('✅ UPDATE COMPLETE!');
    console.log('='.repeat(60));
    console.log('Login: agent@cashify.com');
    console.log('Password: agent123');
    console.log('='.repeat(60));
    
  } catch (error) {
    console.error('\n❌ Error:', error.message);
  } finally {
    await client.close();
    console.log('\n✅ Disconnected');
  }
}

directUpdate();
