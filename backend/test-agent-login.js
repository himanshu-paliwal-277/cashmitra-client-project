/**
 * Test Agent Login API
 * Run with: node backend/test-agent-login.js
 */

const axios = require('axios');

const API_URL = 'http://localhost:5000/api';

// Test credentials
const credentials = {
  email: 'agent@cashify.com',
  password: 'agent123',
};

async function testAgentLogin() {
  console.log('🧪 Testing Agent Login...\n');
  console.log('📧 Email:', credentials.email);
  console.log('🔑 Password:', credentials.password);
  console.log('🌐 URL:', `${API_URL}/agent/login`);
  console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

  try {
    const response = await axios.post(`${API_URL}/agent/login`, credentials);

    console.log('✅ LOGIN SUCCESSFUL!\n');
    console.log('Response Status:', response.status);
    console.log('Response Data:', JSON.stringify(response.data, null, 2));

    if (response.data.data && response.data.data.token) {
      console.log('\n🎟️  JWT Token:', response.data.data.token);
      console.log('\n✅ You can now use this token for authenticated requests');
      console.log(
        '   Add to headers: Authorization: Bearer ' + response.data.data.token
      );
    }
  } catch (error) {
    console.log('❌ LOGIN FAILED!\n');

    if (error.response) {
      // Server responded with error
      console.log('Status Code:', error.response.status);
      console.log(
        'Error Message:',
        error.response.data.message || 'No message'
      );
      console.log(
        'Full Response:',
        JSON.stringify(error.response.data, null, 2)
      );

      if (error.response.status === 401) {
        console.log('\n💡 TROUBLESHOOTING TIPS:');
        console.log('   1. Make sure the agent user exists in database');
        console.log('   2. Run: node backend/scripts/createAgent.js');
        console.log('   3. Verify the user has role: "driver"');
        console.log('   4. Check if password is correct');
        console.log('   5. Make sure backend server is running');
      }
    } else if (error.request) {
      // Request made but no response
      console.log('❌ No response from server');
      console.log('   Make sure backend is running on http://localhost:5000');
    } else {
      // Something else happened
      console.log('Error:', error.message);
    }
  }
}

// Run the test
testAgentLogin();
