/**
 * @fileoverview Agent App API Test Script
 * @description Tests all agent app endpoints
 */

const axios = require('axios');

// Configuration
const BASE_URL = 'http://localhost:5000/api';
const AGENT_APP_URL = `${BASE_URL}/agent-app`;

// Test credentials
const AGENT_CREDENTIALS = {
  email: 'agent@test.com',
  password: 'agent123',
};

let authToken = '';
let agentId = '';
let testOrderId = '';
let testPickupId = '';

// Helper function to log test results
const logTest = (testName, success, data = null, error = null) => {
  console.log('\n' + '='.repeat(60));
  console.log(`TEST: ${testName}`);
  console.log('='.repeat(60));
  if (success) {
    console.log('✅ SUCCESS');
    if (data) {
      console.log('Response:', JSON.stringify(data, null, 2));
    }
  } else {
    console.log('❌ FAILED');
    if (error) {
      console.log('Error:', error.message);
      if (error.response?.data) {
        console.log(
          'Error Details:',
          JSON.stringify(error.response.data, null, 2)
        );
      }
    }
  }
};

// Helper function to make authenticated requests
const authenticatedRequest = async (method, url, data = null) => {
  const config = {
    method,
    url,
    headers: {
      Authorization: `Bearer ${authToken}`,
      'Content-Type': 'application/json',
    },
  };

  if (data) {
    config.data = data;
  }

  return axios(config);
};

// Test functions

// 1. Test agent login
async function testLogin() {
  try {
    const response = await axios.post(
      `${AGENT_APP_URL}/login`,
      AGENT_CREDENTIALS
    );
    authToken = response.data.data.token;
    agentId = response.data.data.agent._id;
    logTest('Agent Login', true, response.data);
    return true;
  } catch (error) {
    logTest('Agent Login', false, null, error);
    return false;
  }
}

// 2. Test get agent profile
async function testGetProfile() {
  try {
    const response = await authenticatedRequest(
      'GET',
      `${AGENT_APP_URL}/profile`
    );
    logTest('Get Agent Profile', true, response.data);
    return true;
  } catch (error) {
    logTest('Get Agent Profile', false, null, error);
    return false;
  }
}

// 3. Test get today's orders
async function testGetTodayOrders() {
  try {
    const response = await authenticatedRequest(
      'GET',
      `${AGENT_APP_URL}/orders/today`
    );
    if (response.data.data.orders.length > 0) {
      testOrderId = response.data.data.orders[0].orderId;
      testPickupId = response.data.data.orders[0].pickupId;
    }
    logTest("Get Today's Orders", true, response.data);
    return true;
  } catch (error) {
    logTest("Get Today's Orders", false, null, error);
    return false;
  }
}

// 4. Test get tomorrow's orders
async function testGetTomorrowOrders() {
  try {
    const response = await authenticatedRequest(
      'GET',
      `${AGENT_APP_URL}/orders/tomorrow`
    );
    logTest("Get Tomorrow's Orders", true, response.data);
    return true;
  } catch (error) {
    logTest("Get Tomorrow's Orders", false, null, error);
    return false;
  }
}

// 5. Test get past orders
async function testGetPastOrders() {
  try {
    const response = await authenticatedRequest(
      'GET',
      `${AGENT_APP_URL}/orders/past?page=1&limit=10`
    );
    logTest('Get Past Orders', true, response.data);
    return true;
  } catch (error) {
    logTest('Get Past Orders', false, null, error);
    return false;
  }
}

// 6. Test get order details
async function testGetOrderDetails() {
  if (!testOrderId) {
    logTest('Get Order Details', false, null, {
      message: 'No test order ID available',
    });
    return false;
  }

  try {
    const response = await authenticatedRequest(
      'GET',
      `${AGENT_APP_URL}/orders/${testOrderId}`
    );
    logTest('Get Order Details', true, response.data);
    return true;
  } catch (error) {
    logTest('Get Order Details', false, null, error);
    return false;
  }
}

// 7. Test start pickup
async function testStartPickup() {
  if (!testPickupId) {
    logTest('Start Pickup', false, null, {
      message: 'No test pickup ID available',
    });
    return false;
  }

  try {
    const response = await authenticatedRequest(
      'PUT',
      `${AGENT_APP_URL}/pickups/${testPickupId}/start`
    );
    logTest('Start Pickup', true, response.data);
    return true;
  } catch (error) {
    logTest('Start Pickup', false, null, error);
    return false;
  }
}

// 8. Test get evaluation questions
async function testGetEvaluationQuestions() {
  // Using a dummy product ID - replace with actual product ID from your database
  const dummyProductId = '507f1f77bcf86cd799439011';

  try {
    const response = await authenticatedRequest(
      'GET',
      `${AGENT_APP_URL}/evaluation/questions/${dummyProductId}`
    );
    logTest('Get Evaluation Questions', true, response.data);
    return true;
  } catch (error) {
    logTest('Get Evaluation Questions', false, null, error);
    return false;
  }
}

// 9. Test calculate price
async function testCalculatePrice() {
  if (!testOrderId) {
    logTest('Calculate Price', false, null, {
      message: 'No test order ID available',
    });
    return false;
  }

  try {
    const requestData = {
      orderId: testOrderId,
      answers: [
        {
          questionId: '507f1f77bcf86cd799439011',
          selectedOptionId: '507f1f77bcf86cd799439012',
        },
      ],
      selectedDefects: ['507f1f77bcf86cd799439013'],
      physicalInspection: {
        screenCondition: 'good',
        bodyCondition: 'excellent',
        functionalCondition: 'working',
      },
    };

    const response = await authenticatedRequest(
      'POST',
      `${AGENT_APP_URL}/evaluation/calculate-price`,
      requestData
    );
    logTest('Calculate Price', true, response.data);
    return true;
  } catch (error) {
    logTest('Calculate Price', false, null, error);
    return false;
  }
}

// 10. Test complete evaluation
async function testCompleteEvaluation() {
  if (!testPickupId) {
    logTest('Complete Evaluation', false, null, {
      message: 'No test pickup ID available',
    });
    return false;
  }

  try {
    const requestData = {
      finalPrice: 15000,
      adjustmentReason: 'Minor scratches found on screen',
      answers: [
        {
          questionId: '507f1f77bcf86cd799439011',
          selectedOptionId: '507f1f77bcf86cd799439012',
        },
      ],
      selectedDefects: ['507f1f77bcf86cd799439013'],
      photos: [
        'https://example.com/photo1.jpg',
        'https://example.com/photo2.jpg',
      ],
    };

    const response = await authenticatedRequest(
      'PUT',
      `${AGENT_APP_URL}/pickups/${testPickupId}/complete-evaluation`,
      requestData
    );
    logTest('Complete Evaluation', true, response.data);
    return true;
  } catch (error) {
    logTest('Complete Evaluation', false, null, error);
    return false;
  }
}

// 11. Test complete payment
async function testCompletePayment() {
  if (!testOrderId) {
    logTest('Complete Payment', false, null, {
      message: 'No test order ID available',
    });
    return false;
  }

  try {
    const requestData = {
      paymentMethod: 'cash',
      transactionId: 'CASH_' + Date.now(),
      paymentProof: 'https://example.com/receipt.jpg',
    };

    const response = await authenticatedRequest(
      'PUT',
      `${AGENT_APP_URL}/orders/${testOrderId}/payment`,
      requestData
    );
    logTest('Complete Payment', true, response.data);
    return true;
  } catch (error) {
    logTest('Complete Payment', false, null, error);
    return false;
  }
}

// 12. Test get statistics
async function testGetStatistics() {
  try {
    const response = await authenticatedRequest(
      'GET',
      `${AGENT_APP_URL}/statistics`
    );
    logTest('Get Statistics', true, response.data);
    return true;
  } catch (error) {
    logTest('Get Statistics', false, null, error);
    return false;
  }
}

// 13. Test update location
async function testUpdateLocation() {
  try {
    const requestData = {
      latitude: 28.6139,
      longitude: 77.209,
    };

    const response = await authenticatedRequest(
      'PUT',
      `${AGENT_APP_URL}/location`,
      requestData
    );
    logTest('Update Location', true, response.data);
    return true;
  } catch (error) {
    logTest('Update Location', false, null, error);
    return false;
  }
}

// Main test runner
async function runAllTests() {
  console.log('\n\n');
  console.log('╔════════════════════════════════════════════════════════════╗');
  console.log('║         AGENT APP API TEST SUITE                          ║');
  console.log('╚════════════════════════════════════════════════════════════╝');

  const results = {
    passed: 0,
    failed: 0,
    skipped: 0,
  };

  // Phase 1: Authentication
  console.log('\n📱 PHASE 1: Authentication');
  if (await testLogin()) {
    results.passed++;
  } else {
    results.failed++;
    console.log('\n⚠️  Authentication failed. Stopping tests.');
    return;
  }

  // Phase 2: Profile & Orders
  console.log('\n📋 PHASE 2: Profile & Orders');
  results.passed += (await testGetProfile()) ? 1 : 0;
  results.passed += (await testGetTodayOrders()) ? 1 : 0;
  results.passed += (await testGetTomorrowOrders()) ? 1 : 0;
  results.passed += (await testGetPastOrders()) ? 1 : 0;

  if (testOrderId) {
    results.passed += (await testGetOrderDetails()) ? 1 : 0;
  } else {
    console.log('\n⚠️  Skipping order details test - no orders found');
    results.skipped++;
  }

  // Phase 3: Pickup Operations
  console.log('\n🚚 PHASE 3: Pickup Operations');
  if (testPickupId) {
    results.passed += (await testStartPickup()) ? 1 : 0;
  } else {
    console.log('\n⚠️  Skipping pickup tests - no pickup ID available');
    results.skipped++;
  }

  // Phase 4: Evaluation
  console.log('\n🔍 PHASE 4: Evaluation');
  results.passed += (await testGetEvaluationQuestions()) ? 1 : 0;
  results.passed += (await testCalculatePrice()) ? 1 : 0;

  if (testPickupId) {
    results.passed += (await testCompleteEvaluation()) ? 1 : 0;
  } else {
    console.log('\n⚠️  Skipping complete evaluation - no pickup ID available');
    results.skipped++;
  }

  // Phase 5: Payment
  console.log('\n💰 PHASE 5: Payment');
  if (testOrderId) {
    results.passed += (await testCompletePayment()) ? 1 : 0;
  } else {
    console.log('\n⚠️  Skipping payment test - no order ID available');
    results.skipped++;
  }

  // Phase 6: Analytics & Location
  console.log('\n📊 PHASE 6: Analytics & Location');
  results.passed += (await testGetStatistics()) ? 1 : 0;
  results.passed += (await testUpdateLocation()) ? 1 : 0;

  // Final results
  console.log('\n\n');
  console.log('╔════════════════════════════════════════════════════════════╗');
  console.log('║                    TEST RESULTS                           ║');
  console.log('╚════════════════════════════════════════════════════════════╝');
  console.log(`\n✅ Passed: ${results.passed}`);
  console.log(`❌ Failed: ${results.failed}`);
  console.log(`⚠️  Skipped: ${results.skipped}`);
  console.log(
    `\nTotal Tests: ${results.passed + results.failed + results.skipped}`
  );
  console.log('\n');
}

// Run tests
runAllTests().catch((error) => {
  console.error('Test suite error:', error);
  process.exit(1);
});
