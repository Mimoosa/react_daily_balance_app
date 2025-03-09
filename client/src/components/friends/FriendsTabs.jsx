import React from 'react';
import { useTheme } from '../../contexts/ThemeContext'; // Import ThemeContext
import { 
  IoPersonCircleOutline, 
  IoSearchOutline,
  IoPersonAddOutline,
  IoCheckmarkCircleOutline,
  IoCloseCircleOutline,
  IoArrowUndoOutline,
  IoTrashOutline
} from 'react-icons/io5';

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
  const { isDark, theme } = useTheme(); // Get theme state

  const renderProfileImage = (imageUrl) => (
    imageUrl ? (
      <img className="w-10 h-10 rounded-full mr-3 bg-transparent" src={imageUrl} alt="Profile" />
    ) : (
      <IoPersonCircleOutline size={40} className="text-gray-400 dark:text-gray-300 mr-3 bg-transparent" />
    )
  );
  

  const renderTabs = () => (
    <div className="flex border-b border-gray-300 dark:border-gray-700">
      {['friends', 'incoming', 'sent', 'search'].map((tab) => (
        <button
          key={tab}
          className={`flex-1 py-2 text-sm font-medium transition-colors ${
            activeTab === tab 
              ? 'text-violet-600 dark:text-violet-400 border-b-2 border-violet-600 dark:border-violet-400' 
              : 'text-gray-500 dark:text-gray-400'
          }`}
          onClick={() => setActiveTab(tab)}
        >
          {tab === 'search' ? <IoSearchOutline size={18} className="mx-auto" /> : tab.charAt(0).toUpperCase() + tab.slice(1)}
          {tab === 'incoming' && incomingRequests.length > 0 && (
            <span className="ml-1 bg-red-500 text-white rounded-full px-2 text-xs">
              {incomingRequests.length}
            </span>
          )}
        </button>
      ))}
    </div>
  );

  return (
    <div className={`p-4 rounded-lg transition-colors ${isDark ? 'bg-gray-900 text-white' : 'bg-white text-gray-900'}`}>
      {renderTabs()}
      <div className="mt-4">
        {/* Render tab content here */}
      </div>
    </div>
  );
}
