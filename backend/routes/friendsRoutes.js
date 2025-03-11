const express = require('express');
const router = express.Router();
const friendsController = require('../controllers/friendsController');
const { protect } = require('../middleware/auth');

/**
 * @swagger
 * tags:
 *   name: Friends
 *   description: Friend management and social features
 */

/**
 * @swagger
 * /api/friends/request:
 *   post:
 *     summary: Send a friend request
 *     tags: [Friends]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - recipientId
 *             properties:
 *               recipientId:
 *                 type: string
 *     responses:
 *       201:
 *         description: Friend request sent successfully
 *       400:
 *         description: Invalid request
 *
 * /api/friends/request/{requestId}/accept:
 *   post:
 *     summary: Accept a friend request
 *     tags: [Friends]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: requestId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Friend request accepted
 *
 * /api/friends/request/{requestId}/reject:
 *   post:
 *     summary: Reject a friend request
 *     tags: [Friends]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: requestId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Friend request rejected
 *
 * /api/friends:
 *   get:
 *     summary: Get user's friends list
 *     tags: [Friends]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of friends
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/User'
 *
 * /api/friends/{friendId}:
 *   delete:
 *     summary: Remove a friend
 *     tags: [Friends]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: friendId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Friend removed successfully
 *
 * /api/friends/requests:
 *   get:
 *     summary: Get pending friend requests
 *     tags: [Friends]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of pending friend requests
 *
 * /api/friends/search:
 *   get:
 *     summary: Search for users
 *     tags: [Friends]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: query
 *         schema:
 *           type: string
 *         required: true
 *         description: Search query string
 *     responses:
 *       200:
 *         description: List of matching users
 */

// Log all incoming requests to this route
router.use((req, res, next) => {
  console.log(`Friends API request: ${req.method} ${req.originalUrl}`);
  next();
});

// Routes for friend management
router.post('/request', protect, friendsController.sendFriendRequest);
router.post('/request/:requestId/accept', protect, friendsController.acceptFriendRequest);
router.post('/request/:requestId/reject', protect, friendsController.rejectFriendRequest); // This should be POST
router.delete('/request/:requestId', protect, friendsController.cancelFriendRequest);
router.delete('/:friendId', protect, friendsController.removeFriend);

// Routes for retrieving friends and requests
router.get('/', protect, friendsController.getFriends);
router.get('/requests', protect, friendsController.getFriendRequests);

// Add extra logging for search route specifically
router.get('/search', protect, (req, res, next) => {
  console.log('Search route accessed with query:', req.query);
  next();
}, friendsController.searchUsers);

module.exports = router;
