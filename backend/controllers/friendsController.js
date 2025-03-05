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

    // Check if recipient exists
    const recipient = await User.findById(recipientId);
    if (!recipient) {
      return res.status(404).json({ error: "Recipient not found" });
    }

    // Check if a request already exists
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

    // Create new friend request
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

    // Find the friend request
    const friendRequest = await Friends.findOne({
      _id: requestId,
      recipient: userId,
      status: 'pending'
    });

    if (!friendRequest) {
      return res.status(404).json({ error: "Friend request not found" });
    }

    // Update status to accepted
    friendRequest.status = 'accepted';
    await friendRequest.save();

    res.json({
      message: "Friend request accepted",
      friendship: friendRequest
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

    // Find the friend request
    const friendRequest = await Friends.findOne({
      _id: requestId,
      recipient: userId,
      status: 'pending'
    });

    if (!friendRequest) {
      return res.status(404).json({ error: "Friend request not found" });
    }

    // Update status to rejected
    friendRequest.status = 'rejected';
    await friendRequest.save();

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
 * Remove a friend
 * @param {Object} req - Express request object with friend ID
 * @param {Object} res - Express response object
 * @returns {Promise<Object>} Result message or error
 */
const removeFriend = async (req, res) => {
  try {
    const userId = req.user.id;
    const { friendId } = req.params;

    // Find and delete friend relationship
    const result = await Friends.findOneAndDelete({
      $or: [
        { requester: userId, recipient: friendId, status: 'accepted' },
        { requester: friendId, recipient: userId, status: 'accepted' }
      ]
    });

    if (!result) {
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

    // Find all accepted friendships
    const friendships = await Friends.find({
      $or: [
        { requester: userId, status: 'accepted' },
        { recipient: userId, status: 'accepted' }
      ]
    }).populate('requester recipient', 'name email');

    // Extract friend data
    const friends = friendships.map(friendship => {
      const friend = friendship.requester._id.toString() === userId 
        ? friendship.recipient 
        : friendship.requester;
      
      return {
        _id: friend._id,
        name: friend.name,
        email: friend.email,
        friendshipId: friendship._id,
        since: friendship.updatedAt
      };
    });

    res.json(friends);

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

    // Find all received pending requests
    const receivedRequests = await Friends.find({
      recipient: userId,
      status: 'pending'
    }).populate('requester', 'name email');

    // Find all sent pending requests
    const sentRequests = await Friends.find({
      requester: userId,
      status: 'pending'
    }).populate('recipient', 'name email');

    // Format received requests
    const formattedReceived = receivedRequests.map(request => ({
      _id: request._id,
      user: {
        _id: request.requester._id,
        name: request.requester.name,
        email: request.requester.email
      },
      createdAt: request.createdAt
    }));

    // Format sent requests
    const formattedSent = sentRequests.map(request => ({
      _id: request._id,
      user: {
        _id: request.recipient._id,
        name: request.recipient.name,
        email: request.recipient.email
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
 * Search for users to add as friends
 * @param {Object} req - Express request object with search term
 * @param {Object} res - Express response object
 * @returns {Promise<Array>} List of matching users or error
 */
const searchUsers = async (req, res) => {
  try {
    const userId = req.user.id;
    const { query } = req.query;

    if (!query || query.length < 2) {
      return res.status(400).json({ error: "Search query must be at least 2 characters" });
    }

    // Find users matching the search query (exclude current user)
    const users = await User.find({
      _id: { $ne: userId },
      $or: [
        { name: { $regex: query, $options: 'i' } },
        { email: { $regex: query, $options: 'i' } }
      ]
    }).select('_id name email').limit(10);

    // Get all friend relationships for current user
    const friendships = await Friends.find({
      $or: [
        { requester: userId },
        { recipient: userId }
      ]
    });

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
      }

      return {
        _id: user._id,
        name: user.name,
        email: user.email,
        status,
        // Add this field to know who sent the request
        sentByMe: requesterId === userId
      };
    }));

    res.json(usersWithStatus);

  } catch (error) {
    console.error('Search users error:', error);
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

module.exports = {
  sendFriendRequest,
  acceptFriendRequest,
  rejectFriendRequest,
  removeFriend,
  getFriends,
  getFriendRequests,
  searchUsers,
  cancelFriendRequest
};
