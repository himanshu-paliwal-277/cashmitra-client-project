const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const User = require('../models/user.model');
require('dotenv').config();

// Additional sample users data
const additionalUsers = [
  {
    name: 'Alice Brown',
    email: 'alice.brown@example.com',
    password: 'password123',
    phone: '9876543215',
    role: 'user',
    isVerified: true
  },
  {
    name: 'Bob Davis',
    email: 'bob.davis@example.com',
    password: 'password123',
    phone: '9876543216',
    role: 'partner',
    isVerified: false
  },
  {
    name: 'Carol White',
    email: 'carol.white@example.com',
    password: 'password123',
    phone: '9876543217',
    role: 'user',
    isVerified: true
  },
  {
    name: 'David Green',
    email: 'david.green@example.com',
    password: 'password123',
    phone: '9876543218',
    role: 'user',
    isVerified: false
  },
  {
    name: 'Emma Wilson',
    email: 'emma.wilson@example.com',
    password: 'password123',
    phone: '9876543219',
    role: 'partner',
    isVerified: true
  }
];

async function addMoreUsers() {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/cashify');
    console.log('Connected to MongoDB');

    // Show existing users
    const existingUsers = await User.find({}, 'name email role isVerified');
    console.log(`\nExisting users (${existingUsers.length}):`);
    existingUsers.forEach(user => {
      console.log(`- ${user.name} (${user.email}) - Role: ${user.role}, Verified: ${user.isVerified}`);
    });

    // Hash passwords and create new users
    const usersToCreate = await Promise.all(
      additionalUsers.map(async (user) => {
        const hashedPassword = await bcrypt.hash(user.password, 12);
        return {
          ...user,
          password: hashedPassword
        };
      })
    );

    // Insert new users
    const createdUsers = await User.insertMany(usersToCreate);
    console.log(`\nSuccessfully created ${createdUsers.length} new users:`);
    
    createdUsers.forEach(user => {
      console.log(`- ${user.name} (${user.email}) - Role: ${user.role}`);
    });

    // Show total count
    const totalUsers = await User.countDocuments();
    console.log(`\nTotal users in database: ${totalUsers}`);

  } catch (error) {
    console.error('Error adding users:', error);
  } finally {
    await mongoose.connection.close();
    console.log('Database connection closed');
  }
}

// Run the function
if (require.main === module) {
  addMoreUsers();
}

module.exports = addMoreUsers;