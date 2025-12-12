const mongoose = require('mongoose');
const BuyCategory = require('./src/models/buyCategory.model');

async function createTestCategory() {
  try {
    await mongoose.connect('mongodb://localhost:27017/cashify');

    // Check if test category already exists
    let testCategory = await BuyCategory.findOne({ name: 'Test Smartphones' });

    if (!testCategory) {
      // Create a test category
      testCategory = new BuyCategory({
        name: 'Test Smartphones',
        createdBy: new mongoose.Types.ObjectId(),
      });

      testCategory = await testCategory.save();
      console.log(
        'Test category created with ID:',
        testCategory._id.toString()
      );
    } else {
      console.log(
        'Test category already exists with ID:',
        testCategory._id.toString()
      );
    }

    await mongoose.disconnect();
    return testCategory._id.toString();
  } catch (error) {
    console.error('Error:', error.message);
    process.exit(1);
  }
}

createTestCategory();
