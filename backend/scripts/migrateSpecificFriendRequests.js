const mongoose = require('mongoose');
require('dotenv').config();
const User = require('../models/User');
const Friends = require('../models/Friends');

/**
 * Migration script to handle specific friend requests that need to be migrated
 * to the new User model structure
 */
const migrateSpecificRequests = async () => {
  try {
    // Connect to database
    await mongoose.connect(process.env.MONGODB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true
    });
    
    console.log('MongoDB Connected for specific friend requests migration');
    
    // Specific request IDs to migrate
    const specificRequestIds = [
      '67c83732e8803d9c939febe9',
      '67c8374ce8803d9c939fec09'
    ];
    
    console.log(`Starting migration for ${specificRequestIds.length} specific friend requests`);
    
    // Process each specific request
    for (const requestId of specificRequestIds) {
      try {
        console.log(`Processing request ID: ${requestId}`);
        
        // Find the request in Friends collection
        const friendRequest = await Friends.findById(requestId);
        
        if (!friendRequest) {
          console.log(`Request ${requestId} not found in database`);
          continue;
        }
        
        console.log(`Found request: ${friendRequest.requester} -> ${friendRequest.recipient} (${friendRequest.status})`);
        
        // Get both users
        const requester = await User.findById(friendRequest.requester);
        const recipient = await User.findById(friendRequest.recipient);
        
        if (!requester || !recipient) {
          console.log(`Could not find one or both users: 
            Requester (${friendRequest.requester}): ${!!requester ? 'Found' : 'Missing'}
            Recipient (${friendRequest.recipient}): ${!!recipient ? 'Found' : 'Missing'}`);
          continue;
        }
        
        console.log(`Found both users: ${requester.username} and ${recipient.username}`);
        
        // Initialize friend request arrays if they don't exist
        if (!requester.friendRequests) {
          requester.friendRequests = { sent: [], received: [] };
          console.log(`Initialized friendRequests for ${requester.username}`);
        }
        
        if (!recipient.friendRequests) {
          recipient.friendRequests = { sent: [], received: [] };
          console.log(`Initialized friendRequests for ${recipient.username}`);
        }
        
        if (friendRequest.status === 'pending') {
          console.log('Status is pending, adding to appropriate request lists');
          
          // Check for duplicates
          const existingSentRequest = requester.friendRequests.sent?.find(
            req => req.user && req.user.toString() === recipient._id.toString()
          );
          
          if (!existingSentRequest) {
            // Add to requester's sent requests
            if (!requester.friendRequests.sent) requester.friendRequests.sent = [];
            requester.friendRequests.sent.push({
              user: recipient._id,
              createdAt: friendRequest.createdAt
            });
            await requester.save();
            console.log(`Added to ${requester.username}'s sent requests`);
          } else {
            console.log(`Request already exists in ${requester.username}'s sent requests`);
          }
          
          const existingReceivedRequest = recipient.friendRequests.received?.find(
            req => req.user && req.user.toString() === requester._id.toString()
          );
          
          if (!existingReceivedRequest) {
            // Add to recipient's received requests
            if (!recipient.friendRequests.received) recipient.friendRequests.received = [];
            recipient.friendRequests.received.push({
              user: requester._id,
              createdAt: friendRequest.createdAt
            });
            await recipient.save();
            console.log(`Added to ${recipient.username}'s received requests`);
          } else {
            console.log(`Request already exists in ${recipient.username}'s received requests`);
          }
          
        } else if (friendRequest.status === 'accepted') {
          console.log('Status is accepted, adding to friends lists');
          
          // Check if they're already friends
          if (!requester.friends.includes(recipient._id)) {
            if (!requester.friends) requester.friends = [];
            requester.friends.push(recipient._id);
            await requester.save();
            console.log(`Added ${recipient.username} to ${requester.username}'s friends`);
          }
          
          if (!recipient.friends.includes(requester._id)) {
            if (!recipient.friends) recipient.friends = [];
            recipient.friends.push(requester._id);
            await recipient.save();
            console.log(`Added ${requester.username} to ${recipient.username}'s friends`);
          }
        }
        
        console.log(`Successfully processed request ${requestId}`);
        
      } catch (err) {
        console.error(`Error processing request ${requestId}:`, err);
      }
    }
    
    console.log('Specific friend requests migration completed');
    
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
  migrateSpecificRequests()
    .then(() => process.exit(0))
    .catch(err => {
      console.error(err);
      process.exit(1);
    });
}

module.exports = { migrateSpecificRequests };
