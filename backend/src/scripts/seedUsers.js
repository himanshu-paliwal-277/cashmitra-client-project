import bcrypt from 'bcryptjs';
import dotenv from 'dotenv';
import mongoose from 'mongoose';

import { User } from '../models/user.model.js';
dotenv.config();

const sampleUsers = [
  {
    name: 'John Doe',
    email: 'john.doe@example.com',
    password: 'password123',
    phone: '9876543210',
    role: 'user',
    isVerified: true,
  },
  {
    name: 'Jane Smith',
    email: 'jane.smith@example.com',
    password: 'password123',
    phone: '9876543211',
    role: 'user',
    isVerified: false,
  },
  {
    name: 'Mike Johnson',
    email: 'mike.johnson@example.com',
    password: 'password123',
    phone: '9876543212',
    role: 'partner',
    isVerified: true,
  },
  {
    name: 'Sarah Wilson',
    email: 'sarah.wilson@example.com',
    password: 'password123',
    phone: '9876543213',
    role: 'user',
    isVerified: true,
  },
  {
    name: 'Admin User',
    email: 'admin@cashmitra.com',
    password: 'admin123',
    phone: '9876543214',
    role: 'admin',
    isVerified: true,
  },
];

async function seedUsers() {
  try {
    await mongoose.connect(
      process.env.MONGO_URI || 'mongodb://localhost:27017/cashmitra'
    );
    console.log('Connected to MongoDB');

    const existingUsers = await User.countDocuments();
    if (existingUsers > 0) {
      console.log(
        `Database already has ${existingUsers} users. Skipping seed.`
      );
      return;
    }

    const usersToCreate = await Promise.all(
      sampleUsers.map(async (user) => {
        const hashedPassword = await bcrypt.hash(user.password, 12);
        return {
          ...user,
          password: hashedPassword,
        };
      })
    );

    const createdUsers = await User.insertMany(usersToCreate);
    console.log(`Successfully created ${createdUsers.length} users:`);

    createdUsers.forEach((user) => {
      console.log(`- ${user.name} (${user.email}) - Role: ${user.role}`);
    });
  } catch (error) {
    console.error('Error seeding users:', error);
  } finally {
    await mongoose.connection.close();
    console.log('Database connection closed');
  }
}

if (require.main === module) {
  seedUsers();
}

export default seedUsers;
