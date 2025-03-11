// Check this value - it should match your backend server address
// Change from http://localhost:3000/api to http://localhost:5000/api
/** Base API URL from environment variables, defaults to localhost if not set */
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

/**
 * Authentication service for handling user login and registration
 * @namespace
 */
const authService = {
    /**
     * Authenticates a user with their credentials
     * @param {Object} credentials - User login credentials
     * @param {string} credentials.email - User's email
     * @param {string} credentials.password - User's password
     * @returns {Promise<Object>} User data and authentication token
     * @throws {Error} If authentication fails
     */
    login: async (credentials) => {
        const response = await fetch(`${API_URL}/users/login`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(credentials),
        });
        return handleResponse(response);
    },

    /**
     * Registers a new user
     * @param {Object} credentials - New user registration data
     * @param {string} credentials.email - User's email
     * @param {string} credentials.password - User's password
     * @param {string} credentials.name - User's full name
     * @returns {Promise<Object>} Created user data and authentication token
     * @throws {Error} If registration fails
     */
    register: async (credentials) => {
        const response = await fetch(`${API_URL}/users/register`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(credentials),
        });
        return handleResponse(response);
    },
};

/**
 * Journal service for managing user journal entries
 * @namespace
 */
const journalService = {
    /**
     * Creates a new journal entry
     * @param {string} content - The journal entry content
     * @returns {Promise<Object>} Created journal entry with AI analysis
     * @throws {Error} If creation fails or daily entry already exists
     */
    createEntry: async (content) => {
        const response = await fetch(`${API_URL}/users/journal`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${localStorage.getItem('token')}`
            },
            body: JSON.stringify({ content })
        });
        return handleResponse(response);
    },

    /**
     * Retrieves user's journal entries
     * @returns {Promise<Array>} List of journal entries sorted by date
     * @throws {Error} If fetching fails
     */
    getEntries: async () => {
        const response = await fetch(`${API_URL}/users/journals`, {
            headers: {
                'Authorization': `Bearer ${localStorage.getItem('token')}`
            }
        });
        return handleResponse(response);
    },

    /**
     * Updates an existing journal entry
     * @param {string} id - The journal entry ID
     * @param {string} content - The updated journal entry content
     * @returns {Promise<Object>} Updated journal entry
     * @throws {Error} If update fails
     */
    updateEntry: async (id, content) => {
        const response = await fetch(`${API_URL}/users/journal/${id}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${localStorage.getItem('token')}`
            },
            body: JSON.stringify({ content })
        });
        return handleResponse(response);
    }
};

const dashboardService = {
  
    recommendation: async (scores) => {
        const response = await fetch(`${API_URL}/dashboard/getRecommendation`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${localStorage.getItem('token')}`
            },
            body: JSON.stringify(scores),
        });
        return handleResponse(response);
    }
};

/**
 * User service for managing user data
 * @namespace
 */
const userService = {
    /**
     * Retrieves user's total accumulated points
     * @returns {Promise<Object>} User's total points by category
     * @throws {Error} If fetching fails
     */
    getTotalPoints: async () => {
        console.log("[DEBUG] api.js - Calling getTotalPoints");
        try {
            const response = await fetch(`${API_URL}/users/points`, {
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('token')}`
                }
            });
            
            if (!response.ok) {
                const errorData = await response.json();
                console.error("[ERROR] getTotalPoints failed:", errorData);
                throw new Error(errorData.error || `Failed with status: ${response.status}`);
            }
            
            const data = await response.json();
            
            // Validate the data structure
            if (!data.points) {
                console.error("[ERROR] getTotalPoints: Invalid response format", data);
                throw new Error("Invalid response format: 'points' field missing");
            }
            
            console.log("[DEBUG] api.js - Points received:", data);
            return data;
        } catch (error) {
            console.error("[ERROR] getTotalPoints exception:", error);
            throw error;
        }
    },
    
    /**
     * Gets detailed point information for debugging
     * @returns {Promise<Object>} User's points data for debugging
     * @throws {Error} If fetching fails
     */
    getPointsDebug: async () => {
        console.log("[DEBUG] api.js - Calling getPointsDebug");
        const response = await fetch(`${API_URL}/users/points-debug`, {
            headers: {
                'Authorization': `Bearer ${localStorage.getItem('token')}`
            }
        });
        return handleResponse(response);
    },
    
    /**
     * Updates user's total points with new values
     * @param {Object} points - Points to add to user's total by category
     * @returns {Promise<Object>} Updated user's total points
     * @throws {Error} If update fails
     */
    updatePoints: async (points) => {
        const response = await fetch(`${API_URL}/users/update-points`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${localStorage.getItem('token')}`
            },
            body: JSON.stringify({ points })
        });
        return handleResponse(response);
    },

    deleteAccount: async () => {
        const response = await fetch(`${API_URL}/users/profile`, {
            method: 'DELETE',
            headers: {
                'Authorization': `Bearer ${localStorage.getItem('token')}`,
                'Content-Type': 'application/json'
            }
        });

        if (!response.ok) {
            const data = await response.json();
            throw new Error(data.message || 'Failed to delete account');
        }

        return await response.json();
    },

    /**
     * Gets user's current streak information
     * @returns {Promise<Object>} User's streak data
     * @throws {Error} If fetching fails
     */
    getStreak: async () => {
        const response = await fetch(`${API_URL}/users/streak`, {
            headers: {
                'Authorization': `Bearer ${localStorage.getItem('token')}`
            }
        });
        return handleResponse(response);
    },

    getUserData: async () => {
        const response = await fetch(`${API_URL}/users/profile`, {
            headers: {
                'Authorization': `Bearer ${localStorage.getItem('token')}`
            }
        });
        return handleResponse(response);
    },

    updateProfile: async (profileData) => {
        const response = await fetch(`${API_URL}/users/profile`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${localStorage.getItem('token')}`
            },
            body: JSON.stringify({
                username: profileData.username,
                currentPassword: profileData.currentPassword || undefined,
                newPassword: profileData.newPassword || undefined
            })
        });
        return handleResponse(response);
    },
};

const ActivityReportService = {
    getTodaysEntry: async () => {
        const response = await fetch(`${API_URL}/activityRepo/journal`, {
            headers: {
                'Authorization': `Bearer ${localStorage.getItem('token')}`
            },
        });
        return handleResponse(response);
    },

    getActivities: async (diaryEntry) => {
        const response = await fetch(`${API_URL}/activityRepo/activity`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${localStorage.getItem('token')}`
            },
            body: JSON.stringify({entry: diaryEntry}),
        });
        return handleResponse(response);
    },

    savePoints: async (points, activities, isRecalculation = false, previousPoints = null, pointsAlreadySubtracted = false) => {
        try {
            const response = await fetch(`${API_URL}/activityRepo/points`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${localStorage.getItem('token')}`
                },
                body: JSON.stringify({ 
                    points, 
                    activities,
                    isRecalculation,
                    previousPoints,
                    pointsAlreadySubtracted
                }),
            });
            return handleResponse(response);
        } catch (error) {
            console.error("Error saving points:", error);
            throw error;
        }
    },

    getWeeklyPoints: async () => {
        const response = await fetch(`${API_URL}/activityRepo/weekly-points`, {
            headers: {
                'Authorization': `Bearer ${localStorage.getItem('token')}`
            },
        });
        return handleResponse(response);
    },

    resetProcessingFlag: async () => {
        const response = await fetch(`${API_URL}/activityRepo/reset-processing`, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${localStorage.getItem('token')}`
            },
        });
        return handleResponse(response);
    },
};

/**
 * Friends service for managing user friendship relationships
 * @namespace
 */
const friendsService = {
    /**
     * Send a friend request to another user
     * @param {string} recipientId - The ID of the recipient user
     * @returns {Promise<Object>} Friend request result
     * @throws {Error} If sending fails
     */
    sendRequest: async (recipientId) => {
        const response = await fetch(`${API_URL}/friends/request`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${localStorage.getItem('token')}`
            },
            body: JSON.stringify({ recipientId })
        });
        return handleResponse(response);
    },

    /**
     * Get all friends for the current user
     * @returns {Promise<Array>} List of friends
     * @throws {Error} If fetching fails
     */
    getFriends: async () => {
        const response = await fetch(`${API_URL}/friends`, {
            headers: {
                'Authorization': `Bearer ${localStorage.getItem('token')}`
            }
        });
        return handleResponse(response);
    },

    /**
     * Get all friend requests for the current user
     * @returns {Promise<Object>} Object containing received and sent requests
     * @throws {Error} If fetching fails
     */
    getRequests: async () => {
        const response = await fetch(`${API_URL}/friends/requests`, {
            headers: {
                'Authorization': `Bearer ${localStorage.getItem('token')}`
            }
        });
        return handleResponse(response);
    },

    /**
     * Accept a friend request
     * @param {string} requestId - The ID of the friend request
     * @returns {Promise<Object>} Result of acceptance
     * @throws {Error} If acceptance fails
     */
    acceptRequest: async (requestId) => {
        const response = await fetch(`${API_URL}/friends/request/${requestId}/accept`, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${localStorage.getItem('token')}`
            }
        });
        return handleResponse(response);
    },

    /**
     * Reject a friend request
     * @param {string} requestId - The ID of the friend request
     * @returns {Promise<Object>} Result of rejection
     * @throws {Error} If rejection fails
     */
    rejectRequest: (requestId) => {
        return apiClient.post(`/friends/request/${requestId}/reject`);
    },

    /**
     * Cancel a friend request
     * @param {string} requestId - The ID of the friend request
     * @returns {Promise<Object>} Result of cancellation
     * @throws {Error} If cancellation fails
     */
    cancelRequest: async (requestId) => {
        const response = await fetch(`${API_URL}/friends/request/${requestId}`, {
            method: 'DELETE',
            headers: {
                'Authorization': `Bearer ${localStorage.getItem('token')}`
            }
        });
        return handleResponse(response);
    },

    /**
     * Remove a friend
     * @param {string} friendId - The ID of the friend to remove
     * @returns {Promise<Object>} Result of removal
     * @throws {Error} If removal fails
     */
    removeFriend: async (friendId) => {
        const response = await fetch(`${API_URL}/friends/${friendId}`, {
            method: 'DELETE',
            headers: {
                'Authorization': `Bearer ${localStorage.getItem('token')}`
            }
        });
        return handleResponse(response);
    },

    /**
     * Search for users
     * @param {string} query - The search term
     * @returns {Promise<Array>} List of matching users
     * @throws {Error} If search fails
     */
    searchUsers: async (query) => {
        const response = await fetch(`${API_URL}/friends/search?query=${encodeURIComponent(query)}`, {
            headers: {
                'Authorization': `Bearer ${localStorage.getItem('token')}`
            }
        });
        return handleResponse(response);
    },

    getFriendDashboard: async (friendId) => {
        const response = await fetch(`${API_URL}/users/friends/${friendId}/dashboard`, {
            headers: {
                'Authorization': `Bearer ${localStorage.getItem('token')}`
            }
        });
        return handleResponse(response);
    }
};

/**
 * Handles API response and throws error if response is not ok
 * @param {Response} response - Fetch API response object
 * @returns {Promise<any>} Parsed response data
 * @throws {Error} If response is not ok
 * @private
 */
const handleResponse = async (response) => {
    const data = await response.json();
    if (!response.ok) {
        throw new Error(data.error || 'An error occurred');
    }
    return data;
};

export { 
    authService, 
    journalService, 
    dashboardService, 
    ActivityReportService, 
    userService,
    friendsService 
};
