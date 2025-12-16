import mongoose from 'mongoose';

import { MONGODB_URI, NODE_ENV } from './serverConfig.js';

const connectDB = async () => {
  try {
    if (NODE_ENV === 'development') {
      await mongoose.connect(MONGODB_URI);
    } else {
      await mongoose.connect(MONGODB_URI);
    }
    console.log(`🟢 MongoDB successfully connected (${NODE_ENV} environment)`);
  } catch (error) {
    console.error('MongoDB connection error:', error);
  }
};

export default connectDB;
