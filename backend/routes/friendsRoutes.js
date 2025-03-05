const express = require('express');
const router = express.Router();
const friendsController = require('../controllers/friendsController');
const { protect } = require('../middleware/auth');

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
