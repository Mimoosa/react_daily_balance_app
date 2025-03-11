import React, { createContext, useContext, useState, useEffect } from 'react';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check if user is logged in by verifying the token
    const checkAuth = async () => {
      try {
        const token = localStorage.getItem('token');
        console.log('[AuthContext] Initial auth check, token:', token); // Debug log

        if (!token) {
          console.log('[AuthContext] No token found'); // Debug log
          setIsAuthenticated(false);
          setUser(null);
          localStorage.removeItem('username'); // Clear username from localStorage
          setLoading(false);
          return;
        }

        const response = await fetch('/api/auth/verify', {
          headers: {
            Authorization: `Bearer ${token}`
          }
        });

        if (response.ok) {
          const data = await response.json();
          console.log('[AuthContext] Auth verification successful:', data); // Debug log
          setUser(data.user);
          localStorage.setItem('username', data.user.username); // Update username in localStorage
          setIsAuthenticated(true);
        } else {
          console.log('[AuthContext] Auth verification failed, clearing token'); // Debug log
          localStorage.removeItem('token');
          localStorage.removeItem('username'); // Clear username from localStorage
          setUser(null);
          setIsAuthenticated(false);
        }
      } catch (error) {
        console.error('[AuthContext] Auth check error:', error);
        localStorage.removeItem('token');
        localStorage.removeItem('username'); // Clear username from localStorage
        setUser(null);
        setIsAuthenticated(false);
      } finally {
        setLoading(false);
      }
    };

    checkAuth();
  }, []);

  const login = (token, userData) => {
    console.log('[AuthContext] Login called with:', { token, userData }); // Debug log
    localStorage.setItem('token', token);
    localStorage.setItem('username', userData.username); // Store username
    setUser(userData);
    setIsAuthenticated(true);
    console.log('[AuthContext] State updated:', { isAuthenticated: true, user: userData }); // Debug log
  };

  const logout = () => {
    console.log('[AuthContext] Logout called'); // Debug log
    localStorage.removeItem('token');
    localStorage.removeItem('username'); // Clear username from localStorage
    setUser(null);
    setIsAuthenticated(false);
  };

  // Add debug log for render
  console.log('[AuthContext] Rendering with state:', { isAuthenticated, user, loading });

  return (
    <AuthContext.Provider value={{ isAuthenticated, user, loading, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}; 