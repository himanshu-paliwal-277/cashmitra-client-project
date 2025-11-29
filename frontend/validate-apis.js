const axios = require('axios');

const API_BASE = 'http://localhost:5000/api';

// Mock admin token (you'll need to replace with actual token)
const ADMIN_TOKEN = 'your-admin-token-here';

const api = axios.create({
  baseURL: API_BASE,
  headers: {
    'Authorization': `Bearer ${ADMIN_TOKEN}`,
    'Content-Type': 'application/json'
  }
});

async function validateBrandAPIs() {
  console.log('\n=== Testing Brand APIs ===');
  
  try {
    // Test GET brands
    console.log('1. Testing GET /admin/brands...');
    const brandsResponse = await api.get('/admin/brands');
    console.log('✅ GET brands successful:', brandsResponse.data.count, 'brands found');
    
    if (brandsResponse.data.data && brandsResponse.data.data.length > 0) {
      const firstBrand = brandsResponse.data.data[0].brand;
      
      // Test UPDATE brand
      console.log('2. Testing PUT /admin/brands/:brandName...');
      const updateResponse = await api.put(`/admin/brands/${encodeURIComponent(firstBrand)}`, {
        newBrandName: firstBrand + ' Updated'
      });
      console.log('✅ PUT brand successful:', updateResponse.data.message);
      
      // Test DELETE brand (with confirmation)
      console.log('3. Testing DELETE /admin/brands/:brandName...');
      const deleteResponse = await api.delete(`/admin/brands/${encodeURIComponent(firstBrand + ' Updated')}`, {
        data: { confirmDeletion: true }
      });
      console.log('✅ DELETE brand successful:', deleteResponse.data.message);
    }
    
  } catch (error) {
    console.error('❌ Brand API Error:', error.response?.data || error.message);
  }
}

async function validateModelAPIs() {
  console.log('\n=== Testing Model APIs ===');
  
  try {
    // Test GET models
    console.log('1. Testing GET /admin/models...');
    const modelsResponse = await api.get('/admin/models');
    console.log('✅ GET models successful:', modelsResponse.data.count, 'models found');
    
    if (modelsResponse.data.data && modelsResponse.data.data.length > 0) {
      const firstModel = modelsResponse.data.data[0].model;
      
      // Test UPDATE model
      console.log('2. Testing PUT /admin/models/:modelName...');
      const updateResponse = await api.put(`/admin/models/${encodeURIComponent(firstModel)}`, {
        description: 'Updated description for testing',
        isActive: true
      });
      console.log('✅ PUT model successful:', updateResponse.data.message);
      
      // Test DELETE model
      console.log('3. Testing DELETE /admin/models/:modelName...');
      const deleteResponse = await api.delete(`/admin/models/${encodeURIComponent(firstModel)}`);
      console.log('✅ DELETE model successful:', deleteResponse.data.message);
    }
    
  } catch (error) {
    console.error('❌ Model API Error:', error.response?.data || error.message);
  }
}

async function main() {
  console.log('Starting API validation...');
  console.log('Note: Update ADMIN_TOKEN variable with a valid token before running');
  
  await validateBrandAPIs();
  await validateModelAPIs();
  
  console.log('\n=== Validation Complete ===');
}

if (require.main === module) {
  main().catch(console.error);
}

module.exports = { validateBrandAPIs, validateModelAPIs };