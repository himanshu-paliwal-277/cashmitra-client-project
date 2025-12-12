// Test script for Super Category API
// Run this with: node test-super-category-api.js

const fetch = require('node-fetch');

const API_BASE_URL = 'http://localhost:5000/api';

// You need to replace this with a valid admin token
const ADMIN_TOKEN = 'YOUR_ADMIN_TOKEN_HERE';

async function testSuperCategoryAPI() {
  console.log('🧪 Testing Super Category API...\n');

  try {
    // Test 1: Get all super categories
    console.log('1️⃣ Testing GET /api/buy-super-categories');
    const response1 = await fetch(`${API_BASE_URL}/buy-super-categories`, {
      headers: {
        Authorization: `Bearer ${ADMIN_TOKEN}`,
      },
    });
    const data1 = await response1.json();
    console.log('Status:', response1.status);
    console.log('Response:', JSON.stringify(data1, null, 2));
    console.log('✅ Test 1 completed\n');
  } catch (error) {
    console.error('❌ Error:', error.message);
  }
}

// Instructions
console.log('📝 Instructions:');
console.log('1. Make sure backend server is running on port 5000');
console.log('2. Replace ADMIN_TOKEN with a valid admin token');
console.log('3. Run: node test-super-category-api.js\n');

if (ADMIN_TOKEN === 'YOUR_ADMIN_TOKEN_HERE') {
  console.log('⚠️  Please set ADMIN_TOKEN before running tests');
} else {
  testSuperCategoryAPI();
}
