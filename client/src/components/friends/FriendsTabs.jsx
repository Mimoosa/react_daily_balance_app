import React, { useEffect } from 'react';
import { 
  IoPersonCircleOutline, 
  IoSearchOutline,
  IoPersonAddOutline,
  IoCheckmarkCircleOutline,
  IoCloseCircleOutline,
  IoArrowUndoOutline,
  IoTrashOutline,
  IoStatsChartOutline
} from 'react-icons/io5';
import { useTheme } from '../../contexts/ThemeContext';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';

export default function FriendsTabs({
  activeTab,
  setActiveTab,
  searchQuery,
  setSearchQuery,
  searchResults,
  friends,
  incomingRequests,
  sentRequests,
  loading,
  error,
  handleSendRequest,
  handleAcceptRequest,
  handleRejectRequest,
  handleCancelRequest,
  handleRemoveFriend
}) {
  const { isDark } = useTheme();
  const navigate = useNavigate();
  const { isAuthenticated, loading: authLoading } = useAuth();

  // Add debug logs
  console.log('FriendsTabs render:', { isAuthenticated, authLoading });

  // Wait for auth to finish loading
  if (authLoading) {
    return null;
  }

  if (!isAuthenticated) {
    console.log('User not authenticated, hiding FriendsTabs');
    return null;
  }

  // Render profile image or fallback icon
  const renderProfileImage = (imageUrl) => {
    if (imageUrl) {
      return <img className="w-10 h-10 rounded-full mr-3" src={imageUrl} alt="Profile" />;
    } else {
      return <IoPersonCircleOutline size={40} className="text-gray-400 mr-3" />;
    }
  };

  // Handle tab navigation
  const renderTabs = () => (
    <div className={`flex border-b ${isDark ? 'border-gray-700' : 'border-gray-300'}`}>
      <button 
        className={`flex-1 py-2 text-sm font-medium ${activeTab === 'friends' ? 'text-violet-600 border-b-2 border-violet-600' : 'text-gray-500 dark:text-gray-400'}`}
        onClick={() => setActiveTab('friends')}
      >
        Friends
      </button>
      <button 
        className={`flex-1 py-2 text-sm font-medium ${activeTab === 'incoming' ? 'text-violet-600 border-b-2 border-violet-600' : 'text-gray-500 dark:text-gray-400'}`}
        onClick={() => setActiveTab('incoming')}
      >
        Incoming
        {incomingRequests.length > 0 && (
          <span className="ml-1 bg-red-500 text-white rounded-full px-2 text-xs">
            {incomingRequests.length}
          </span>
        )}
      </button>
      <button 
        className={`flex-1 py-2 text-sm font-medium ${activeTab === 'sent' ? 'text-violet-600 border-b-2 border-violet-600' : 'text-gray-500 dark:text-gray-400'}`}
        onClick={() => setActiveTab('sent')}
      >
        Sent
      </button>
      <button 
        className={`flex-1 py-2 text-sm font-medium ${activeTab === 'search' ? 'text-violet-600 border-b-2 border-violet-600' : 'text-gray-500 dark:text-gray-400'}`}
        onClick={() => setActiveTab('search')}
      >
        <IoSearchOutline size={18} className="mx-auto" />
      </button>
    </div>
  );

  // Render loading and error states
  if (loading && !searchQuery) {
    return (
      <>
        {renderTabs()}
        <div className="flex justify-center items-center h-48">
          <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-gray-900 dark:border-gray-100"></div>
        </div>
      </>
    );
  }

  if (error) {
    return (
      <>
        {renderTabs()}
        <div className="text-red-500 text-center p-4">
          {error}
        </div>
      </>
    );
  }

  // Render different tab contents
  const renderTabContent = () => {
    switch (activeTab) {
      case 'search':
        return (
          <>
            {/* Search Input */}
            <div className="mb-3 relative">
              <IoSearchOutline className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500 dark:text-gray-400" />
              <input
                type="text"
                placeholder="Search users..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className={`w-full pl-10 pr-4 py-2 border rounded-md 
                  border-gray-300 focus:outline-none focus:ring-2 focus:ring-violet-500 
                  ${isDark ? 'bg-gray-800 text-white border-gray-600' : 'bg-white text-gray-900 border-gray-300'}`}
              />
            </div>

            {/* Conditional Messages */}
            {searchQuery.length < 2 ? (
              <p className="text-center text-gray-500 dark:text-gray-400 p-4">
                Type at least 2 characters to search
              </p>
            ) : loading ? (
              <div className="flex justify-center items-center h-16">
                <div className="animate-spin rounded-full h-5 w-5 border-t-2 border-b-2 border-gray-900 dark:border-gray-100"></div>
              </div>
            ) : searchResults.length === 0 ? (
              <p className="text-center text-gray-500 dark:text-gray-400 p-4">
                No users found
              </p>
            ) : (
              <div className="flex-grow overflow-y-auto">
                {searchResults.map((user) => {
                  const displayName = user.username || user.name || user.email || 'Unknown User';
                  return (
                    <div key={user._id} className="flex items-center justify-between p-2 border-b dark:border-gray-600">
                      <div className="flex items-center">
                        {renderProfileImage(user.image)}
                        <span className={`${isDark ? 'text-white' : 'text-gray-900'}`}>{displayName}</span>
                      </div>
                      <div>
                        {user.status === 'accepted' ? (
                          <span className="text-green-500 text-sm">Friends</span>
                        ) : user.status === 'pending' ? (
                          user.sentByMe ? (
                            <span className="text-gray-500 text-sm">Request Sent</span>
                          ) : (
                            <div className="flex">
                              <button 
                                onClick={() => handleAcceptRequest(user._id)}
                                className="bg-green-100 text-green-700 p-1 rounded-full mr-1"
                              >
                                <IoCheckmarkCircleOutline size={20} />
                              </button>
                              <button 
                                onClick={() => handleRejectRequest(user._id)}
                                className="bg-red-100 text-red-700 p-1 rounded-full"
                              >
                                <IoCloseCircleOutline size={20} />
                              </button>
                            </div>
                          )
                        ) : (
                          <button 
                            onClick={() => handleSendRequest(user._id)}
                            className="bg-violet-100 text-violet-700 p-1 rounded-full"
                          >
                            <IoPersonAddOutline size={20} />
                          </button>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </>
        );

      case 'friends':
        return friends.length === 0 ? (
          <div className="text-center p-6">
            <IoPersonCircleOutline size={40} className="mx-auto text-gray-400 mb-3" />
            <p className="text-gray-600 dark:text-gray-300 mb-2">You don't have any friends yet</p>
            <p className="text-gray-500 dark:text-gray-400 text-sm mb-3">
              Connect with other users to see their activity and share your progress
            </p>
            <button
              onClick={() => setActiveTab('search')}
              className="bg-violet-100 hover:bg-violet-200 text-violet-700 px-3 py-2 rounded-md text-sm flex items-center mx-auto"
            >
              <IoSearchOutline className="mr-2" />
              Find Friends
            </button>
          </div>
        ) : (
          <div className="flex-grow overflow-y-auto">
            {friends.map((friend) => (
              <div 
                key={friend._id} 
                className={`flex items-center justify-between p-2 border-b ${isDark ? 'dark:border-gray-600' : 'border-gray-200'} 
                  ${isDark ? 'hover:bg-gray-700/50' : 'hover:bg-violet-50'} group transition-colors duration-200`}
              >
                <div 
                  className="flex items-center flex-grow cursor-pointer" 
                  onClick={() => handleFriendClick(friend._id)}
                >
                  {renderProfileImage(friend.image)}
                  <span className={`text-gray-800 ${isDark ? 'dark:text-white' : ''}`}>
                    {friend.username}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  {/* Dashboard view button */}
                  <button 
                    onClick={(e) => {
                      e.stopPropagation();
                      handleFriendClick(friend._id);
                    }}
                    className={`${isDark ? 'text-violet-400 hover:text-violet-300 hover:bg-violet-900/30' : 'text-violet-500 hover:text-violet-600 hover:bg-violet-100'} 
                      p-2 rounded-full transition-colors duration-200`}
                    title="View friend's dashboard"
                  >
                    <IoStatsChartOutline size={18} />
                  </button>
                  {/* Remove friend button */}
                  <button 
                    onClick={(e) => {
                      e.stopPropagation();
                      handleRemoveFriend(friend._id);
                    }}
                    className={`${isDark ? 'text-gray-400 hover:text-red-400 hover:bg-red-900/30' : 'text-gray-500 hover:text-red-500 hover:bg-red-100'} 
                      p-2 rounded-full transition-colors duration-200`}
                    title="Remove friend"
                  >
                    <IoTrashOutline size={18} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        );

      case 'incoming':
        return incomingRequests.length === 0 ? (
          <div className="text-center text-gray-500 dark:text-gray-400 p-4">
            <p className="mb-2">No incoming friend requests</p>
            <p className="text-sm">When someone sends you a request, you'll see it here</p>
          </div>
        ) : (
          <div className="flex-grow overflow-y-auto">
            {incomingRequests.map((request) => (
              <div key={request._id} className="flex items-center justify-between p-2 border-b dark:border-gray-600">
                <div className="flex items-center">
                  {renderProfileImage(request.user.image)}
                  <span>
                    {request.user.username || request.user.name || request.user.email || 'Unknown User'}
                  </span>
                </div>
                <div className="flex">
                  <button 
                    onClick={() => handleAcceptRequest(request._id)}
                    className={`${isDark ? 'bg-green-900/30 text-green-400 hover:bg-green-800/40' : 'bg-green-100 text-green-700 hover:bg-green-200'} 
                      p-1 rounded-full transition-colors duration-200 mr-1`}
                    title="Accept request"
                  >
                    <IoCheckmarkCircleOutline size={20} />
                  </button>
                  <button 
                    onClick={() => handleRejectRequest(request._id)}
                    className={`${isDark ? 'bg-red-900/30 text-red-400 hover:bg-red-800/40' : 'bg-red-100 text-red-700 hover:bg-red-200'} 
                      p-1 rounded-full transition-colors duration-200`}
                    title="Reject request"
                  >
                    <IoCloseCircleOutline size={20} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        );

      case 'sent':
        return sentRequests.length === 0 ? (
          <div className="text-center text-gray-500 dark:text-gray-400 p-4">
            <p className="mb-2">No sent friend requests</p>
            <p className="text-sm">Try searching for friends to connect with</p>
          </div>
        ) : (
          <div className="flex-grow overflow-y-auto">
            {sentRequests.map((request) => (
              <div key={request._id} className="flex items-center justify-between p-2 border-b dark:border-gray-600">
                <div className="flex items-center">
                  {renderProfileImage(request.user.image)}
                  <span>
                    {request.user.username || request.user.name || request.user.email || 'Unknown User'}
                  </span>
                </div>
                <button 
                  onClick={() => handleCancelRequest(request._id)}
                  className={`${isDark ? 'bg-gray-700 text-gray-300 hover:bg-gray-600' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'} 
                    p-1 rounded-full transition-colors duration-200`}
                  title="Cancel request"
                >
                  <IoArrowUndoOutline size={20} />
                </button>
              </div>
            ))}
          </div>
        );

      default:
        return <div>Select a tab</div>;
    }
  };

  const handleFriendClick = (friendId) => {
    navigate(`/friend/${friendId}/dashboard`);
  };

  return (
    <div className={`${isDark ? 'dark' : ''}`}>
      {renderTabs()}
      <div className="mt-4 min-h-[200px] flex flex-col">
        {renderTabContent()}
      </div>
    </div>
  );
}
