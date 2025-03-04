/** Base API URL from environment variables, defaults to localhost if not set */
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';

/**
 * Development/Testing service for resetting user data
 * @namespace
 */
const devService = {
  /**
   * Resets all user data (journals and points)
   * @returns {Promise<Object>} Reset status and updated points
   * @throws {Error} If reset fails
   */
  resetUserData: async () => {
    try {
      const response = await fetch(`${API_URL}/dev/reset-user-data`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
          'Content-Type': 'application/json'
        }
      });
      
      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Failed to reset user data');
      }
      
      return await response.json();
    } catch (error) {
      console.error('Error in dev reset:', error);
      throw error;
    }
  }
};

export default devService;
