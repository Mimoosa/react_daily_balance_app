const mongoose = require('mongoose');
require('dotenv').config();
const User = require('../models/User');
const Friends = require('../models/Friends');

/**
 * Migration script to populate User model's friend fields from Friends collection
 */
const migrateUserFriends = async () => {
  try {
    // Connect to database
    await mongoose.connect(process.env.MONGODB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true
    });
    
    console.log('MongoDB Connected for friend migration script');
    
    // Get all friendship records
    const friendships = await Friends.find({});
    console.log(`Found ${friendships.length} friendship records to migrate`);
    
    let acceptedCount = 0;
    let pendingCount = 0;
    let errorCount = 0;
    
    // Process each friendship record
    for (const friendship of friendships) {
      try {
        const { requester: requesterId, recipient: recipientId, status } = friendship;
        
        // Find users
        const requesterUser = await User.findById(requesterId);
        const recipientUser = await User.findById(recipientId);
        
        if (!requesterUser || !recipientUser) {
          console.log(`Skipping friendship ${friendship._id}: User not found`);
          errorCount++;
          continue;
        }
        
        if (status === 'accepted') {
          // Add each other to friends list if they're not already there
          if (!requesterUser.friends.includes(recipientId)) {
            requesterUser.friends.push(recipientId);
            await requesterUser.save();
          }
          
          if (!recipientUser.friends.includes(requesterId)) {
            recipientUser.friends.push(requesterId);
            await recipientUser.save();
          }
          
          console.log(`Migrated accepted friendship between ${requesterUser.username} and ${recipientUser.username}`);
          acceptedCount++;
          
        } else if (status === 'pending') {
          // Add to appropriate friend request lists
          const existingSentRequest = requesterUser.friendRequests.sent.find(
            req => req.user && req.user.toString() === recipientId.toString()
          );
          
          if (!existingSentRequest) {
            requesterUser.friendRequests.sent.push({ user: recipientId });
            await requesterUser.save();
          }
          
          const existingReceivedRequest = recipientUser.friendRequests.received.find(
            req => req.user && req.user.toString() === requesterId.toString()
          );
          
          if (!existingReceivedRequest) {
            recipientUser.friendRequests.received.push({ user: requesterId });
            await recipientUser.save();
          }
          
          console.log(`Migrated pending request from ${requesterUser.username} to ${recipientUser.username}`);
          pendingCount++;
        }
        
      } catch (err) {
        console.error(`Error processing friendship ${friendship._id}:`, err);
        errorCount++;
      }
    }
    
    console.log('Friend migration summary:');
    console.log(`- Accepted friendships migrated: ${acceptedCount}`);
    console.log(`- Pending requests migrated: ${pendingCount}`);
    console.log(`- Errors encountered: ${errorCount}`);
    
  } catch (error) {
    console.error('Migration script error:', error);
  } finally {
    // Close the connection
    await mongoose.connection.close();
    console.log('Database connection closed');
  }
};

// Execute if run directly
if (require.main === module) {
  migrateUserFriends()
    .then(() => process.exit(0))
    .catch(err => {
      console.error(err);
      process.exit(1);
    });
}

module.exports = { migrateUserFriends };
