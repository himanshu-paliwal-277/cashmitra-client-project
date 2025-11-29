const mongoose = require('mongoose');
require('dotenv').config();

// Connect to MongoDB
const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/cashify', {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log('✅ MongoDB Connected');
  } catch (error) {
    console.error('❌ MongoDB Connection Error:', error);
    process.exit(1);
  }
};

// Import model
const RoleTemplate = require('./src/models/roleTemplate.model');

const testRoleTemplates = async () => {
  try {
    await connectDB();
    
    console.log('\n📋 Fetching all role templates from database...\n');
    
    // Get all templates (including inactive)
    const allTemplates = await RoleTemplate.find({}).sort({ createdAt: -1 });
    
    console.log(`Total templates in database: ${allTemplates.length}\n`);
    
    allTemplates.forEach((template, index) => {
      console.log(`${index + 1}. ${template.displayName} (${template.name})`);
      console.log(`   - ID: ${template._id}`);
      console.log(`   - Default: ${template.isDefault}`);
      console.log(`   - Active: ${template.isActive}`);
      console.log(`   - Permissions: ${template.permissions.length} (${template.permissions.join(', ')})`);
      console.log(`   - Created: ${template.createdAt}`);
      console.log('');
    });
    
    // Test the getActiveTemplates method
    console.log('📋 Testing getActiveTemplates() method...\n');
    const activeTemplates = await RoleTemplate.getActiveTemplates();
    console.log(`Active templates count: ${activeTemplates.length}\n`);
    
    activeTemplates.forEach((template, index) => {
      console.log(`${index + 1}. ${template.displayName} (${template.name}) - ${template.isDefault ? 'DEFAULT' : 'CUSTOM'}`);
    });
    
    mongoose.disconnect();
    console.log('\n✅ Test completed');
  } catch (error) {
    console.error('❌ Error:', error);
    mongoose.disconnect();
  }
};

testRoleTemplates();
