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
        console.error('[ERROR] Dev Reset failed:', data);
        throw new Error(data.error || 'Failed to reset user data');
      }
      
      const data = await response.json();
      console.log('[DEBUG] Dev Reset success:', data);
      return data;
    } catch (error) {
      console.error('[ERROR] Dev Reset error:', error);
      throw error;
    }
  },
  
  /**
   * Debug and repair user points structure
   * @returns {Promise<Object>} Debug information and repair status
   * @throws {Error} If the operation fails
   */
  debugPoints: async () => {
    try {
      const response = await fetch(`${API_URL}/dev/debug-points`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
          'Content-Type': 'application/json'
        }
      });
      
      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Failed to debug user points');
      }
      
      return await response.json();
    } catch (error) {
      console.error('Error in points debug:', error);
      throw error;
    }
  }
};

export default devService;
