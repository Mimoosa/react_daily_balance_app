import { friendsService } from '../../services/api';

export const useFriendHandlers = (
  setFriends,
  setIncomingRequests,
  setSentRequests,
  setSearchResults,
  setLoading,
  setError
) => {
  // Fetch all friends
  const fetchFriends = async () => {
    try {
      setLoading(true);
      const data = await friendsService.getFriends();
      setFriends(data);
      setError(null);
    } catch (err) {
      console.error('Error fetching friends:', err);
      setError('Could not load friends');
    } finally {
      setLoading(false);
    }
  };

  // Fetch friend requests
  const fetchRequests = async () => {
    try {
      setLoading(true);
      const data = await friendsService.getRequests();
      setIncomingRequests(data.received);
      setSentRequests(data.sent);
      setError(null);
    } catch (err) {
      console.error('Error fetching requests:', err);
      setError('Could not load friend requests');
    } finally {
      setLoading(false);
    }
  };

  // Search for users
  const searchUsers = async (query) => {
    if (!query || query.length < 2) {
      setSearchResults([]);
      return;
    }

    try {
      setLoading(true);
      const data = await friendsService.searchUsers(query);
      setSearchResults(data);
      setError(null);
    } catch (err) {
      console.error('Error searching users:', err);
      setError('Could not search for users');
    } finally {
      setLoading(false);
    }
  };

  // Send friend request
  const handleSendRequest = async (userId) => {
    try {
      setLoading(true);
      await friendsService.sendRequest(userId);
      // Update search results to reflect the request
      setSearchResults(prevResults => 
        prevResults.map(user => 
          user._id === userId ? {...user, status: 'pending', sentByMe: true} : user
        )
      );
      await fetchRequests(); // Refresh requests list
      setError(null);
    } catch (err) {
      console.error('Error sending request:', err);
      setError('Could not send friend request');
    } finally {
      setLoading(false);
    }
  };

  // Accept friend request
  const handleAcceptRequest = async (requestId) => {
    try {
      setLoading(true);
      await friendsService.acceptRequest(requestId);
      await fetchFriends();
      await fetchRequests();
      setError(null);
    } catch (err) {
      console.error('Error accepting request:', err);
      setError('Could not accept friend request');
    } finally {
      setLoading(false);
    }
  };

  // Reject friend request
  const handleRejectRequest = async (requestId) => {
    try {
      setLoading(true);
      console.log(`Rejecting friend request with ID: ${requestId}`);
      
      const response = await friendsService.rejectRequest(requestId);
      console.log('Reject response:', response);
      
      // Update UI after successful rejection
      setIncomingRequests(prevRequests => 
        prevRequests.filter(request => request._id !== requestId)
      );
      setError(null);
    } catch (err) {
      console.error('Error rejecting request:', err);
      
      // More detailed error logging
      if (err.response) {
        console.error('Response error data:', err.response.data);
        console.error('Response status:', err.response.status);
      }
      
      setError('Could not reject friend request. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // Cancel friend request
  const handleCancelRequest = async (requestId) => {
    try {
      setLoading(true);
      await friendsService.cancelRequest(requestId);
      setSentRequests(prevRequests => 
        prevRequests.filter(request => request._id !== requestId)
      );
      setError(null);
    } catch (err) {
      console.error('Error cancelling request:', err);
      setError('Could not cancel friend request');
    } finally {
      setLoading(false);
    }
  };

  // Remove friend
  const handleRemoveFriend = async (friendId) => {
    if (!window.confirm('Are you sure you want to remove this friend?')) {
      return;
    }
    
    try {
      setLoading(true);
      await friendsService.removeFriend(friendId);
      setFriends(prevFriends => 
        prevFriends.filter(friend => friend._id !== friendId)
      );
      setError(null);
    } catch (err) {
      console.error('Error removing friend:', err);
      setError('Could not remove friend');
    } finally {
      setLoading(false);
    }
  };

  return {
    fetchFriends,
    fetchRequests,
    searchUsers,
    handleSendRequest,
    handleAcceptRequest,
    handleRejectRequest,
    handleCancelRequest,
    handleRemoveFriend
  };
};
