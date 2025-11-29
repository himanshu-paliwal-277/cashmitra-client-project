/**
 * Test Sell Offer Session API with actual frontend data format
 */

const axios = require('axios');

const BASE_URL = 'http://localhost:5000/api';

// Actual data format from frontend
const testData = {
  userId: "6920368311ff76c397736741",
  productId: "68fd0e50b5ee2c5aeff7c5d2",
  variantId: "68fd0e50b5ee2c5aeff7c5d3",
  
  // Frontend sends answers as objects with questionId, selectedOptionId, answer
  answers: {
    "68f2a92aa1deae305b80c3a3": {
      questionId: "68f2a92aa1deae305b80c3a3",
      selectedOptionId: "option1",
      answer: "Flawless"
    },
    "68f2a92aa1deae305b80c3a9": {
      questionId: "68f2a92aa1deae305b80c3a9",
      selectedOptionId: "option2",
      answer: "Good"
    },
    "68f2a92aa1deae305b80c39d": {
      questionId: "68f2a92aa1deae305b80c39d",
      selectedOptionId: "option3",
      answer: "Working"
    },
    "68f2a92ba1deae305b80c3af": {
      questionId: "68f2a92ba1deae305b80c3af",
      selectedOptionId: "option4",
      answer: "Above 85%"
    },
    "68f2a92ba1deae305b80c3b5": {
      questionId: "68f2a92ba1deae305b80c3b5",
      selectedOptionId: "option5",
      answer: "Yes"
    }
  },
  
  // Defects array (with duplicates as in frontend)
  defects: [
    "68fd1d8763e9b2b4e773fc17",
    "68fd1d8763e9b2b4e773fc17"  // Duplicate
  ],
  
  // Accessories array
  accessories: []
};

async function testCreateSession() {
  try {
    console.log('\n🧪 Testing Sell Offer Session Creation');
    console.log('=' .repeat(60));
    
    console.log('\n📤 Sending data:');
    console.log(JSON.stringify(testData, null, 2));
    
    const response = await axios.post(
      `${BASE_URL}/sell-sessions/create`,
      testData,
      {
        headers: {
          'Content-Type': 'application/json'
        }
      }
    );
    
    console.log('\n✅ SUCCESS!');
    console.log('=' .repeat(60));
    console.log('\n📥 Response:');
    console.log(JSON.stringify(response.data, null, 2));
    
    console.log('\n📊 Summary:');
    console.log(`Session ID: ${response.data.data.sessionId}`);
    console.log(`Session Token: ${response.data.data.sessionToken}`);
    console.log(`Base Price: ₹${response.data.data.pricing.basePrice}`);
    console.log(`Final Price: ₹${response.data.data.pricing.finalPrice}`);
    console.log(`Adjustment: ₹${response.data.data.pricing.adjustment}`);
    console.log(`\nAnswers Stored: ${Object.keys(response.data.data.assessment.answers).length}`);
    console.log(`Defects Stored: ${response.data.data.assessment.defects.length}`);
    console.log(`Accessories Stored: ${response.data.data.assessment.accessories.length}`);
    
    if (response.data.data.pricing.breakdown) {
      console.log('\n💰 Price Breakdown:');
      response.data.data.pricing.breakdown.forEach(item => {
        const sign = item.delta >= 0 ? '+' : '';
        console.log(`  ${item.label}: ${sign}₹${item.delta}`);
      });
    }
    
    return response.data.data;
  } catch (error) {
    console.log('\n❌ ERROR!');
    console.log('=' .repeat(60));
    
    if (error.response) {
      console.log('Status:', error.response.status);
      console.log('Error:', JSON.stringify(error.response.data, null, 2));
    } else {
      console.log('Error:', error.message);
    }
    
    throw error;
  }
}

async function testGetSession(sessionId) {
  try {
    console.log('\n\n🔍 Testing Get Session');
    console.log('=' .repeat(60));
    console.log(`Session ID: ${sessionId}`);
    
    const response = await axios.get(
      `${BASE_URL}/sell-sessions/${sessionId}`
    );
    
    console.log('\n✅ Session Retrieved!');
    console.log('Product:', response.data.data.productId?.name);
    console.log('User:', response.data.data.userId?.name);
    console.log('Final Price: ₹', response.data.data.finalPrice);
    console.log('Expires At:', response.data.data.expiresAt);
    
    return response.data.data;
  } catch (error) {
    console.log('\n❌ Get Session Error!');
    if (error.response) {
      console.log('Error:', JSON.stringify(error.response.data, null, 2));
    } else {
      console.log('Error:', error.message);
    }
  }
}

// Run tests
async function runTests() {
  try {
    // Test 1: Create session
    const sessionData = await testCreateSession();
    
    // Test 2: Get session
    if (sessionData && sessionData.sessionId) {
      await testGetSession(sessionData.sessionId);
    }
    
    console.log('\n\n✅ All tests completed successfully!');
    console.log('=' .repeat(60));
    
  } catch (error) {
    console.log('\n\n❌ Tests failed!');
    process.exit(1);
  }
}

// Execute
runTests();
