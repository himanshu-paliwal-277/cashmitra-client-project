/**
 * @fileoverview Jest Global Teardown
 * @description Global teardown configuration that runs once after all tests
 * @author Cashify Development Team
 * @version 1.0.0
 */

const mongoose = require('mongoose');

module.exports = async () => {
  console.log('🧹 Starting global test teardown...');
  
  try {
    // Close any remaining mongoose connections
    if (mongoose.connection.readyState !== 0) {
      await mongoose.connection.close();
      console.log('✅ Mongoose connection closed');
    }
    
    // Stop MongoDB Memory Server
    if (global.__MONGOSERVER__) {
      await global.__MONGOSERVER__.stop();
      console.log('✅ MongoDB Memory Server stopped');
    }
    
    // Clean up global variables
    delete global.__MONGOSERVER__;
    delete global.__MONGO_URI__;
    
    console.log('✅ Global test teardown completed successfully');
    
  } catch (error) {
    console.error('❌ Global test teardown failed:', error);
    // Don't exit with error code as tests might have already passed
  }
};

console.log('✅ Global teardown configuration loaded!');