import { Link, useNavigate } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCalendarDay, faBook, faChartSimple, faUser, faBug } from '@fortawesome/free-solid-svg-icons';
import { useTheme } from '../contexts/ThemeContext';
import { useState } from 'react';
import ThemeToggle from './ThemeToggle';
import devService from '../services/devApi';

const Navbar = () => {
  const { theme } = useTheme();
  const navigate = useNavigate();
  const [showDevOptions, setShowDevOptions] = useState(false);
  const [resetStatus, setResetStatus] = useState(null);

  const isAuthenticated = !!localStorage.getItem('token');

  // Dev env check - only show dev button in development environment
  const isDev = import.meta.env.DEV;

  const handleLogout = () => {
    localStorage.removeItem('token');
    navigate('/login');
  };

  const handleResetUserData = async () => {
    if (window.confirm('This will delete ALL your journals and reset points to 100. Continue?')) {
      try {
        setResetStatus('loading');
        const result = await devService.resetUserData();
        setResetStatus('success');
        console.log('Reset successful:', result);

        alert('User data reset successfully. Points set to 100.');

        setTimeout(() => {
          setResetStatus(null);
          window.location.reload();
        }, 3000);
      } catch (error) {
        setResetStatus('error');
        console.error('Reset failed:', error);
        alert(`Reset failed: ${error.message}`);

        setTimeout(() => {
          setResetStatus(null);
        }, 3000);
      }
    }
  };

  return (
    <nav className={`${theme.backgroundViolet} px-4 py-3 shadow-lg flex justify-between items-center`}>
      <Link to="/" className={`text-xl font-bold ${theme.textWhite}`}>
        DailyBalance
      </Link>

      {isAuthenticated && (
        <div className="flex items-center space-x-4">
          <Link to="/journal" className={`${theme.textWhite} hover:${theme.textViolet}`}>
            <FontAwesomeIcon icon={faBook} className="mr-1" /> Journal
          </Link>
          <Link to="/dashboard" className={`${theme.textWhite} hover:${theme.textViolet}`}>
            <FontAwesomeIcon icon={faChartSimple} className="mr-1" /> Dashboard
          </Link>
          <Link to="/activity" className={`${theme.textWhite} hover:${theme.textViolet}`}>
            <FontAwesomeIcon icon={faCalendarDay} className="mr-1" /> Activities
          </Link>

          <Link to="/profile" className={`${theme.textWhite} hover:${theme.textViolet}`}>
            <FontAwesomeIcon icon={faUser} className="mr-1" /> Profile
          </Link>
          {/* Theme toggle */}
          <ThemeToggle />

          {/* Dev Button - only visible in development environment */}
          {isDev && (
            <div className="relative">
              <button
                onClick={() => setShowDevOptions(!showDevOptions)}
                className="bg-gray-100 text-gray-700 px-2 py-1 rounded text-sm flex items-center hover:bg-gray-200"
              >
                <FontAwesomeIcon icon={faBug} className="mr-1" /> Dev
              </button>

              {showDevOptions && (
                <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg z-10">
                  <div className="py-1">
                    <button
                      onClick={handleResetUserData}
                      disabled={resetStatus === 'loading'}
                      className={`w-full text-left px-4 py-2 text-sm ${resetStatus === 'loading' ? 'opacity-50 cursor-not-allowed' : 'hover:bg-gray-100'
                        }`}
                    >
                      {resetStatus === 'loading' ? 'Resetting...' : 'Reset All Data (Points=100)'}
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}

          <button
            onClick={handleLogout}
            className={`bg-violet-100 text-violet-800 px-4 py-1 rounded`}
          >
            Logout
          </button>
        </div>
      )}

      {!isAuthenticated && (
        <div className="flex space-x-4">
          <Link to="/login" className="bg-violet-600 text-white px-4 py-1 rounded">
            Login
          </Link>
          <Link to="/register" className="bg-violet-100 text-violet-800 px-4 py-1 rounded">
            Register
          </Link>
        </div>
      )}
    </nav>
  );
};

export default Navbar;