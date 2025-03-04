/** Base API URL from environment variables, defaults to localhost if not set */
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';

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
    },
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
        const response = await fetch(`${API_URL}/users/points`, {
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
    }
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

    savePoints: async (points, activities) => {
        console.log("Saving points and activities:", points, activities);
        const response = await fetch(`${API_URL}/activityRepo/points`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${localStorage.getItem('token')}`
            },
            body: JSON.stringify({ 
                points, 
                activities 
            }),
        });
        return handleResponse(response);
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
        console.log("Resetting activity processing flag");
        const response = await fetch(`${API_URL}/activityRepo/reset-processing`, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${localStorage.getItem('token')}`
            },
        });
        const data = await handleResponse(response);
        console.log("Reset processing flag response:", data);
        return data;
    },
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

export { authService, journalService, dashboardService, ActivityReportService, userService };
