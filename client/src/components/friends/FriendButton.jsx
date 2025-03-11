import React, { useState, useEffect } from 'react';
import { IoAccessibilityOutline } from 'react-icons/io5';
import { useFriendHandlers } from './friendHandlers';
import FriendsTabs from './FriendsTabs';
import { useTheme } from '../../contexts/ThemeContext'; // Import theme context

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
  const [isAuthenticated, setIsAuthenticated] = useState(null); // Start with null to indicate check in progress

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

  // Get current theme (dark or light)
  const { isDark } = useTheme();

  // Check if the user is authenticated when the component mounts
  useEffect(() => {
    // Simulate an async check (e.g., fetching from localStorage or making an API call)
    const token = localStorage.getItem('token'); // Assuming token is stored in localStorage
    if (token) {
      setIsAuthenticated(true); // User is authenticated
    } else {
      setIsAuthenticated(false); // User is not authenticated
    }
  }, []); // Only run once on mount

  // Fetch friends data when component opens and if authenticated
  useEffect(() => {
    if (isOpen && isAuthenticated) {
      fetchFriends();
      fetchRequests();
    }
  }, [isOpen, isAuthenticated]); // Fetch friends and requests if the list is open and user is authenticated

  // Handle search when query changes
  useEffect(() => {
    if (activeTab === 'search' && searchQuery.length >= 2) {
      const delaySearch = setTimeout(() => {
        searchUsers(searchQuery);
      }, 500); // Debounce search

      return () => clearTimeout(delaySearch);
    }
  }, [searchQuery, activeTab]);

  // Toggle the component open/closed
  const toggleFriendsList = () => {
    setIsOpen(!isOpen);
  };

  // If authentication status is still being determined, return null (don't render the button yet)
  if (isAuthenticated === null) {
    return null; // Prevent rendering until authentication status is determined
  }

  // Ensure the component doesn't render if authentication status is false
  if (!isAuthenticated) {
    return null; // Return nothing if not authenticated
  }

  return (
    <div className="fixed bottom-5 right-5 z-50 flex flex-col items-end">
      {/* Friends List Panel */}
      {isOpen && (
        <div
          className={`absolute bottom-16 right-0 rounded-lg shadow-lg p-4 w-72 
            ${isDark ? 'bg-gray-800 text-white border-gray-600' : 'bg-white text-gray-800 border-gray-200'}`}
        >
          <h3 className={`text-lg font-semibold text-center mb-2 ${isDark ? 'text-white' : 'text-gray-800'}`}>
            Friends
          </h3>

          {/* Friends Tabs Component */}
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

      {/* Floating Toggle Button */}
      <button
        onClick={toggleFriendsList}
        className={`w-14 h-14 rounded-full flex justify-center items-center shadow-lg relative
          ${isOpen ? 'bg-violet-600 text-white' : isDark ? 'bg-gray-800 text-white border-2 border-violet-600' : 'bg-white text-gray-800 border-2 border-violet-600'}`}
        aria-label="Toggle friends list"
        aria-expanded={isOpen}
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
