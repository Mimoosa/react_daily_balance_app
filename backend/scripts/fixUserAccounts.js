const mongoose = require('mongoose');
require('dotenv').config();
const User = require('../models/User');

// Function to update users without passwords
const fixUserAccounts = async () => {
  try {
    // Connect to database
    await mongoose.connect(process.env.MONGO_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true
    });
    
    console.log('MongoDB Connected for user fix script');
    
    // Find users without passwords
    const usersWithoutPassword = await User.find({ password: { $exists: false } });
    console.log(`Found ${usersWithoutPassword.length} users without passwords`);
    
    // Set temporary passwords for these users
    const defaultPassword = 'TemporaryPassword123!'; // They should change this later
    
    for (const user of usersWithoutPassword) {
      user.password = defaultPassword;
      await user.save();
      console.log(`Set temporary password for user: ${user.username} (${user._id})`);
    }
    
    console.log('User account fix completed');
    
  } catch (error) {
    console.error('Error in fix script:', error);
  } finally {
    // Close the connection
    await mongoose.connection.close();
    console.log('Database connection closed');
  }
};

// Execute if run directly
if (require.main === module) {
  fixUserAccounts()
    .then(() => process.exit(0))
    .catch(err => {
      console.error(err);
      process.exit(1);
    });
}

module.exports = { fixUserAccounts };
