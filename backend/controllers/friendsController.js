const User = require('../models/User');
const Friends = require('../models/Friends');
const mongoose = require('mongoose');

/**
 * Send a friend request to another user
 * @param {Object} req - Express request object with recipient user ID
 * @param {Object} res - Express response object
 * @returns {Promise<Object>} Friend request details or error
 */
const sendFriendRequest = async (req, res) => {
  try {
    const requesterId = req.user.id;
    const { recipientId } = req.body;

    // Validate recipient ID
    if (!recipientId || !mongoose.Types.ObjectId.isValid(recipientId)) {
      return res.status(400).json({ error: "Invalid recipient ID" });
    }

    // Check if requesterId and recipientId are the same
    if (requesterId === recipientId) {
      return res.status(400).json({ error: "You cannot send a friend request to yourself" });
    }

    // Find both users
    const requester = await User.findById(requesterId);
    const recipient = await User.findById(recipientId);
    
    if (!recipient) {
      return res.status(404).json({ error: "Recipient not found" });
    }

    // Check if they are already friends
    if (requester.friends.includes(recipientId)) {
      return res.status(400).json({ error: "You are already friends" });
    }
    
    // Check if a request already exists in the Friends collection (legacy check)
    const existingRequest = await Friends.findOne({
      $or: [
        { requester: requesterId, recipient: recipientId },
        { requester: recipientId, recipient: requesterId }
      ]
    });

    if (existingRequest) {
      if (existingRequest.status === 'pending') {
        return res.status(400).json({ error: "Friend request already sent" });
      } else if (existingRequest.status === 'accepted') {
        return res.status(400).json({ error: "You are already friends" });
      } else if (existingRequest.status === 'blocked') {
        return res.status(400).json({ error: "Unable to send request" });
      }
    }
    
    // Check for existing requests in user objects
    const existingReceivedRequest = recipient.friendRequests.received.find(
      req => req.user.toString() === requesterId.toString()
    );
    
    const existingSentRequest = requester.friendRequests.sent.find(
      req => req.user.toString() === recipientId.toString()
    );
    
    if (existingReceivedRequest || existingSentRequest) {
      return res.status(400).json({ error: "Friend request already exists" });
    }

    // Add friend request to both users
    await requester.addFriendRequest(recipientId, 'sent');
    await recipient.addFriendRequest(requesterId, 'received');

    // Also create in Friends collection for backward compatibility
    const friendRequest = new Friends({
      requester: requesterId,
      recipient: recipientId,
      status: 'pending'
    });

    await friendRequest.save();

    res.status(201).json({
      message: "Friend request sent successfully",
      friendRequest
    });

  } catch (error) {
    console.error('Send friend request error:', error);
    res.status(500).json({ error: error.message });
  }
};

/**
 * Accept a friend request
 * @param {Object} req - Express request object with request ID
 * @param {Object} res - Express response object
 * @returns {Promise<Object>} Updated friendship details or error
 */
const acceptFriendRequest = async (req, res) => {
  try {
    const userId = req.user.id;
    const { requestId } = req.params;
    
    console.log(`Attempting to accept friend request. UserId: ${userId}, RequestId: ${requestId}`);
    
    // Find the current user
    const recipient = await User.findById(userId);
    
    if (!recipient) {
      return res.status(404).json({ error: "User not found" });
    }
    
    // Find the request in the user's received requests
    const receivedRequest = recipient.friendRequests.received.find(
      req => req._id.toString() === requestId
    );
    
    if (!receivedRequest) {
      // Try to find in legacy Friends collection as fallback
      const friendRequest = await Friends.findOne({
        _id: requestId,
        recipient: userId,
        status: 'pending'
      });
      
      if (!friendRequest) {
        return res.status(404).json({ error: "Friend request not found" });
      }
      
      // Process using legacy approach
      const requester = await User.findById(friendRequest.requester);
      if (!requester) {
        return res.status(404).json({ error: "Requester user not found" });
      }
      
      // Update status in Friends collection
      friendRequest.status = 'accepted';
      await friendRequest.save();
      
      // Add to friends lists
      await recipient.addFriend(requester._id);
      await requester.addFriend(recipient._id);
      
      return res.json({
        message: "Friend request accepted (legacy)",
        friendship: friendRequest
      });
    }
    
    // Process using the new User model approach
    const requesterId = receivedRequest.user;
    const requester = await User.findById(requesterId);
    
    if (!requester) {
      return res.status(404).json({ error: "Requester not found" });
    }
    
    // Add to friends lists
    await recipient.addFriend(requester._id);
    await requester.addFriend(recipient._id);
    
    // Remove request from both users' request lists
    await recipient.removeFriendRequest(requester._id, 'received');
    await requester.removeFriendRequest(recipient._id, 'sent');
    
    res.json({
      message: "Friend request accepted",
      friendship: {
        requester: requester._id,
        recipient: recipient._id,
        status: 'accepted'
      }
    });
    
  } catch (error) {
    console.error('Accept friend request error:', error);
    res.status(500).json({ error: error.message });
  }
};

/**
 * Reject a friend request
 * @param {Object} req - Express request object with request ID
 * @param {Object} res - Express response object
 * @returns {Promise<Object>} Updated request details or error
 */
const rejectFriendRequest = async (req, res) => {
  try {
    const userId = req.user.id;
    const { requestId } = req.params;
    
    console.log(`Attempting to reject friend request. UserId: ${userId}, RequestId: ${requestId}`);

    // Find the friend request in legacy collection
    const friendRequest = await Friends.findOne({
      _id: requestId,
      recipient: userId,
      status: 'pending'
    });

    if (!friendRequest) {
      console.log(`Friend request not found with ID: ${requestId} for user: ${userId}`);
      return res.status(404).json({ error: "Friend request not found" });
    }

    console.log(`Found friend request: ${JSON.stringify(friendRequest)}`);

    // Also find both users involved
    const recipient = await User.findById(userId);
    const requester = await User.findById(friendRequest.requester);
    
    // Update status to rejected in Friends collection
    friendRequest.status = 'rejected';
    await friendRequest.save();
    
    // Also update User model if available
    if (recipient && requester) {
      // Remove from recipient's received requests
      await recipient.removeFriendRequest(requester._id, 'received');
      
      // Remove from requester's sent requests
      await requester.removeFriendRequest(recipient._id, 'sent');
    }

    res.json({
      message: "Friend request rejected",
      friendship: friendRequest
    });

  } catch (error) {
    console.error('Reject friend request error:', error);
    res.status(500).json({ error: error.message });
  }
};

/**
 * Cancel a friend request sent by the current user
 * @param {Object} req - Express request object with request ID
 * @param {Object} res - Express response object
 * @returns {Promise<Object>} Result message or error
 */
const cancelFriendRequest = async (req, res) => {
  try {
    const userId = req.user.id;
    const { requestId } = req.params;

    // Find and delete the pending request
    const result = await Friends.findOneAndDelete({
      _id: requestId,
      requester: userId,
      status: 'pending'
    });

    if (!result) {
      return res.status(404).json({ error: "Friend request not found or cannot be canceled" });
    }

    res.json({
      message: "Friend request canceled successfully"
    });

  } catch (error) {
    console.error('Cancel friend request error:', error);
    res.status(500).json({ error: error.message });
  }
};

/**
 * Remove a friend
 * @param {Object} req - Express request object with friend ID
 * @param {Object} res - Express response object
 * @returns {Promise<Object>} Result message or error
 */
const removeFriend = async (req, res) => {
  try {
    const userId = req.user.id;
    const { friendId } = req.params;

    // Find both users
    const user = await User.findById(userId);
    const friend = await User.findById(friendId);

    if (!user || !friend) {
      return res.status(404).json({ error: "User or friend not found" });
    }

    // Check if they are friends in the User model
    const areFriendsInUserModel = user.friends.includes(friendId) && friend.friends.includes(userId);

    // Remove from User model's friends arrays
    if (areFriendsInUserModel) {
      // Remove friend from user's friends array
      user.friends = user.friends.filter(id => id.toString() !== friendId);
      await user.save();

      // Remove user from friend's friends array
      friend.friends = friend.friends.filter(id => id.toString() !== userId);
      await friend.save();
    }

    // Also try to find and delete friend relationship in Friends collection for backward compatibility
    const result = await Friends.findOneAndDelete({
      $or: [
        { requester: userId, recipient: friendId, status: 'accepted' },
        { requester: friendId, recipient: userId, status: 'accepted' }
      ]
    });

    // Clean up any pending friend requests between these users
    await Friends.deleteMany({
      $or: [
        { requester: userId, recipient: friendId },
        { requester: friendId, recipient: userId }
      ]
    });

    // Clean up friend requests in User model
    if (user.friendRequests) {
      // Remove from sent requests
      user.friendRequests.sent = user.friendRequests.sent.filter(
        req => req.user.toString() !== friendId
      );
      // Remove from received requests
      user.friendRequests.received = user.friendRequests.received.filter(
        req => req.user.toString() !== friendId
      );
      await user.save();
    }

    if (friend.friendRequests) {
      // Remove from friend's sent requests
      friend.friendRequests.sent = friend.friendRequests.sent.filter(
        req => req.user.toString() !== userId
      );
      // Remove from friend's received requests
      friend.friendRequests.received = friend.friendRequests.received.filter(
        req => req.user.toString() !== userId
      );
      await friend.save();
    }

    // If not found in either model, return error
    if (!result && !areFriendsInUserModel) {
      return res.status(404).json({ error: "Friend relationship not found" });
    }

    res.json({
      message: "Friend removed successfully"
    });

  } catch (error) {
    console.error('Remove friend error:', error);
    res.status(500).json({ error: error.message });
  }
};

/**
 * Get all friends for current user
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @returns {Promise<Array>} List of friends or error
 */
const getFriends = async (req, res) => {
  try {
    const userId = req.user.id;

    // Get user with populated friends
    const user = await User.findById(userId).populate('friends', 'username email image');
    
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Format friends data
    const friends = user.friends.map(friend => ({
      _id: friend._id,
      username: friend.username,
      email: friend.email,
      image: friend.image
    }));

    res.status(200).json(friends);

  } catch (error) {
    console.error('Get friends error:', error);
    res.status(500).json({ error: error.message });
  }
};

/**
 * Get all pending friend requests for current user
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @returns {Promise<Object>} Object containing received and sent requests
 */
const getFriendRequests = async (req, res) => {
  try {
    const userId = req.user.id;

    // Get user with populated friend requests - ensure username field is included
    const user = await User.findById(userId)
      .populate('friendRequests.received.user', 'username name email image') // Include both username and name
      .populate('friendRequests.sent.user', 'username name email image');    // Include both username and name
    
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Format received requests
    const formattedReceived = user.friendRequests.received.map(request => ({
      _id: request._id,
      user: {
        _id: request.user._id,
        username: request.user.username,  // Ensure username is included
        name: request.user.name,
        email: request.user.email,
        image: request.user.image
      },
      createdAt: request.createdAt
    }));

    // Format sent requests
    const formattedSent = user.friendRequests.sent.map(request => ({
      _id: request._id,
      user: {
        _id: request.user._id,
        username: request.user.username,  // Ensure username is included
        name: request.user.name,
        email: request.user.email,
        image: request.user.image
      },
      createdAt: request.createdAt
    }));

    res.json({
      received: formattedReceived,
      sent: formattedSent
    });

  } catch (error) {
    console.error('Get friend requests error:', error);
    res.status(500).json({ error: error.message });
  }
};

/**
 * Debug helper - Check if users matching a query exist in the database
 * @param {string} query - The search string
 */
const debugCheckUsersExist = async (query) => {
  try {
    console.log(`DEBUG: Performing direct database check for "${query}"`);
    
    // Check with exact match first
    const exactMatches = await User.find({
      name: query
    }).select('name email');
    
    console.log(`DEBUG: Exact name matches:`, exactMatches.map(u => u.name));
    
    // Check with case-insensitive regex
    const regexMatches = await User.find({
      name: { $regex: query, $options: 'i' }
    }).select('name email');
    
    console.log(`DEBUG: Regex name matches:`, regexMatches.map(u => u.name));
    
    // Check emails too
    const emailMatches = await User.find({
      email: { $regex: query, $options: 'i' }
    }).select('name email');
    
    console.log(`DEBUG: Email matches:`, emailMatches.map(u => u.email));
    
    // Check the total number of users in the database
    const totalUsers = await User.countDocuments();
    console.log(`DEBUG: Total users in database: ${totalUsers}`);
    
    // List some sample users if total count is reasonable
    if (totalUsers < 20) {
      const sampleUsers = await User.find().select('name email').limit(10);
      console.log(`DEBUG: Sample users in database:`, sampleUsers.map(u => u.name));
    }
  } catch (error) {
    console.error('DEBUG ERROR:', error);
  }
};

/**
 * Search for users to add as friends
 * @param {Object} req - Express request object with search term
 * @param {Object} res - Express response object
 * @returns {Promise<Array>} List of matching users or error
 */
const searchUsers = async (req, res) => {
  try {
    console.log('Search users request received:', req.query);
    const userId = req.user.id;
    const { query } = req.query;

    if (!query || query.length < 2) {
      console.log('Search rejected: Query too short');
      return res.status(400).json({ error: "Search query must be at least 2 characters" });
    }

    console.log(`Searching for users matching: "${query}" (excluding user ID: ${userId})`);
    
    // Get current user with friends list
    const currentUser = await User.findById(userId);
    if (!currentUser) {
      return res.status(404).json({ error: "User not found" });
    }

    // Find users matching the search query (exclude current user and their friends)
    const users = await User.find({
      _id: { 
        $ne: userId,
        $nin: currentUser.friends // Exclude friends
      },
      $or: [
        { username: { $regex: query, $options: 'i' } },
        { email: { $regex: query, $options: 'i' } }
      ]
    }).select('_id username email image').limit(10);
    
    console.log(`Found ${users.length} matching users:`, users);
    
    // If no users found, return empty array immediately
    if (users.length === 0) {
      return res.json([]);
    }
    
    // Get all friend relationships for current user
    const friendships = await Friends.find({
      $or: [
        { requester: userId },
        { recipient: userId }
      ]
    });
    
    console.log(`Found ${friendships.length} existing relationships for user`);
    
    // Add relationship status to each user
    const usersWithStatus = await Promise.all(users.map(async user => {
      const friendship = friendships.find(f => 
        (f.requester.toString() === user._id.toString() || f.recipient.toString() === user._id.toString())
      );

      let status = 'none';
      let requesterId = null;

      if (friendship) {
        status = friendship.status;
        requesterId = friendship.requester.toString();
        console.log(`User ${user.username || user.email} has relationship status: ${status}`);
      } else {
        console.log(`User ${user.username || user.email} has no relationship with current user`);
      }

      return {
        _id: user._id,
        username: user.username,
        email: user.email,
        image: user.image,
        status,
        sentByMe: requesterId === userId
      };
    }));
    
    console.log(`Returning ${usersWithStatus.length} users with status information:`, usersWithStatus);
    res.json(usersWithStatus);

  } catch (error) {
    console.error('Search users error:', error);
    res.status(500).json({ error: error.message });
  }
};

module.exports = {
  sendFriendRequest,
  acceptFriendRequest,
  rejectFriendRequest,
  cancelFriendRequest,
  removeFriend,
  getFriends,
  getFriendRequests,
  searchUsers
};
