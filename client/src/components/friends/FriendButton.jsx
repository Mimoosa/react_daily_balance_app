import React, { useState, useEffect } from 'react';
import { IoAccessibilityOutline } from 'react-icons/io5';
import { useFriendHandlers } from './friendHandlers';
import FriendsTabs from './FriendsTabs';
import { useTheme } from '../../contexts/ThemeContext'; // Import Theme Context

export default function FriendButton() {
  const [isOpen, setIsOpen] = useState(false);
  const [activeTab, setActiveTab] = useState('friends');
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [friends, setFriends] = useState([]);
  const [incomingRequests, setIncomingRequests] = useState([]);
  const [sentRequests, setSentRequests] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const { isDark } = useTheme(); // Get dark mode state

  // Get handlers from the extracted file
  const {
    fetchFriends,
    fetchRequests,
    searchUsers,
    handleSendRequest,
    handleAcceptRequest,
    handleRejectRequest,
    handleCancelRequest,
    handleRemoveFriend
  } = useFriendHandlers(
    setFriends,
    setIncomingRequests,
    setSentRequests,
    setSearchResults,
    setLoading,
    setError
  );

  // Fetch friends data when component opens
  useEffect(() => {
    if (isOpen) {
      fetchFriends();
      fetchRequests();
    }
  }, [isOpen]);

  // Handle search when query changes
  useEffect(() => {
    if (activeTab === 'search' && searchQuery.length >= 2) {
      const delaySearch = setTimeout(() => {
        searchUsers(searchQuery);
      }, 500); // Debounce search

      return () => clearTimeout(delaySearch);
    }
  }, [searchQuery]);

  // Toggle the component open/closed
  const toggleFriendsList = () => {
    setIsOpen(!isOpen);
  };

  return (
    <div className="fixed bottom-5 right-5 z-50">
      {isOpen && (
        <div className={`rounded-lg shadow-lg p-4 mb-3 w-72 border transition-colors 
          ${isDark ? 'bg-gray-800 border-gray-700 text-white' : 'bg-white border-gray-200 text-gray-900'}`}>

          <h3 className="text-lg font-semibold text-center mb-2">Friends</h3>
          
          {/* Using the extracted FriendsTabs component */}
          <FriendsTabs
            activeTab={activeTab}
            setActiveTab={setActiveTab}
            searchQuery={searchQuery}
            setSearchQuery={setSearchQuery}
            searchResults={searchResults}
            friends={friends}
            incomingRequests={incomingRequests}
            sentRequests={sentRequests}
            loading={loading}
            error={error}
            handleSendRequest={handleSendRequest}
            handleAcceptRequest={handleAcceptRequest}
            handleRejectRequest={handleRejectRequest}
            handleCancelRequest={handleCancelRequest}
            handleRemoveFriend={handleRemoveFriend}
          />
        </div>
      )}

      {/* Toggle Button */}
      <button
        onClick={toggleFriendsList}
        className={`relative w-14 h-14 rounded-full flex justify-center items-center shadow-lg transition-colors
          ${isOpen ? 'bg-violet-600 text-white' : isDark ? 'bg-gray-800 text-white border-2 border-violet-600' : 'bg-white text-gray-800 border-2 border-violet-600'}`}
        aria-label="Toggle friends list"
      >
        <IoAccessibilityOutline size={24} />
        {!isOpen && incomingRequests.length > 0 && (
          <span className="absolute -top-1 -right-1 bg-red-500 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs">
            {incomingRequests.length}
          </span>
        )}
      </button>
    </div>
  );
}
