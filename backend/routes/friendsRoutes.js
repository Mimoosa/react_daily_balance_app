const express = require('express');
const router = express.Router();
const friendsController = require('../controllers/friendsController');
const { authenticateToken } = require('../middleware/auth');

// Apply authentication middleware to all friends routes
router.use(authenticateToken);

// Routes for friend management
router.post('/request', friendsController.sendFriendRequest);
router.post('/request/:requestId/accept', friendsController.acceptFriendRequest);
router.post('/request/:requestId/reject', friendsController.rejectFriendRequest);
router.delete('/request/:requestId', friendsController.cancelFriendRequest);
router.delete('/:friendId', friendsController.removeFriend);

// Routes for retrieving friends and requests
router.get('/', friendsController.getFriends);
router.get('/requests', friendsController.getFriendRequests);
router.get('/search', friendsController.searchUsers);

module.exports = router;
